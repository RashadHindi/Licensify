<?php
/**
 * Send feedback from trainer to student.
 * POST /backend/feedback/send_feedback.php
 */

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'trainer') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated as trainer.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$studentId = $data['student_id'] ?? 0;
$message = trim($data['message'] ?? '');
$trainerId = $_SESSION['user']['id'];

if (!$studentId || !$message) {
    echo json_encode(['success' => false, 'message' => 'Student and message are required.']);
    exit;
}

try {
    // Ensure trainer_feedback table exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `trainer_feedback` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `trainer_id` INT NOT NULL,
            `student_id` INT NOT NULL,
            `message` TEXT NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`trainer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    $stmt = $pdo->prepare("INSERT INTO trainer_feedback (trainer_id, student_id, message) VALUES (?, ?, ?)");
    $stmt->execute([$trainerId, $studentId, $message]);

    echo json_encode(['success' => true, 'message' => 'Feedback sent successfully!']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
