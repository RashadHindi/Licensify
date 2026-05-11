<?php
/**
 * Get users by role.
 * GET /backend/admin/get_users.php?role=student
 */

session_start();
header('Content-Type: application/json');

// if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
//     http_response_code(401);
//     echo json_encode(['success' => false, 'message' => 'Not authenticated as admin.']);
//     exit;
// }

require_once __DIR__ . '/../config/db.php';

$role = $_GET['role'] ?? 'student';

try {
    $stmt = $pdo->prepare("SELECT id, fname, lname, email, phone, role, profile_photo, rating, reviews, created_at FROM users WHERE role = ? ORDER BY created_at DESC");
    $stmt->execute([$role]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'users' => $users]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
