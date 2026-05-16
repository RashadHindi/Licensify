<?php
/**
 * Get Student Study Progress API
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

session_start();

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$student_id = $_SESSION['user']['id'];

try {
    $stmt = $pdo->prepare("SELECT topic_id, status, completed_items FROM student_progress WHERE student_id = ?");
    $stmt->execute([$student_id]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $progress = [];
    foreach ($results as $row) {
        $progress[$row['topic_id']] = $row['status'];
        // Also keep completed_items if needed
        $progress[$row['topic_id'] . '_completed'] = (int)$row['completed_items'];
    }

    echo json_encode([
        'success' => true,
        'progress' => $progress
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
