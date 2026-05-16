<?php
/**
 * Generate and send a verification code to a user's email.
 * POST /backend/auth/send_code.php
 * Expects JSON: { email, type } where type is 'signup' or 'forgot'
 */

session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../utils/mailer.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$type = $data['type'] ?? 'signup';

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

// Generate 6-digit code
$code = (string) rand(100000, 999999);

// Store in session for verification later
if ($type === 'forgot') {
    $_SESSION['forgot_verify_code'] = $code;
    $_SESSION['forgot_email_pending'] = $email;
    $sent = send_reset_password_email($email, $code);
} else {
    $_SESSION['signup_verify_code'] = $code;
    $_SESSION['signup_email_pending'] = $email;
    $sent = send_verification_email($email, $code);
}

// If PHPMailer succeeded, it returns true
if ($sent) {
    echo json_encode([
        'success' => true, 
        'message' => 'Code sent to ' . $email,
        'code' => $code // Returning code so user can see it in console as requested
    ]);
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to send email. Please check your SMTP configuration.'
    ]);
}
