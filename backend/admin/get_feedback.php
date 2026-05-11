<?php
/**
 * Get all student reviews.
 * GET /backend/admin/get_feedback.php
 */

session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/db.php';

try {
    $stmt = $pdo->prepare("
        SELECT r.id, r.rating, r.review AS comment, r.created_at AS date,
               s.fname AS student_fname, s.lname AS student_lname,
               t.fname AS trainer_fname, t.lname AS trainer_lname
        FROM student_reviews r
        JOIN users s ON r.student_id = s.id
        JOIN users t ON r.trainer_id = t.id
        ORDER BY r.created_at DESC
    ");
    $stmt->execute();
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = [];
    foreach ($reviews as $r) {
        $formatted[] = [
            'id'          => $r['id'],
            'rating'      => (int)$r['rating'],
            'comment'     => $r['comment'],
            'date'        => $r['date'],
            'studentName' => $r['student_fname'] . ' ' . $r['student_lname'],
            'trainerName' => $r['trainer_fname'] . ' ' . $r['trainer_lname']
        ];
    }

    // Also get all trainers for the filter dropdown
    $stmt2 = $pdo->prepare("SELECT id, fname, lname FROM users WHERE role = 'trainer'");
    $stmt2->execute();
    $trainers = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'feedback' => $formatted, 'trainers' => $trainers]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
