<?php
/**
 * Cancel a reservation for the logged-in student.
 * POST /backend/schedule/cancel_student_reservation.php
 */

session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated as student.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$reservationId = (int) ($data['id'] ?? 0);
$studentId = $_SESSION['user']['id'];

if (!$reservationId) {
    echo json_encode(['success' => false, 'message' => 'Reservation ID required.']);
    exit;
}

// Ensure the reservation belongs to the student and isn't already past/completed
$stmt = $pdo->prepare("SELECT id FROM reservations WHERE id = ? AND student_id = ?");
$stmt->execute([$reservationId, $studentId]);
if (!$stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Invalid reservation.']);
    exit;
}

$stmt = $pdo->prepare("UPDATE reservations SET status = 'Cancelled' WHERE id = ? AND student_id = ?");
if ($stmt->execute([$reservationId, $studentId])) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to cancel reservation.']);
}
