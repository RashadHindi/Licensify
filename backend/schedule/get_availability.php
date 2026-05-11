<?php
/**
 * Get available/unavailable slots for the logged-in trainer on a specific date.
 * GET /backend/schedule/get_availability.php?date=2026-05-10
 */

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'trainer') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated as trainer.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$trainerId = $_SESSION['user']['id'];
$date = $_GET['date'] ?? '';

if (!$date) {
    echo json_encode(['success' => false, 'message' => 'Missing date.']);
    exit;
}

$stmt = $pdo->prepare("SELECT type, slot_hour FROM trainer_availability WHERE trainer_id = ? AND date = ?");
$stmt->execute([$trainerId, $date]);
$availability = $stmt->fetchAll(PDO::FETCH_ASSOC);

$isDayOff = false;
$unavailableSlots = [];

foreach ($availability as $avail) {
    if ($avail['type'] === 'day_off') {
        $isDayOff = true;
        break;
    } elseif ($avail['type'] === 'slot_off' && $avail['slot_hour']) {
        $unavailableSlots[] = $avail['slot_hour'];
    }
}

echo json_encode([
    'success' => true,
    'is_day_off' => $isDayOff,
    'unavailable_slots' => $unavailableSlots
]);
