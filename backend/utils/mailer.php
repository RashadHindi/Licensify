<?php
/**
 * Utility to send emails using PHPMailer with SMTP.
 * This avoids the common configuration issues with PHP's mail() on WAMP.
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/../libs/PHPMailer/Exception.php';
require_once __DIR__ . '/../libs/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/../libs/PHPMailer/SMTP.php';

function get_mailer_instance() {
    $config = require __DIR__ . '/../config/mail.php';
    
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->SMTPDebug = SMTP::DEBUG_OFF; // Disable for production to avoid breaking JSON
        $mail->isSMTP();
        $mail->Host       = $config['host'];
        $mail->SMTPAuth   = $config['auth'];
        $mail->Username   = $config['username'];
        $mail->Password   = $config['password'];
        $mail->SMTPSecure = $config['secure'] === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = $config['port'];

        // Recipients
        $mail->setFrom($config['from_email'], $config['from_name']);
        
        return $mail;
    } catch (Exception $e) {
        error_log("Mailer Initialization Error: {$mail->ErrorInfo}");
        return null;
    }
}

function send_verification_email($to_email, $code, $name = '') {
    $mail = get_mailer_instance();
    if (!$mail) return false;

    try {
        $mail->addAddress($to_email);
        $mail->isHTML(true);
        $mail->Subject = 'Your Licensify Verification Code';
        
        // Email Template
        $body = "
        <div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;\">
            <div style=\"background-color: #004d40; color: white; padding: 30px; text-align: center;\">
                <h1 style=\"margin:0;\">Licensify</h1>
            </div>
            <div style=\"padding: 40px; color: #333; line-height: 1.6;\">
                <h2>Verify Your Email</h2>
                <p>Hello " . htmlspecialchars($name ?: 'there') . ",</p>
                <p>Thank you for joining Licensify! Please use the code below to complete your registration:</p>
                <div style=\"background-color: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #004d40; margin: 30px 0; border: 1px dashed #004d40;\">
                    $code
                </div>
                <p>This code is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>The Licensify Team</p>
            </div>
            <div style=\"background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777;\">
                &copy; " . date('Y') . " Licensify. All rights reserved.
            </div>
        </div>";

        $mail->Body = $body;
        $mail->AltBody = "Your Licensify verification code is: $code";

        return $mail->send();
    } catch (Exception $e) {
        error_log("Mail Error (Signup): {$mail->ErrorInfo}");
        return false;
    }
}

function send_reset_password_email($to_email, $code) {
    $mail = get_mailer_instance();
    if (!$mail) return false;

    try {
        $mail->addAddress($to_email);
        $mail->isHTML(true);
        $mail->Subject = 'Reset Your Licensify Password';
        
        $body = "
        <div style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;\">
            <div style=\"background-color: #004d40; color: white; padding: 30px; text-align: center;\">
                <h1 style=\"margin:0;\">Licensify</h1>
            </div>
            <div style=\"padding: 40px; color: #333; line-height: 1.6;\">
                <h2>Reset Password</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password. Use the code below to proceed:</p>
                <div style=\"background-color: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #e67e22; margin: 30px 0; border: 1px dashed #e67e22;\">
                    $code
                </div>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p>Best regards,<br>The Licensify Team</p>
            </div>
            <div style=\"background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777;\">
                &copy; " . date('Y') . " Licensify. All rights reserved.
            </div>
        </div>";

        $mail->Body = $body;
        $mail->AltBody = "Your Licensify password reset code is: $code";

        return $mail->send();
    } catch (Exception $e) {
        error_log("Mail Error (Reset): {$mail->ErrorInfo}");
        return false;
    }
}
