<?php
/**
 * Get dashboard summary for the logged-in trainer.
 * GET /backend/schedule/get_trainer_dashboard.php
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
$today = date('Y-m-d');
$nowTime = date('H:i'); // rough comparison

try {
    // Total distinct students
    $stmt = $pdo->prepare("SELECT COUNT(DISTINCT student_id) FROM reservations WHERE trainer_id = ? AND status != 'Cancelled'");
    $stmt->execute([$trainerId]);
    $totalStudents = (int) $stmt->fetchColumn();

    // Lessons today
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM reservations WHERE trainer_id = ? AND date = ? AND status != 'Cancelled'");
    $stmt->execute([$trainerId, $today]);
    $lessonsToday = (int) $stmt->fetchColumn();

    // Next lesson (upcoming)
    $stmt = $pdo->prepare("
        SELECT date, time 
        FROM reservations 
        WHERE trainer_id = ? 
          AND status = 'Upcoming'
          AND (date > ? OR (date = ? AND STR_TO_DATE(time, '%h:%i %p') >= STR_TO_DATE(?, '%H:%i')))
        ORDER BY date ASC, STR_TO_DATE(time, '%h:%i %p') ASC 
        LIMIT 1
    ");
    $stmt->execute([$trainerId, $today, $today, $nowTime]);
    $nextLesson = $stmt->fetch(PDO::FETCH_ASSOC);

    // Trainer rating
    $stmt = $pdo->prepare("SELECT rating FROM users WHERE id = ?");
    $stmt->execute([$trainerId]);
    $avgRating = (float) $stmt->fetchColumn();

    // Today's lessons list
    $stmt = $pdo->prepare("
        SELECT r.time, s.fname, s.lname 
        FROM reservations r
        JOIN users s ON r.student_id = s.id
        WHERE r.trainer_id = ? AND r.date = ? AND r.status != 'Cancelled'
        ORDER BY STR_TO_DATE(r.time, '%h:%i %p') ASC
    ");
    $stmt->execute([$trainerId, $today]);
    $todayRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $todayLessons = [];
    foreach ($todayRows as $row) {
        $todayLessons[] = [
            'time' => $row['time'],
            'studentName' => $row['fname'] . ' ' . $row['lname']
        ];
    }

    // All distinct students for feedback select
    $stmt = $pdo->prepare("
        SELECT DISTINCT s.id, s.fname, s.lname 
        FROM reservations r
        JOIN users s ON r.student_id = s.id
        WHERE r.trainer_id = ? AND r.status != 'Cancelled'
        ORDER BY s.fname, s.lname
    ");
    $stmt->execute([$trainerId]);
    $allStudents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'total_students' => $totalStudents,
        'lessons_today' => $lessonsToday,
        'next_lesson_date' => $nextLesson ? $nextLesson['date'] : null,
        'next_lesson_time' => $nextLesson ? $nextLesson['time'] : null,
        'avg_rating' => $avgRating,
        'today_lessons' => $todayLessons,
        'all_students' => $allStudents
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
