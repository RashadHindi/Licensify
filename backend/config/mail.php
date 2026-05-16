<?php
/**
 * SMTP Configuration for PHPMailer
 * Update these settings with your real SMTP details (e.g., Gmail, Mailtrap, etc.)
 */

return [
    'host'       => 'smtp.gmail.com',         // SMTP server (e.g. smtp.gmail.com or smtp.mailtrap.io)
    'auth'       => true,
    'username'   => 'licensify.project@gmail.com',   // Your SMTP username
    'password'   => 'bkwl amqz focz edjo',      // Your SMTP password (use App Password for Gmail)
    'secure'     => 'tls',                    // 'tls' (port 587) or 'ssl' (port 465)
    'port'       => 587,
    'from_email' => 'licensify.project@gmail.com',
    'from_name'  => 'Licensify'
];

