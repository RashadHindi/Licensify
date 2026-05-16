<?php
/**
 * Get distinct students that have booked with the logged-in trainer.
 * GET /backend/schedule/get_trainer_students.php
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

try {
    // Fetch distinct students and their total lessons with this trainer
    $stmt = $pdo->prepare("
        SELECT 
            s.id AS student_id,
            s.fname,
            s.lname,
            COUNT(r.id) AS total_lessons
        FROM reservations r
        JOIN users s ON r.student_id = s.id
        WHERE r.trainer_id = ? AND r.status != 'Cancelled'
        GROUP BY s.id, s.fname, s.lname
        ORDER BY s.fname ASC
    ");
    $stmt->execute([$trainerId]);
    $studentRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $students = [];
    foreach ($studentRows as $row) {
        $studentId = $row['student_id'];
        
        // Get last feedback
        $fbStmt = $pdo->prepare("SELECT message, created_at FROM trainer_feedback WHERE trainer_id = ? AND student_id = ? ORDER BY created_at DESC LIMIT 1");
        $fbStmt->execute([$trainerId, $studentId]);
        $fb = $fbStmt->fetch(PDO::FETCH_ASSOC);

        $students[] = [
            'id' => $studentId,
            'studentName' => $row['fname'] . ' ' . $row['lname'],
            'totalLessons' => (int) $row['total_lessons'],
            'lastFeedback' => $fb ? $fb['message'] : null,
            'lastFeedbackDate' => $fb ? date('M j, Y', strtotime($fb['created_at'])) : null
        ];
    }

    echo json_encode([
        'success' => true,
        'students' => $students
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
