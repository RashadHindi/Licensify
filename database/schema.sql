-- =============================================================
--  Licensify – Database Schema
--  Import this file in phpMyAdmin to set up the full database.
--  All tables, primary keys, foreign keys, constraints,
--  default values, and required starter data are included.
-- =============================================================

-- 1. Create & select the database
CREATE DATABASE IF NOT EXISTS `licensify`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `licensify`;

-- =============================================================
-- 2. users
--    Core table for students, trainers, and admins.
-- =============================================================
CREATE TABLE IF NOT EXISTS `users` (
    `id`            INT AUTO_INCREMENT PRIMARY KEY,
    `fname`         VARCHAR(100)  NOT NULL,
    `lname`         VARCHAR(100)  NOT NULL,
    `email`         VARCHAR(255)  NOT NULL UNIQUE,
    `password`      VARCHAR(255)  NOT NULL,
    `phone`         VARCHAR(50)   DEFAULT NULL,
    `profile_photo` VARCHAR(500)  DEFAULT NULL,
    `role`          ENUM('student', 'trainer', 'admin') NOT NULL DEFAULT 'student',
    `experience`    VARCHAR(50)   DEFAULT NULL,
    `car_type`      VARCHAR(50)   DEFAULT NULL,
    `rating`        DECIMAL(2,1)  DEFAULT 0.0,
    `reviews`       INT           DEFAULT 0,
    `created_at`    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 3. trainer_availability
--    Tracks days/slots that a trainer has marked as unavailable.
-- =============================================================
CREATE TABLE IF NOT EXISTS `trainer_availability` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `trainer_id` INT          NOT NULL,
    `date`       DATE         NOT NULL,
    `type`       ENUM('day_off', 'slot_off') NOT NULL,
    `slot_hour`  VARCHAR(10)  DEFAULT NULL,
    `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`trainer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_trainer_date_slot` (`trainer_id`, `date`, `slot_hour`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 4. reservations
--    Lesson bookings between a student and a trainer.
-- =============================================================
CREATE TABLE IF NOT EXISTS `reservations` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT          NOT NULL,
    `trainer_id` INT          NOT NULL,
    `date`       DATE         NOT NULL,
    `time`       VARCHAR(10)  NOT NULL,
    `status`     ENUM('Upcoming', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Upcoming',
    `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`trainer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_trainer_date_time` (`trainer_id`, `date`, `time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 5. trainer_feedback
--    Messages sent from a trainer to one of their students.
-- =============================================================
CREATE TABLE IF NOT EXISTS `trainer_feedback` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `trainer_id` INT  NOT NULL,
    `student_id` INT  NOT NULL,
    `message`    TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`trainer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 6. student_reviews
--    Star ratings and written reviews left by students for trainers.
-- =============================================================
CREATE TABLE IF NOT EXISTS `student_reviews` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `trainer_id` INT  NOT NULL,
    `student_id` INT  NOT NULL,
    `rating`     INT  NOT NULL,
    `review`     TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`trainer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_student_trainer_review` (`trainer_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 7. notifications
--    In-app notifications for any user (feedback, booking, alert).
-- =============================================================
CREATE TABLE IF NOT EXISTS `notifications` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`    INT          NOT NULL,
    `title`      VARCHAR(255) NOT NULL,
    `message`    TEXT         NOT NULL,
    `type`       VARCHAR(50)  NOT NULL DEFAULT 'info',  -- feedback | booking | alert
    `icon`       VARCHAR(50)  DEFAULT 'bi-bell',
    `color`      VARCHAR(50)  DEFAULT 'text-primary',
    `bg`         VARCHAR(50)  DEFAULT '',
    `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 11. categories
--     Driving license categories (Private, Truck, etc.)
-- =============================================================
CREATE TABLE IF NOT EXISTS `categories` (
    `id`          VARCHAR(50) PRIMARY KEY, -- e.g. 'private'
    `name`        VARCHAR(100) NOT NULL,
    `icon`        VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 9. exams
--    Metadata for mock theory exams.
-- =============================================================
CREATE TABLE IF NOT EXISTS `exams` (
    `id`          INT AUTO_INCREMENT PRIMARY KEY,
    `title`       VARCHAR(255) NOT NULL,
    `category`    VARCHAR(50)  NOT NULL,
    `creator_id`  INT          NOT NULL,
    `created_at`  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category`)   REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 10. exam_questions
--     Questions associated with a specific exam.
-- =============================================================
CREATE TABLE IF NOT EXISTS `exam_questions` (
    `id`             INT AUTO_INCREMENT PRIMARY KEY,
    `exam_id`        INT          NOT NULL,
    `question_text`  TEXT         NOT NULL,
    `option_a`       VARCHAR(500) NOT NULL,
    `option_b`       VARCHAR(500) NOT NULL,
    `option_c`       VARCHAR(500) NOT NULL,
    `option_d`       VARCHAR(500) NOT NULL,
    `correct_answer` INT          NOT NULL, -- 0, 1, 2, 3
    `explanation`    TEXT         NOT NULL,
    FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 8. Seed data – default accounts
--    All accounts use the password:  Password123!
--    (stored as a bcrypt hash below)
--
--    If you need to regenerate the hash, run in PHP:
--      echo password_hash('Password123!', PASSWORD_DEFAULT);
--    and replace the $2y$... value below.
-- =============================================================
INSERT IGNORE INTO `users`
    (`fname`, `lname`, `email`, `password`, `phone`, `role`, `experience`, `car_type`, `rating`, `reviews`)
VALUES
    -- Admin
    ('Rashad',  'Hindi',   'rashadhindi2004@gmail.com',     '$2y$10$tYc3ajO.DUodcul.WEet7.6ZUGUx25/vHOjxw8sp8xaPwcfFH4HDC', '+1 234 567 890', 'admin',   NULL,        NULL,            0.0,  0),
    -- Trainers
    ('Sarah',   'Johnson', 'sarah.trainer@licensify.com',   '$2y$10$tYc3ajO.DUodcul.WEet7.6ZUGUx25/vHOjxw8sp8xaPwcfFH4HDC', '+1 555 0101',    'trainer', '6 Years',   'Automatic',     4.8, 95),
    ('Michael', 'Chen',    'michael.trainer@licensify.com', '$2y$10$tYc3ajO.DUodcul.WEet7.6ZUGUx25/vHOjxw8sp8xaPwcfFH4HDC', '+1 555 0102',    'trainer', '10 Years',  'Manual & Auto', 4.9, 128),
    -- Students
    ('Ahmad',   'Hassan',  'ahmad.student@gmail.com',       '$2y$10$tYc3ajO.DUodcul.WEet7.6ZUGUx25/vHOjxw8sp8xaPwcfFH4HDC', '+1 555 0201',    'student', NULL,        NULL,            0.0,  0),
    ('Emma',    'Wilson',  'emma.student@gmail.com',        '$2y$10$tYc3ajO.DUodcul.WEet7.6ZUGUx25/vHOjxw8sp8xaPwcfFH4HDC', '+1 555 0202',    'student', NULL,        NULL,            0.0,  0);

-- =============================================================
-- 11. Seed data – Categories
-- =============================================================
INSERT IGNORE INTO `categories` (`id`, `name`, `icon`, `description`) VALUES
('private',      'Private Cars',  'bi-car-front-fill',  'License Category B'),
('light-truck',  'Light Trucks',  'bi-truck',           'License Category C1'),
('heavy-truck',  'Heavy Trucks',  'bi-truck-front-fill','License Category C'),
('taxi',         'Taxi / Public', 'bi-taxi-front-fill', 'License Category D1'),
('motorcycle',   'Motorcycle',    'bi-bicycle',         'License Category A'),
('tractor',      'Tractor',       'bi-cone-striped',    'License Category 1');

-- =============================================================
-- 9. Seed data – Standard Exams
-- =============================================================
INSERT IGNORE INTO `exams` (`id`, `title`, `category`, `creator_id`) VALUES
(1, 'Mock Theory Exam', 'private', 1),
(2, 'Mock Theory Exam', 'private', 1),
(3, 'Mock Theory Exam', 'private', 1),
(4, 'Mock Theory Exam', 'private', 1),
(5, 'Mock Theory Exam', 'motorcycle', 1);

-- =============================================================
-- 10. Seed data – Exam Questions
-- =============================================================
INSERT IGNORE INTO `exam_questions` (`exam_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `explanation`) VALUES
(1, 'What does a circular sign with a red border and a bicycle inside mean?', 'Bicycles only permitted', 'No entry for bicycles', 'Priority for bicycles', 'Bicycle parking ahead', 1, 'Circular signs with red borders are prohibitory. This specific sign prohibits bicycles from entering the path or road.'),
(1, 'When approaching a pedestrian crossing without lights, what should you do?', 'Speed up to pass quickly', 'Maintain speed and honk', 'Slow down and be prepared to stop for pedestrians', 'Only stop if there is a police officer', 2, 'Safety first! Always slow down at crossings and give priority to pedestrians already on or waiting to cross.'),
(2, 'What is the maximum speed limit in a residential area unless otherwise posted?', '30 km/h', '50 km/h', '70 km/h', '90 km/h', 1, 'In most urban residential areas, the default speed limit is 50 km/h for safety.'),
(3, 'What should you do when you see an ambulance behind you with sirens and flashing lights?', 'Speed up to stay ahead of it', 'Stop immediately in the middle of the road', 'Safely pull over to the right and let it pass', 'Keep driving at your current speed', 2, 'Emergency vehicles always have priority. Pull over safely to allow them to pass.'),
(4, 'Which of the following is considered a major distraction while driving?', 'Listening to a podcast at low volume', 'Checking a text message on your phone', 'Looking at the speedometer', 'Using the windshield wipers', 1, 'Mobile phone usage is a primary source of driver distraction and a leading cause of accidents.'),
(5, 'What is the most important piece of safety gear for a motorcyclist?', 'Leather jacket', 'Gloves', 'Approved helmet', 'Boots', 2, 'An approved helmet is the single most effective piece of safety equipment for preventing fatal head injuries.');

-- =============================================================
-- 12. exam_results
--     Stores scores for students after taking an exam.
-- =============================================================
CREATE TABLE IF NOT EXISTS `exam_results` (
    `id`              INT AUTO_INCREMENT PRIMARY KEY,
    `student_id`      INT NOT NULL,
    `exam_id`         INT NOT NULL,
    `score`           INT NOT NULL,
    `total_questions` INT NOT NULL,
    `percentage`      DECIMAL(5,2) NOT NULL,
    `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`exam_id`)    REFERENCES `exams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 13. exam_mistakes
--     Tracks specific questions missed by students.
-- =============================================================
CREATE TABLE IF NOT EXISTS `exam_mistakes` (
    `id`          INT AUTO_INCREMENT PRIMARY KEY,
    `student_id`  INT NOT NULL,
    `question_id` INT NOT NULL,
    `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`)  REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `exam_questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Study Progress Table
CREATE TABLE IF NOT EXISTS `student_progress` (
    `id`              INT AUTO_INCREMENT PRIMARY KEY,
    `student_id`      INT NOT NULL,
    `topic_id`        VARCHAR(50) NOT NULL,
    `status`          ENUM('not-started', 'in-progress', 'completed') NOT NULL DEFAULT 'not-started',
    `completed_items` INT DEFAULT 0,
    `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_progress` (`student_id`, `topic_id`),
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
