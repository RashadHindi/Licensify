<?php
/**
 * Toggle full day off for a trainer.
 * POST /backend/schedule/set_day_off.php
 * 
 * Expects JSON body: { date, day_off }
 *   - date: "2026-05-10"
 *   - day_off: true (set day off) or false (remove day off)
 * 
 * When setting day off, also clears any individual slot_off entries for that date.
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

$data      = json_decode(file_get_contents('php://input'), true);
$trainerId = $_SESSION['user']['id'];
$date      = trim($data['date'] ?? '');
$dayOff    = (bool) ($data['day_off'] ?? false);

if (!$date) {
    echo json_encode(['success' => false, 'message' => 'Date is required.']);
    exit;
}

if ($dayOff) {
    // Clear any individual slot_off entries for this date first
    $stmt = $pdo->prepare('DELETE FROM trainer_availability WHERE trainer_id = ? AND date = ? AND type = ?');
    $stmt->execute([$trainerId, $date, 'slot_off']);

    // Insert day_off entry (ignore if already exists)
    $stmt = $pdo->prepare('INSERT IGNORE INTO trainer_availability (trainer_id, date, type, slot_hour) VALUES (?, ?, ?, NULL)');
    $stmt->execute([$trainerId, $date, 'day_off']);

    echo json_encode(['success' => true, 'message' => "$date marked as day off."]);
} else {
    // Remove day_off entry
    $stmt = $pdo->prepare('DELETE FROM trainer_availability WHERE trainer_id = ? AND date = ? AND type = ?');
    $stmt->execute([$trainerId, $date, 'day_off']);

    echo json_encode(['success' => true, 'message' => "Day off removed for $date."]);
}
