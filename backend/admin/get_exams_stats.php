<?php
/**
 * Get exam statistics for Admin Dashboard.
 * GET /backend/admin/get_exams_stats.php
 * 
 * Returns JSON: { 
 *   success, 
 *   exams: [{ id, title, category, creator_name, created_at }],
 *   distribution: { Admin: count, TrainerName: count, ... }
 * }
 */

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated as admin.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

// 1. Get all exams with creator names
$query = "
    SELECT e.id, e.title, e.category, e.created_at, u.fname, u.lname, u.role
    FROM exams e
    JOIN users u ON e.creator_id = u.id
    ORDER BY e.created_at DESC
";
$stmt = $pdo->prepare($query);
$stmt->execute();
$exams = $stmt->fetchAll(PDO::FETCH_ASSOC);

$formattedExams = [];
$distribution = [];

foreach ($exams as $e) {
    $creatorName = $e['fname'] . ' ' . $e['lname'];
    
    $formattedExams[] = [
        'id'           => $e['id'],
        'title'        => $e['title'],
        'category'     => ucfirst($e['category']),
        'creator_name' => $creatorName,
        'created_at'   => date('M d, Y', strtotime($e['created_at']))
    ];

    // Build distribution data for the chart
    if (!isset($distribution[$creatorName])) {
        $distribution[$creatorName] = 0;
    }
    $distribution[$creatorName]++;
}

echo json_encode([
    'success'      => true,
    'exams'        => $formattedExams,
    'distribution' => $distribution
]);
