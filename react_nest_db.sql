-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 28, 2026 at 11:15 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `react_nest_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `app_notifications`
--

CREATE TABLE `app_notifications` (
  `id` varchar(36) NOT NULL,
  `recipientType` varchar(20) NOT NULL,
  `recipientId` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(30) NOT NULL DEFAULT 'alert',
  `requestId` varchar(36) DEFAULT NULL,
  `ticketNumber` varchar(30) DEFAULT NULL,
  `isRead` tinyint(4) NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL,
  `timestamp` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `actorName` varchar(100) NOT NULL,
  `actorRole` varchar(20) NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` text NOT NULL,
  `requestId` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dispatch_rounds`
--

CREATE TABLE `dispatch_rounds` (
  `id` varchar(36) NOT NULL,
  `roundNumber` int(11) NOT NULL,
  `isActive` tinyint(4) NOT NULL DEFAULT 1,
  `totalEligibleTechnicians` int(11) NOT NULL DEFAULT 0,
  `assignedTechnicianIdsJson` text NOT NULL,
  `startedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `closedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `isCompleted` tinyint(4) NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `title`, `description`, `isCompleted`, `createdAt`) VALUES
(1, 'Initial Setup Verification', 'React + NestJS + XAMPP MySQL is active!', 0, '2026-09-03 19:06:52.804707'),
(2, 'Test', '12345', 0, '2026-09-03 19:57:18.816945'),
(3, 'TYU', 'FHBKJN', 0, '2026-09-08 08:38:17.316572');

-- --------------------------------------------------------

--
-- Table structure for table `it_technicians`
--

CREATE TABLE `it_technicians` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `roleTitle` varchar(100) DEFAULT 'IT Support Engineer',
  `department` varchar(100) DEFAULT 'IT Support',
  `status` varchar(20) NOT NULL DEFAULT 'unoccupied',
  `currentRequestId` varchar(36) DEFAULT NULL,
  `currentRoundAssignments` int(11) NOT NULL DEFAULT 0,
  `lifetimeAssignments` int(11) NOT NULL DEFAULT 0,
  `totalCompletedJobs` int(11) NOT NULL DEFAULT 0,
  `lastAssignedAt` datetime DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT 5.00,
  `ratingsCount` int(11) DEFAULT 0,
  `isOnline` tinyint(4) NOT NULL DEFAULT 1,
  `avatarUrl` text NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `it_technicians`
--

INSERT INTO `it_technicians` (`id`, `name`, `email`, `phone`, `roleTitle`, `department`, `status`, `currentRequestId`, `currentRoundAssignments`, `lifetimeAssignments`, `totalCompletedJobs`, `lastAssignedAt`, `rating`, `ratingsCount`, `isOnline`, `avatarUrl`, `createdAt`, `updatedAt`) VALUES
('2dc4ed99-0494-4dae-87e7-34e8cf1b269b', 'Michael Myers', 'myers@dispatch.corp', '0715678907', 'IT Support Specialist', 'IT End-User Support', 'unoccupied', NULL, 2, 2, 2, '2026-09-22 08:02:51', 5.00, 0, 1, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '2026-09-21 21:52:47.636719', '2026-09-22 08:03:22.000000'),
('56e9b2d9-9f72-4df0-ab29-007b0e9e1753', 'John Joseph', 'john@dispatch.corp', '0723456799', 'Field IT Specialist', 'IT', 'unoccupied', '727b9ff4-594f-4c4d-bfe7-4b79bd219dfb', 2, 2, 1, '2026-09-21 21:30:59', 5.00, 0, 1, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '2026-09-21 21:16:12.595666', '2026-09-21 21:58:24.575715'),
('dbbe0b70-c8bb-4c5a-a410-ecd6d59c0dd9', 'Alex Tech', 'alex.tech@dispatch.corp', '+1 (555) 777-8888', 'IT Support Specialist', 'IT End-User Support', 'absent', NULL, 0, 0, 0, NULL, 5.00, 0, 1, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '2026-09-21 21:49:33.277475', '2026-09-26 22:04:38.930000'),
('tech-1', 'Marcus Vance', 'm.vance@org.corp', '+1 (555) 789-0123', 'Senior Systems Support Specialist', 'IT Infrastructure & End-User', 'unoccupied', 'req-pending-1', 0, 43, 42, '2026-09-21 18:03:06', 4.95, 38, 1, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', '2026-09-06 16:10:08.304140', '2026-09-21 21:58:47.086135');

-- --------------------------------------------------------

--
-- Table structure for table `service_requests`
--

CREATE TABLE `service_requests` (
  `id` varchar(36) NOT NULL,
  `ticketNumber` varchar(30) NOT NULL,
  `requesterId` varchar(36) NOT NULL,
  `requesterName` varchar(100) NOT NULL,
  `requesterEmail` varchar(150) NOT NULL,
  `requesterDept` varchar(100) NOT NULL,
  `requesterPhone` varchar(50) NOT NULL,
  `locationBuilding` varchar(50) DEFAULT 'Building 2',
  `locationFloor` varchar(50) DEFAULT 'Floor 3',
  `locationRoom` varchar(50) DEFAULT 'Room 304',
  `title` varchar(255) DEFAULT 'IT Service Request',
  `description` text NOT NULL,
  `category` varchar(50) DEFAULT 'General',
  `urgency` varchar(20) DEFAULT 'medium',
  `status` varchar(30) NOT NULL DEFAULT 'pending_admin',
  `assignedTechnicianId` varchar(36) DEFAULT NULL,
  `assignedTechnicianName` varchar(100) DEFAULT NULL,
  `assignedTechnicianPhone` varchar(50) DEFAULT NULL,
  `assignedAt` datetime DEFAULT NULL,
  `startedAt` datetime DEFAULT NULL,
  `completedAt` datetime DEFAULT NULL,
  `terminatedAt` datetime DEFAULT NULL,
  `resolutionNotes` text DEFAULT NULL,
  `userRating` int(11) DEFAULT NULL,
  `userFeedback` text DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  `department` varchar(100) DEFAULT NULL,
  `building` varchar(50) DEFAULT NULL,
  `floor` varchar(50) DEFAULT NULL,
  `room` varchar(50) DEFAULT NULL,
  `phone` varchar(50) NOT NULL,
  `avatarUrl` text NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `password` varchar(255) NOT NULL DEFAULT 'password123',
  `technicianId` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `role`, `department`, `building`, `floor`, `room`, `phone`, `avatarUrl`, `createdAt`, `password`, `technicianId`) VALUES
('5fc69242-1889-4e66-a09e-7927f452be9d', 'Alex Tech', 'alex.tech@dispatch.corp', 'it_guy', NULL, NULL, NULL, NULL, '+1 (555) 777-8888', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '2026-09-21 21:49:33.297526', 'password123', 'dbbe0b70-c8bb-4c5a-a410-ecd6d59c0dd9'),
('d4acb28f-dea9-49d1-aebf-2cb6465b22b6', 'John Joseph', 'john@dispatch.corp', 'it_guy', 'IT', 'Building 1', 'Floor 3', 'Room 310', '0723456799', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '2026-09-21 21:16:12.606346', 'tech123', '56e9b2d9-9f72-4df0-ab29-007b0e9e1753'),
('f505e8d0-a161-4be3-94b4-24987e30a0d6', 'Michael Myers', 'myers@dispatch.corp', 'it_guy', NULL, NULL, NULL, NULL, '0715678907', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '2026-09-21 21:52:47.646488', 'tech123', '2dc4ed99-0494-4dae-87e7-34e8cf1b269b'),
('usr-admin', 'Alex Mercer', 'a.mercer@org.corp', 'admin', 'IT Operations Lead', 'Building 1', 'Floor 1', 'Command Room 101', '+1 (555) 100-9999', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '2026-09-06 16:10:08.286809', 'password123', NULL),
('usr-admin-primary', 'Alex Mercer (Operations Lead)', 'admin@dispatch.corp', 'admin', 'IT Operations Command Center', 'Building 1', 'Floor 1', 'Command Suite 101', '+1 (555) 100-9999', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '2026-09-06 16:54:07.143907', 'Admin@2026!', NULL),
('usr-marcus-vance', 'Marcus Vance', 'marcus@dispatch.corp', 'it_guy', 'IT Infrastructure & End-User Support', 'Building 1', 'Floor 1', 'IT Operations 102', '+1 (555) 789-0123', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', '2026-09-06 16:54:07.182209', 'tech123', 'tech-1'),
('usr-sarah-jenkins', 'Sarah Jenkins', 'sarah@dispatch.corp', 'user', 'Financial Operations', 'Building 2', 'Floor 3', 'Room 304', '+1 (555) 234-5678', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '2026-09-06 16:54:07.159562', 'user123', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `app_notifications`
--
ALTER TABLE `app_notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dispatch_rounds`
--
ALTER TABLE `dispatch_rounds`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_85b217ff5668eec2eadd561ee3` (`roundNumber`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `it_technicians`
--
ALTER TABLE `it_technicians`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_736142e136cb08a7ce5c32c164` (`email`);

--
-- Indexes for table `service_requests`
--
ALTER TABLE `service_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_18c05bb126198f648c0f5299b4` (`ticketNumber`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
