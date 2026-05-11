<?php
/**
 * Get available/unavailable slots for a trainer on a specific date.
 * GET /backend/schedule/get_trainer_slots.php?trainer_id=2&date=2026-05-10
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/../config/db.php';

$trainerId = $_GET['trainer_id'] ?? 0;
$date = $_GET['date'] ?? '';

if (!$trainerId || !$date) {
    echo json_encode(['success' => false, 'message' => 'Missing trainer_id or date.']);
    exit;
}

// Check for day off or specific slot off
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

// Check for already booked reservations
$stmt = $pdo->prepare("SELECT time FROM reservations WHERE trainer_id = ? AND date = ? AND status != 'Cancelled'");
$stmt->execute([$trainerId, $date]);
$reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

$bookedSlots = [];
foreach ($reservations as $res) {
    $bookedSlots[] = $res['time'];
}

echo json_encode([
    'success' => true,
    'is_day_off' => $isDayOff,
    'unavailable_slots' => $unavailableSlots,
    'booked_slots' => $bookedSlots
]);
