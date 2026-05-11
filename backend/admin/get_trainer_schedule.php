<?php
/**
 * Get reservations for a specific trainer by their ID or email.
 * GET /backend/admin/get_trainer_schedule.php?email=...
 */

session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/db.php';

$email = $_GET['email'] ?? '';

if (!$email) {
    echo json_encode(['success' => false, 'message' => 'Trainer email required.']);
    exit;
}

try {
    // Get trainer ID
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND role = 'trainer'");
    $stmt->execute([$email]);
    $trainerId = $stmt->fetchColumn();

    if (!$trainerId) {
        echo json_encode(['success' => false, 'message' => 'Trainer not found.']);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT r.id, r.date, r.time, r.status, s.fname AS student_fname, s.lname AS student_lname 
        FROM reservations r
        JOIN users s ON r.student_id = s.id
        WHERE r.trainer_id = ?
        ORDER BY r.date DESC, STR_TO_DATE(r.time, '%h:%i %p') DESC
    ");
    $stmt->execute([$trainerId]);
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = [];
    foreach ($reservations as $r) {
        $formatted[] = [
            'id'          => $r['id'],
            'date'        => $r['date'],
            'time'        => $r['time'],
            'status'      => $r['status'],
            'studentName' => $r['student_fname'] . ' ' . $r['student_lname']
        ];
    }

    echo json_encode(['success' => true, 'reservations' => $formatted]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
