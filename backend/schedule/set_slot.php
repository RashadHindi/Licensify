<?php
/**
 * Set a specific slot as unavailable or available for the logged-in trainer.
 * POST /backend/schedule/set_slot.php
 */

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'trainer') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated as trainer.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$date = $data['date'] ?? '';
$slotHour = $data['slot_hour'] ?? '';
$unavailable = $data['unavailable'] ?? false;
$trainerId = $_SESSION['user']['id'];

if (!$date || !$slotHour) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

try {
    if ($unavailable) {
        $stmt = $pdo->prepare("INSERT IGNORE INTO trainer_availability (trainer_id, date, type, slot_hour) VALUES (?, ?, 'slot_off', ?)");
        $stmt->execute([$trainerId, $date, $slotHour]);
    } else {
        $stmt = $pdo->prepare("DELETE FROM trainer_availability WHERE trainer_id = ? AND date = ? AND type = 'slot_off' AND slot_hour = ?");
        $stmt->execute([$trainerId, $date, $slotHour]);
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
