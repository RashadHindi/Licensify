<?php
/**
 * Reschedule an existing reservation for the logged-in student.
 * POST /backend/schedule/reschedule.php
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
$reservationId = (int) ($data['reservation_id'] ?? 0);
$trainerId = (int) ($data['trainer_id'] ?? 0);
$date = $data['date'] ?? '';
$time = $data['time'] ?? '';
$studentId = $_SESSION['user']['id'];

if (!$reservationId || !$trainerId || !$date || !$time) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

try {
    // Check if the reservation belongs to the student and is not cancelled/completed
    $stmt = $pdo->prepare("SELECT id FROM reservations WHERE id = ? AND student_id = ? AND status = 'Upcoming'");
    $stmt->execute([$reservationId, $studentId]);
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Invalid or already processed reservation.']);
        exit;
    }

    // Check if the new time slot is already booked for this trainer
    $stmt = $pdo->prepare("SELECT id FROM reservations WHERE trainer_id = ? AND date = ? AND time = ? AND status != 'Cancelled'");
    $stmt->execute([$trainerId, $date, $time]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'This slot is no longer available.']);
        exit;
    }

    // Check if it's a day off or slot off
    $stmt = $pdo->prepare("SELECT type, slot_hour FROM trainer_availability WHERE trainer_id = ? AND date = ?");
    $stmt->execute([$trainerId, $date]);
    $availability = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($availability as $avail) {
        if ($avail['type'] === 'day_off') {
            echo json_encode(['success' => false, 'message' => 'Trainer is not available on this date.']);
            exit;
        } elseif ($avail['type'] === 'slot_off' && $avail['slot_hour'] === $time) {
            echo json_encode(['success' => false, 'message' => 'This slot is no longer available.']);
            exit;
        }
    }

    // Update the reservation
    $stmt = $pdo->prepare("UPDATE reservations SET trainer_id = ?, date = ?, time = ? WHERE id = ? AND student_id = ?");
    if ($stmt->execute([$trainerId, $date, $time, $reservationId, $studentId])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to reschedule.']);
    }

} catch (PDOException $e) {
    // Unique constraint violation for duplicate slot
    if ($e->getCode() == 23000) {
        echo json_encode(['success' => false, 'message' => 'You already have a booking at this time.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error.']);
    }
}
