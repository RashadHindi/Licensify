<?php
/**
 * Get dashboard stats for the admin.
 * GET /backend/admin/get_dashboard_stats.php
 */

session_start();
header('Content-Type: application/json');

// if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
//     http_response_code(401);
//     echo json_encode(['success' => false, 'message' => 'Not authenticated as admin.']);
//     exit;
// }

require_once __DIR__ . '/../config/db.php';

try {
    // 1. Total Students
    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'student'");
    $totalStudents = (int) $stmt->fetchColumn();

    // 2. Total Trainers
    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'trainer'");
    $totalTrainers = (int) $stmt->fetchColumn();

    // 3. Total Reservations
    $stmt = $pdo->query("SELECT COUNT(*) FROM reservations");
    $totalReservations = (int) $stmt->fetchColumn();

    // 3.5 Total Exams
    $stmt = $pdo->query("SELECT COUNT(*) FROM exams");
    $totalExams = (int) $stmt->fetchColumn();

    // 4. Recent Reservations (last 5)
    $stmt = $pdo->query("
        SELECT r.id, r.status, 
               CONCAT(s.fname, ' ', s.lname) as studentName,
               CONCAT(t.fname, ' ', t.lname) as trainerName
        FROM reservations r
        JOIN users s ON r.student_id = s.id
        JOIN users t ON r.trainer_id = t.id
        ORDER BY r.created_at DESC
        LIMIT 5
    ");
    $recentReservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. Trainer Distribution (Most Booked Trainers) - completed and upcoming
    $stmt = $pdo->query("
        SELECT CONCAT(t.fname, ' ', t.lname) as name, 
               COUNT(r.id) as count,
               SUM(CASE WHEN r.status = 'Completed' THEN 1 ELSE 0 END) as completed_count,
               SUM(CASE WHEN r.status = 'Upcoming' THEN 1 ELSE 0 END) as upcoming_count
        FROM reservations r
        JOIN users t ON r.trainer_id = t.id
        WHERE r.status != 'Cancelled'
        GROUP BY t.id
        ORDER BY count DESC
    ");
    $trainerDistribution = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'stats' => [
            'students' => $totalStudents,
            'trainers' => $totalTrainers,
            'reservations' => $totalReservations,
            'exams' => $totalExams
        ],
        'recent_reservations' => $recentReservations,
        'trainer_distribution' => $trainerDistribution
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
