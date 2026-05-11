<?php
/**
 * Get feedback for the logged-in student.
 * GET /backend/feedback/get_student_feedback.php
 */

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated as student.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$studentId = $_SESSION['user']['id'];

$stmt = $pdo->prepare("
    SELECT f.id, f.message, f.created_at, t.fname AS trainer_fname, t.lname AS trainer_lname, t.profile_photo AS trainer_photo
    FROM trainer_feedback f
    JOIN users t ON f.trainer_id = t.id
    WHERE f.student_id = ?
    ORDER BY f.created_at DESC
");
$stmt->execute([$studentId]);
$feedbacks = $stmt->fetchAll(PDO::FETCH_ASSOC);

$formattedFeedbacks = [];
foreach ($feedbacks as $f) {
    $formattedFeedbacks[] = [
        'id'          => $f['id'],
        'message'     => $f['message'],
        'trainerName' => $f['trainer_fname'] . ' ' . $f['trainer_lname'],
        'trainerPhoto'=> $f['trainer_photo'],
        'date'        => date('F j, Y', strtotime($f['created_at']))
    ];
}

echo json_encode(['success' => true, 'feedbacks' => $formattedFeedbacks]);
