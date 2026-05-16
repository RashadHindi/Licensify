<?php
/**
 * Submit a rating and review for a trainer.
 * POST /backend/feedback/rate_trainer.php
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
$trainerId = (int) ($data['trainer_id'] ?? 0);
$rating = (int) ($data['rating'] ?? 0);
$review = trim($data['review'] ?? '');
$studentId = $_SESSION['user']['id'];

if (!$trainerId || $rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Invalid rating data.']);
    exit;
}

try {
    // Insert or update the review
    $stmt = $pdo->prepare("
        INSERT INTO student_reviews (trainer_id, student_id, rating, review) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review)
    ");
    $stmt->execute([$trainerId, $studentId, $rating, $review]);

    // Recalculate average rating for the trainer
    $stmt = $pdo->prepare("
        SELECT AVG(rating) as avg_rating, COUNT(id) as total_reviews 
        FROM student_reviews 
        WHERE trainer_id = ?
    ");
    $stmt->execute([$trainerId]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    $avgRating = $stats['avg_rating'] ? (float) $stats['avg_rating'] : 0.0;
    $totalReviews = (int) $stats['total_reviews'];

    // Update the users table
    $stmt = $pdo->prepare("UPDATE users SET rating = ?, reviews = ? WHERE id = ?");
    $stmt->execute([$avgRating, $totalReviews, $trainerId]);

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
