<?php
/**
 * Delete an exam.
 * POST /backend/exams/delete_exam.php
 */

session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

// Check if user is logged in and is admin/trainer
if (!isset($_SESSION['user']) || ($_SESSION['user']['role'] !== 'admin' && $_SESSION['user']['role'] !== 'trainer')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Only admins and trainers can delete exams.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$examId = $data['id'] ?? null;

if (!$examId) {
    echo json_encode(['success' => false, 'message' => 'Exam ID is required.']);
    exit;
}

try {
    // ON DELETE CASCADE in database will handle the questions automatically
    $stmt = $pdo->prepare("DELETE FROM exams WHERE id = ?");
    $stmt->execute([$examId]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Exam and its questions deleted successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Exam not found or already deleted.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
