<?php
/**
 * Create a new mock exam with questions.
 * POST /backend/exams/create_exam.php
 */

session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

// Check if user is logged in and is admin/trainer
if (!isset($_SESSION['user']) || ($_SESSION['user']['role'] !== 'admin' && $_SESSION['user']['role'] !== 'trainer')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Only admins and trainers can create exams.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$title = $data['title'] ?? 'Mock Theory Exam';
$category = $data['category'] ?? '';
$questions = $data['questions'] ?? [];
$creatorId = $_SESSION['user']['id'];

if (empty($category) || empty($questions)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Category and questions are required. Received: ' . json_encode(['cat' => $category, 'q_count' => count($questions)])]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Insert Exam Metadata
    $stmt = $pdo->prepare("INSERT INTO exams (title, category, creator_id) VALUES (?, ?, ?)");
    $res = $stmt->execute([$title, $category, $creatorId]);
    
    if (!$res) {
        throw new Exception("Failed to insert exam metadata.");
    }
    
    $examId = $pdo->lastInsertId();

    // 2. Insert Questions
    $qStmt = $pdo->prepare("INSERT INTO exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    $insertedCount = 0;
    foreach ($questions as $q) {
        $qRes = $qStmt->execute([
            $examId,
            $q['text'],
            $q['options'][0],
            $q['options'][1],
            $q['options'][2],
            $q['options'][3],
            $q['correctAnswer'],
            $q['explanation']
        ]);
        if (!$qRes) {
            $errorInfo = $qStmt->errorInfo();
            throw new Exception("Failed to insert question: " . $q['text'] . " Error: " . $errorInfo[2]);
        }
        $insertedCount++;
    }

    if ($insertedCount === 0) {
        throw new Exception("No questions were processed for insertion.");
    }

    // 3. Notify all students
    $studentStmt = $pdo->prepare("SELECT id FROM users WHERE role = 'student'");
    $studentStmt->execute();
    $students = $studentStmt->fetchAll();

    $notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type, icon, color) VALUES (?, ?, ?, ?, ?, ?)");
    
    $notifTitle = "New Practice Exam Available";
    $notifMsg = "A new $title for " . ucfirst($category) . " has been published. Good luck!";
    $notifType = "booking";
    $notifIcon = "bi-journal-check";
    $notifColor = "text-success";

    foreach ($students as $student) {
        $notifStmt->execute([
            $student['id'],
            $notifTitle,
            $notifMsg,
            $notifType,
            $notifIcon,
            $notifColor
        ]);
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'exam_id' => $examId, 'message' => 'Exam created and students notified successfully.']);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
