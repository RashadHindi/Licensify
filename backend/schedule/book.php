<?php
/**
 * Create a new reservation (booking).
 * POST /backend/schedule/book.php
 * 
 * Expects JSON body: { trainer_id, date, time }
 * Returns JSON: { success, message, reservation }
 * Requires an active PHP session (student must be logged in).
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
    echo json_encode(['success' => false, 'message' => 'You must be logged in to book a lesson.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$data      = json_decode(file_get_contents('php://input'), true);
$studentId = $_SESSION['user']['id'];
$trainerId = (int) ($data['trainer_id'] ?? 0);
$date      = trim($data['date'] ?? '');
$time      = trim($data['time'] ?? '');

if (!$trainerId || !$date || !$time) {
    echo json_encode(['success' => false, 'message' => 'Trainer, date, and time are all required.']);
    exit;
}

// Validate time slot
$validHours = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM'];
if (!in_array($time, $validHours)) {
    echo json_encode(['success' => false, 'message' => 'Invalid time slot.']);
    exit;
}

// Ensure the slot hasn't passed if booking for today
$todayStr = date('Y-m-d');
if ($date < $todayStr) {
    echo json_encode(['success' => false, 'message' => 'Cannot book in the past.']);
    exit;
}
if ($date === $todayStr) {
    $slotTimestamp = strtotime("$date $time");
    if (time() > $slotTimestamp) {
        echo json_encode(['success' => false, 'message' => 'This time slot has already passed today.']);
        exit;
    }
}

// Check trainer exists and is actually a trainer
$stmt = $pdo->prepare("SELECT id, fname, lname FROM users WHERE id = ? AND role = 'trainer'");
$stmt->execute([$trainerId]);
$trainer = $stmt->fetch();
if (!$trainer) {
    echo json_encode(['success' => false, 'message' => 'Trainer not found.']);
    exit;
}

// Check trainer hasn't set this day as day off
$stmt = $pdo->prepare('SELECT id FROM trainer_availability WHERE trainer_id = ? AND date = ? AND type = ?');
$stmt->execute([$trainerId, $date, 'day_off']);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'This trainer is not available on this date (day off).']);
    exit;
}

// Check trainer hasn't marked this specific slot as unavailable
$stmt = $pdo->prepare('SELECT id FROM trainer_availability WHERE trainer_id = ? AND date = ? AND type = ? AND slot_hour = ?');
$stmt->execute([$trainerId, $date, 'slot_off', $time]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'This time slot is not available.']);
    exit;
}

// Check slot isn't already booked
$stmt = $pdo->prepare("SELECT id FROM reservations WHERE trainer_id = ? AND date = ? AND time = ? AND status != 'Cancelled'");
$stmt->execute([$trainerId, $date, $time]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'This time slot is already booked. Please choose another.']);
    exit;
}

// All clear — create the reservation
$stmt = $pdo->prepare('INSERT INTO reservations (student_id, trainer_id, date, time) VALUES (?, ?, ?, ?)');
$stmt->execute([$studentId, $trainerId, $date, $time]);

$reservationId = (int) $pdo->lastInsertId();

// Add notification for the student
$notifStmt = $pdo->prepare("
    INSERT INTO notifications (user_id, title, message, type, icon, color, bg) 
    VALUES (?, ?, ?, 'booking', 'bi-calendar-check-fill', 'text-success', 'bg-success bg-opacity-10')
");
$notifStmt->execute([
    $studentId,
    'Lesson Confirmed',
    "Your lesson with {$trainer['fname']} {$trainer['lname']} on $date at $time is booked."
]);

echo json_encode([
    'success'     => true,
    'message'     => 'Lesson booked successfully!',
    'reservation' => [
        'id'           => $reservationId,
        'student_id'   => $studentId,
        'trainer_id'   => $trainerId,
        'trainer_name' => $trainer['fname'] . ' ' . $trainer['lname'],
        'date'         => $date,
        'time'         => $time,
        'status'       => 'Upcoming'
    ]
]);
