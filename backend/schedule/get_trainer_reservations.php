<?php
/**
 * Get reservations for the logged-in trainer on a specific date.
 * GET /backend/schedule/get_trainer_reservations.php?date=2026-05-10
 * 
 * Returns JSON: { success, reservations: [{ id, student_name, date, time, status }] }
 * Requires an active PHP session (trainer must be logged in).
 */

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$trainerId = $_SESSION['user']['id'];
$date      = $_GET['date'] ?? '';

if (!$date) {
    echo json_encode(['success' => false, 'message' => 'Date parameter is required.']);
    exit;
}

$stmt = $pdo->prepare("
    SELECT r.id, r.date, r.time, r.status,
           s.fname AS student_fname, s.lname AS student_lname
    FROM reservations r
    JOIN users s ON r.student_id = s.id
    WHERE r.trainer_id = ? AND r.date = ? AND r.status != 'Cancelled'
    ORDER BY r.time ASC
");
$stmt->execute([$trainerId, $date]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$reservations = [];
foreach ($rows as $row) {
    $reservations[] = [
        'id'           => (int) $row['id'],
        'date'         => $row['date'],
        'time'         => $row['time'],
        'status'       => $row['status'],
        'studentName'  => $row['student_fname'] . ' ' . $row['student_lname']
    ];
}

echo json_encode(['success' => true, 'reservations' => $reservations]);
