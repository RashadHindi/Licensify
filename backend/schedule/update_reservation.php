<?php
/**
 * Update a reservation's status (Complete or Cancel).
 * POST /backend/schedule/update_reservation.php
 * 
 * Expects JSON body: { reservation_id, status }
 *   - status: "Completed" or "Cancelled"
 * 
 * Returns JSON: { success, message }
 * Requires an active PHP session (trainer must be logged in).
 */

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$data          = json_decode(file_get_contents('php://input'), true);
$trainerId     = $_SESSION['user']['id'];
$reservationId = (int) ($data['reservation_id'] ?? 0);
$newStatus     = trim($data['status'] ?? '');

if (!$reservationId || !$newStatus) {
    echo json_encode(['success' => false, 'message' => 'reservation_id and status are required.']);
    exit;
}

// Validate status value
$validStatuses = ['Upcoming', 'Completed', 'Cancelled'];
if (!in_array($newStatus, $validStatuses)) {
    echo json_encode(['success' => false, 'message' => 'Invalid status. Must be Upcoming, Completed, or Cancelled.']);
    exit;
}

// Verify this reservation belongs to the logged-in trainer
$stmt = $pdo->prepare('SELECT id FROM reservations WHERE id = ? AND trainer_id = ?');
$stmt->execute([$reservationId, $trainerId]);
if (!$stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Reservation not found or access denied.']);
    exit;
}

// Update the status
$stmt = $pdo->prepare('UPDATE reservations SET status = ? WHERE id = ?');
$stmt->execute([$newStatus, $reservationId]);

echo json_encode([
    'success' => true,
    'message' => "Reservation marked as $newStatus."
]);
