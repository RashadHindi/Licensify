<?php
/**
 * Get all reservations.
 * GET /backend/admin/get_all_reservations.php
 */

session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/db.php';

try {
    $stmt = $pdo->prepare("
        SELECT r.id, r.date, r.time, r.status, 
               s.fname AS student_fname, s.lname AS student_lname,
               t.fname AS trainer_fname, t.lname AS trainer_lname
        FROM reservations r
        JOIN users s ON r.student_id = s.id
        JOIN users t ON r.trainer_id = t.id
        ORDER BY r.date DESC, STR_TO_DATE(r.time, '%h:%i %p') DESC
    ");
    $stmt->execute();
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = [];
    foreach ($reservations as $r) {
        $formatted[] = [
            'id'          => $r['id'],
            'date'        => $r['date'],
            'time'        => $r['time'],
            'status'      => $r['status'],
            'studentName' => $r['student_fname'] . ' ' . $r['student_lname'],
            'trainerName' => $r['trainer_fname'] . ' ' . $r['trainer_lname']
        ];
    }

    echo json_encode(['success' => true, 'reservations' => $formatted]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
