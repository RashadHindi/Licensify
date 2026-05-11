<?php
/**
 * Session check endpoint for Licensify.
 * GET /backend/auth/check_session.php
 * 
 * Returns JSON: { success, loggedIn, user? }
 * 
 * Used on page load to restore login state if sessionStorage
 * was cleared (e.g. new tab) but the PHP session is still active.
 */

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

if (isset($_SESSION['user'])) {
    echo json_encode([
        'success'  => true,
        'loggedIn' => true,
        'user'     => $_SESSION['user']
    ]);
} else {
    echo json_encode([
        'success'  => true,
        'loggedIn' => false
    ]);
}
