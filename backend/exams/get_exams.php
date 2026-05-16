<?php
/**
 * Unified Exam API
 * Handles categories and exams.
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$action = $_GET['action'] ?? '';

try {
    if ($action === 'categories') {
        $stmt = $pdo->query("SELECT * FROM categories");
        echo json_encode(['success' => true, 'categories' => $stmt->fetchAll()]);
        exit;
    }

    // Default: get exams by category
    $category = $_GET['category'] ?? '';
    if (empty($category)) {
        echo json_encode(['success' => false, 'message' => 'Category is required.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, title, category, creator_id, created_at FROM exams WHERE category = ? ORDER BY created_at DESC");
    $stmt->execute([$category]);
    $exams = $stmt->fetchAll();

    $result = [];
    foreach ($exams as $exam) {
        $qStmt = $pdo->prepare("SELECT * FROM exam_questions WHERE exam_id = ? ORDER BY id ASC");
        $qStmt->execute([$exam['id']]);
        $questions = $qStmt->fetchAll();

        $formattedQuestions = [];
        foreach ($questions as $q) {
            $formattedQuestions[] = [
                'id' => $q['id'],
                'text' => $q['question_text'],
                'options' => [$q['option_a'], $q['option_b'], $q['option_c'], $q['option_d']],
                'correctAnswer' => (int) $q['correct_answer'],
                'explanation' => $q['explanation']
            ];
        }

        $result[] = [
            'id' => (int) $exam['id'],
            'title' => $exam['title'],
            'category' => $exam['category'],
            'questions' => $formattedQuestions,
            'dateCreated' => $exam['created_at']
        ];
    }

    echo json_encode(['success' => true, 'exams' => $result]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
