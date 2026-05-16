<?php
/**
 * Get reservations for the logged-in student.
 * GET /backend/schedule/get_student_reservations.php
 */

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated as student.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$studentId = $_SESSION['user']['id'];

$stmt = $pdo->prepare("
    SELECT r.id, r.date, r.time, r.status, r.trainer_id, t.fname AS trainer_fname, t.lname AS trainer_lname, t.car_type
    FROM reservations r
    JOIN users t ON r.trainer_id = t.id
    WHERE r.student_id = ? AND r.status != 'Cancelled'
    ORDER BY r.date DESC, STR_TO_DATE(r.time, '%h:%i %p') DESC
");
$stmt->execute([$studentId]);
$reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

$formatted = [];
foreach ($reservations as $r) {
    $formatted[] = [
        'id'         => $r['id'],
        'date'       => $r['date'],
        'time'       => $r['time'],
        'status'     => $r['status'], // 'Upcoming' or 'Completed'
        'trainer'    => $r['trainer_fname'] . ' ' . $r['trainer_lname'],
        'trainer_id' => $r['trainer_id'],
        'car_type'   => $r['car_type'] ?: 'Manual & Auto'
    ];
}

echo json_encode(['success' => true, 'reservations' => $formatted]);
