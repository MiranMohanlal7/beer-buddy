-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 27, 2025 at 09:23 AM
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
-- Database: `brew_buddy`
--

-- --------------------------------------------------------

--
-- Table structure for table `beer_inventory`
--

CREATE TABLE `beer_inventory` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(510) NOT NULL,
  `price` decimal(6,2) NOT NULL,
  `unit_weight` int(11) NOT NULL,
  `unit_empty` int(11) NOT NULL,
  `total_weight` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `beer_inventory`
--

INSERT INTO `beer_inventory` (`id`, `name`, `description`, `price`, `unit_weight`, `unit_empty`, `total_weight`) VALUES
(1, 'Fritz Kola 33cl fles', 'Een 33cl fles Fritz-Kola levert een krachtige, puur kolasmaak met opvallend hoge cafeïne en een lichte frisse citrustoon. Minder zoet dan gewone cola en gemaakt met echte suiker, waardoor de smaak voller en intenser is. Een energieke, karaktervolle dorstlesser voor iedereen die net wat meer pit zoekt.', 1.50, 380, 800, 1900),
(2, 'Monster Energy 50cl', 'Een 50cl blik Monster Energy geeft een krachtige boost met zijn herkenbare mix van zoete, frisse citrus- en guaranatonen. De volle, intense smaak en hoge cafeïne zorgen voor directe energie, perfect voor lange dagen of late avonden. Een blik dat pure power en uithoudingsvermogen levert bij elke slok.', 2.39, 520, 1580, 2080),
(3, 'Redbull blik 25cl', 'Een 25cl blik Red Bull biedt een scherpe, herkenbare energieboost met zijn lichtzoete, fris-zure smaak en sprankelende kick. Compact en krachtig: precies genoeg om je concentratie en alertheid te verhogen wanneer je het nodig hebt. Een kleine blik vol directe, betrouwbare energie.', 1.79, 260, 540, 780);

-- --------------------------------------------------------

--
-- Table structure for table `consumption`
--

CREATE TABLE `consumption` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `beer_id` int(10) UNSIGNED NOT NULL,
  `units_taken` int(11) NOT NULL,
  `time_taken` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `consumption`
--

INSERT INTO `consumption` (`id`, `user_id`, `beer_id`, `units_taken`, `time_taken`) VALUES
(1, 1, 3, 2, '2025-11-27 09:22:14'),
(2, 3, 1, 6, '2025-11-27 09:22:40');

-- --------------------------------------------------------

--
-- Table structure for table `shared_notes`
--

CREATE TABLE `shared_notes` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shared_notes`
--

INSERT INTO `shared_notes` (`id`, `name`, `message`, `created_at`) VALUES
(1, 'Sam', 'Dit is een test bericht', '2025-11-27 09:21:35'),
(2, 'Jules', 'Dit is een test om te kijken of dit displayed op de frontend', '2025-11-27 09:23:04');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(255) NOT NULL,
  `rfid_tag_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `rfid_tag_id`, `created_at`) VALUES
(1, 'Sam ', 1, '2025-11-21 10:58:14'),
(2, 'Jim', 2, '2025-11-21 10:58:24'),
(3, 'Jules', 3, '2025-11-21 10:58:30'),
(4, 'Miran', 4, '2025-11-21 10:58:37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `beer_inventory`
--
ALTER TABLE `beer_inventory`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `consumption`
--
ALTER TABLE `consumption`
  ADD PRIMARY KEY (`id`,`user_id`,`beer_id`),
  ADD KEY `fk_user_id` (`user_id`),
  ADD KEY `fk_beer_id` (`beer_id`);

--
-- Indexes for table `shared_notes`
--
ALTER TABLE `shared_notes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `beer_inventory`
--
ALTER TABLE `beer_inventory`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `consumption`
--
ALTER TABLE `consumption`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `shared_notes`
--
ALTER TABLE `shared_notes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `consumption`
--
ALTER TABLE `consumption`
  ADD CONSTRAINT `fk_beer_id` FOREIGN KEY (`beer_id`) REFERENCES `beer_inventory` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
