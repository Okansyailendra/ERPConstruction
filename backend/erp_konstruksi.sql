-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3307
-- Generation Time: Jul 06, 2026 at 11:16 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `erp_konstruksi`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_generate_rab` (IN `p_boq` BIGINT)   BEGIN
 SELECT 'Smart RAB Generator akan diimplementasikan pada tahap trigger & procedure lanjutan.' AS message,
 p_boq AS boq_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `module` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activity` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ahsp_equipments`
--

CREATE TABLE `ahsp_equipments` (
  `id` bigint NOT NULL,
  `ahsp_id` bigint NOT NULL,
  `equipment_id` bigint NOT NULL,
  `coefficient` decimal(18,4) NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ahsp_equipments`
--

INSERT INTO `ahsp_equipments` (`id`, `ahsp_id`, `equipment_id`, `coefficient`, `notes`) VALUES
(1, 1, 1, '0.0300', NULL),
(2, 1, 2, '0.0500', NULL),
(3, 2, 1, '0.0400', NULL),
(4, 3, 3, '0.0200', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ahsp_headers`
--

CREATE TABLE `ahsp_headers` (
  `id` bigint NOT NULL,
  `version_id` int NOT NULL,
  `wbs_item_id` bigint NOT NULL,
  `ahsp_code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ahsp_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ahsp_headers`
--

INSERT INTO `ahsp_headers` (`id`, `version_id`, `wbs_item_id`, `ahsp_code`, `ahsp_name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 4, 'AHSP-0001', 'Pondasi Batu Kali', NULL, 'Active', '2026-07-06 10:52:14', '2026-07-06 10:52:14'),
(2, 1, 5, 'AHSP-0002', 'Pengecoran Sloof', NULL, 'Active', '2026-07-06 10:52:14', '2026-07-06 10:52:14'),
(3, 1, 8, 'AHSP-0003', 'Pasangan Bata Ringan', NULL, 'Active', '2026-07-06 10:52:14', '2026-07-06 10:52:14');

-- --------------------------------------------------------

--
-- Table structure for table `ahsp_labors`
--

CREATE TABLE `ahsp_labors` (
  `id` bigint NOT NULL,
  `ahsp_id` bigint NOT NULL,
  `labor_id` bigint NOT NULL,
  `coefficient` decimal(18,4) NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ahsp_labors`
--

INSERT INTO `ahsp_labors` (`id`, `ahsp_id`, `labor_id`, `coefficient`, `notes`) VALUES
(1, 1, 1, '0.0500', NULL),
(2, 1, 2, '0.3000', NULL),
(3, 1, 3, '0.6000', NULL),
(4, 2, 1, '0.0500', NULL),
(5, 2, 3, '0.8000', NULL),
(6, 3, 2, '0.4000', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ahsp_materials`
--

CREATE TABLE `ahsp_materials` (
  `id` bigint NOT NULL,
  `ahsp_id` bigint NOT NULL,
  `material_id` bigint NOT NULL,
  `coefficient` decimal(18,4) NOT NULL,
  `waste_percent` decimal(5,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ahsp_materials`
--

INSERT INTO `ahsp_materials` (`id`, `ahsp_id`, `material_id`, `coefficient`, `waste_percent`, `notes`) VALUES
(1, 1, 1, '7.2000', '3.00', NULL),
(2, 1, 2, '0.5500', '5.00', NULL),
(3, 1, 3, '1.2000', '2.00', NULL),
(4, 2, 1, '8.1000', '3.00', NULL),
(5, 3, 6, '1.0500', '2.00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ahsp_versions`
--

CREATE TABLE `ahsp_versions` (
  `id` int NOT NULL,
  `version_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `effective_date` date NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ahsp_versions`
--

INSERT INTO `ahsp_versions` (`id`, `version_code`, `version_name`, `effective_date`, `is_default`, `status`, `created_at`) VALUES
(1, 'PUPR2024', 'AHSP PUPR 2024', '2024-01-01', 1, 'Active', '2026-07-06 10:52:13'),
(2, 'COMPANY', 'Standar Perusahaan', '2025-01-01', 0, 'Active', '2026-07-06 10:52:13');

-- --------------------------------------------------------

--
-- Table structure for table `approvals`
--

CREATE TABLE `approvals` (
  `id` bigint NOT NULL,
  `reference_table` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint DEFAULT NULL,
  `requested_by` bigint DEFAULT NULL,
  `approved_by` bigint DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `boq_headers`
--

CREATE TABLE `boq_headers` (
  `id` bigint NOT NULL,
  `boq_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` bigint NOT NULL,
  `version_no` int DEFAULT '1',
  `generated_by` bigint DEFAULT NULL,
  `generated_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('Draft','Reviewed','Approved') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `boq_items`
--

CREATE TABLE `boq_items` (
  `id` bigint NOT NULL,
  `boq_id` bigint NOT NULL,
  `wbs_item_id` bigint NOT NULL,
  `ahsp_id` bigint DEFAULT NULL,
  `item_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit_id` int NOT NULL,
  `quantity` decimal(18,3) DEFAULT '0.000',
  `unit_price` decimal(18,2) DEFAULT '0.00',
  `total_price` decimal(18,2) GENERATED ALWAYS AS ((`quantity` * `unit_price`)) STORED,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `boq_resources`
--

CREATE TABLE `boq_resources` (
  `id` bigint NOT NULL,
  `boq_item_id` bigint NOT NULL,
  `resource_type` enum('Material','Labor','Equipment') COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_id` bigint NOT NULL,
  `coefficient` decimal(18,4) DEFAULT '0.0000',
  `quantity` decimal(18,4) DEFAULT '0.0000',
  `unit_cost` decimal(18,2) DEFAULT '0.00',
  `total_cost` decimal(18,2) GENERATED ALWAYS AS ((`quantity` * `unit_cost`)) STORED,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` bigint NOT NULL,
  `customer_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `equipments`
--

CREATE TABLE `equipments` (
  `id` bigint NOT NULL,
  `equipment_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int NOT NULL,
  `equipment_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_id` int NOT NULL,
  `rental_rate` decimal(18,2) DEFAULT '0.00',
  `purchase_price` decimal(18,2) DEFAULT '0.00',
  `status` enum('Available','Maintenance','Broken') COLLATE utf8mb4_unicode_ci DEFAULT 'Available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `equipments`
--

INSERT INTO `equipments` (`id`, `equipment_code`, `category_id`, `equipment_name`, `unit_id`, `rental_rate`, `purchase_price`, `status`, `created_at`, `updated_at`) VALUES
(1, 'EQ001', 2, 'Molen', 10, '250000.00', '8500000.00', 'Available', '2026-07-06 10:42:39', '2026-07-06 10:42:39'),
(2, 'EQ002', 4, 'Gerobak', 10, '50000.00', '1200000.00', 'Available', '2026-07-06 10:42:39', '2026-07-06 10:42:39'),
(3, 'EQ003', 3, 'Waterpass', 10, '80000.00', '3500000.00', 'Available', '2026-07-06 10:42:39', '2026-07-06 10:42:39'),
(4, 'EQ004', 1, 'Excavator', 10, '2500000.00', '950000000.00', 'Available', '2026-07-06 10:42:39', '2026-07-06 10:42:39');

-- --------------------------------------------------------

--
-- Table structure for table `equipment_categories`
--

CREATE TABLE `equipment_categories` (
  `id` int NOT NULL,
  `category_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `equipment_categories`
--

INSERT INTO `equipment_categories` (`id`, `category_name`, `description`, `created_at`) VALUES
(1, 'Alat Berat', NULL, '2026-07-06 10:42:39'),
(2, 'Alat Cor', NULL, '2026-07-06 10:42:39'),
(3, 'Alat Ukur', NULL, '2026-07-06 10:42:39'),
(4, 'Alat Tukang', NULL, '2026-07-06 10:42:39');

-- --------------------------------------------------------

--
-- Table structure for table `equipment_maintenance`
--

CREATE TABLE `equipment_maintenance` (
  `id` bigint NOT NULL,
  `equipment_id` bigint NOT NULL,
  `maintenance_date` date DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cost` decimal(18,2) DEFAULT '0.00',
  `next_maintenance` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `equipment_rates`
--

CREATE TABLE `equipment_rates` (
  `id` bigint NOT NULL,
  `equipment_id` bigint NOT NULL,
  `effective_date` date NOT NULL,
  `rate_per_day` decimal(18,2) NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `labors`
--

CREATE TABLE `labors` (
  `id` bigint NOT NULL,
  `labor_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int NOT NULL,
  `labor_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_id` int NOT NULL,
  `daily_rate` decimal(18,2) DEFAULT '0.00',
  `overtime_rate` decimal(18,2) DEFAULT '0.00',
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `labors`
--

INSERT INTO `labors` (`id`, `labor_code`, `category_id`, `labor_name`, `unit_id`, `daily_rate`, `overtime_rate`, `status`, `created_at`, `updated_at`) VALUES
(1, 'LBR001', 1, 'Mandor', 10, '250000.00', '50000.00', 'Active', '2026-07-06 10:42:39', '2026-07-06 10:42:39'),
(2, 'LBR002', 2, 'Tukang Batu', 10, '200000.00', '40000.00', 'Active', '2026-07-06 10:42:39', '2026-07-06 10:42:39'),
(3, 'LBR003', 3, 'Pekerja', 10, '150000.00', '30000.00', 'Active', '2026-07-06 10:42:39', '2026-07-06 10:42:39'),
(4, 'LBR004', 4, 'Teknisi MEP', 10, '300000.00', '60000.00', 'Active', '2026-07-06 10:42:39', '2026-07-06 10:42:39'),
(5, 'LBR005', 5, 'Tukang Cat', 10, '180000.00', '35000.00', 'Active', '2026-07-06 10:42:39', '2026-07-06 10:42:39');

-- --------------------------------------------------------

--
-- Table structure for table `labor_categories`
--

CREATE TABLE `labor_categories` (
  `id` int NOT NULL,
  `category_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `labor_categories`
--

INSERT INTO `labor_categories` (`id`, `category_name`, `description`, `created_at`) VALUES
(1, 'Manajemen', NULL, '2026-07-06 10:42:39'),
(2, 'Tukang', NULL, '2026-07-06 10:42:39'),
(3, 'Pekerja', NULL, '2026-07-06 10:42:39'),
(4, 'MEP', NULL, '2026-07-06 10:42:39'),
(5, 'Finishing', NULL, '2026-07-06 10:42:39');

-- --------------------------------------------------------

--
-- Table structure for table `labor_types`
--

CREATE TABLE `labor_types` (
  `id` int NOT NULL,
  `labor_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `labor_types`
--

INSERT INTO `labor_types` (`id`, `labor_type`, `description`) VALUES
(1, 'Borongan', NULL),
(2, 'Harian', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` bigint NOT NULL,
  `material_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int NOT NULL,
  `unit_id` int NOT NULL,
  `default_vendor_id` bigint DEFAULT NULL,
  `material_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specification` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchase_price` decimal(18,2) DEFAULT '0.00',
  `selling_price` decimal(18,2) DEFAULT '0.00',
  `minimum_stock` decimal(18,2) DEFAULT '0.00',
  `current_stock` decimal(18,2) DEFAULT '0.00',
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`id`, `material_code`, `category_id`, `unit_id`, `default_vendor_id`, `material_name`, `specification`, `brand`, `purchase_price`, `selling_price`, `minimum_stock`, `current_stock`, `status`, `created_at`, `updated_at`) VALUES
(1, 'MAT0001', 1, 7, NULL, 'Semen PCC', NULL, NULL, '68000.00', '70000.00', '100.00', '500.00', 'Active', '2026-07-06 10:36:15', '2026-07-06 10:36:15'),
(2, 'MAT0002', 2, 4, NULL, 'Pasir Cor', NULL, NULL, '300000.00', '320000.00', '20.00', '80.00', 'Active', '2026-07-06 10:36:15', '2026-07-06 10:36:15'),
(3, 'MAT0003', 3, 4, NULL, 'Batu Split', NULL, NULL, '350000.00', '380000.00', '20.00', '75.00', 'Active', '2026-07-06 10:36:15', '2026-07-06 10:36:15'),
(4, 'MAT0004', 4, 6, NULL, 'Besi Beton D13', NULL, NULL, '14500000.00', '14800000.00', '5.00', '18.00', 'Active', '2026-07-06 10:36:15', '2026-07-06 10:36:15'),
(5, 'MAT0005', 5, 4, NULL, 'Ready Mix K225', NULL, NULL, '950000.00', '980000.00', '10.00', '30.00', 'Active', '2026-07-06 10:36:15', '2026-07-06 10:36:15'),
(6, 'MAT0006', 9, 3, NULL, 'Keramik 60x60', NULL, NULL, '125000.00', '135000.00', '50.00', '500.00', 'Active', '2026-07-06 10:36:15', '2026-07-06 10:36:15'),
(7, 'MAT0007', 10, 8, NULL, 'Cat Interior', NULL, NULL, '320000.00', '350000.00', '30.00', '120.00', 'Active', '2026-07-06 10:36:15', '2026-07-06 10:36:15');

-- --------------------------------------------------------

--
-- Table structure for table `material_categories`
--

CREATE TABLE `material_categories` (
  `id` int NOT NULL,
  `category_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `material_categories`
--

INSERT INTO `material_categories` (`id`, `category_name`, `description`, `created_at`) VALUES
(1, 'Semen', NULL, '2026-07-06 10:36:14'),
(2, 'Pasir', NULL, '2026-07-06 10:36:14'),
(3, 'Batu', NULL, '2026-07-06 10:36:14'),
(4, 'Besi', NULL, '2026-07-06 10:36:14'),
(5, 'Beton', NULL, '2026-07-06 10:36:14'),
(6, 'Baja Ringan', NULL, '2026-07-06 10:36:14'),
(7, 'Kayu', NULL, '2026-07-06 10:36:14'),
(8, 'Atap', NULL, '2026-07-06 10:36:14'),
(9, 'Keramik', NULL, '2026-07-06 10:36:14'),
(10, 'Cat', NULL, '2026-07-06 10:36:14'),
(11, 'Plumbing', NULL, '2026-07-06 10:36:14'),
(12, 'Listrik', NULL, '2026-07-06 10:36:14'),
(13, 'MEP', NULL, '2026-07-06 10:36:14'),
(14, 'Finishing', NULL, '2026-07-06 10:36:14'),
(15, 'Lainnya', NULL, '2026-07-06 10:36:14');

-- --------------------------------------------------------

--
-- Table structure for table `material_classes`
--

CREATE TABLE `material_classes` (
  `id` int NOT NULL,
  `class_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `multiplier` decimal(10,2) DEFAULT '1.00',
  `description` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `material_classes`
--

INSERT INTO `material_classes` (`id`, `class_name`, `multiplier`, `description`) VALUES
(1, 'Ekonomis', '0.90', NULL),
(2, 'Standar', '1.00', NULL),
(3, 'Premium', '1.30', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `material_price_history`
--

CREATE TABLE `material_price_history` (
  `id` bigint NOT NULL,
  `material_id` bigint NOT NULL,
  `vendor_id` bigint DEFAULT NULL,
  `old_price` decimal(18,2) DEFAULT NULL,
  `new_price` decimal(18,2) DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int NOT NULL,
  `permission_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `module_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `permission_name`, `module_name`, `description`) VALUES
(1, 'dashboard.view', 'Dashboard', NULL),
(2, 'project.view', 'Project', NULL),
(3, 'project.create', 'Project', NULL),
(4, 'project.edit', 'Project', NULL),
(5, 'project.delete', 'Project', NULL),
(6, 'rab.view', 'RAB', NULL),
(7, 'rab.edit', 'RAB', NULL),
(8, 'purchasing.view', 'Purchasing', NULL),
(9, 'finance.view', 'Finance', NULL),
(10, 'master_material.view', 'Master Material', NULL),
(11, 'master_ahsp.view', 'Master AHSP', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` bigint NOT NULL,
  `project_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` bigint NOT NULL,
  `project_manager_id` bigint DEFAULT NULL,
  `project_type_id` int NOT NULL,
  `material_class_id` int NOT NULL,
  `labor_type_id` int NOT NULL,
  `building_area` decimal(10,2) DEFAULT NULL,
  `floors` int DEFAULT '1',
  `location_condition` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `contract_value` decimal(18,2) DEFAULT '0.00',
  `dp_amount` decimal(18,2) DEFAULT '0.00',
  `dp_percentage` decimal(5,2) DEFAULT '0.00',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('Perencanaan','Berjalan','Tertunda','Selesai') COLLATE utf8mb4_unicode_ci DEFAULT 'Perencanaan',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_documents`
--

CREATE TABLE `project_documents` (
  `id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  `document_type` enum('Blueprint','Kontrak','Foto Lokasi','Lainnya') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_members`
--

CREATE TABLE `project_members` (
  `id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `role_in_project` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_payment_terms`
--

CREATE TABLE `project_payment_terms` (
  `id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  `term_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `progress_percent` decimal(5,2) DEFAULT NULL,
  `payment_percent` decimal(5,2) DEFAULT NULL,
  `amount` decimal(18,2) DEFAULT NULL,
  `status` enum('Pending','Invoiced','Paid') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `due_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_scopes`
--

CREATE TABLE `project_scopes` (
  `id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  `scope_name` enum('Struktur','Arsitektur','MEP','Finishing','Lainnya') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_templates`
--

CREATE TABLE `project_templates` (
  `id` bigint NOT NULL,
  `template_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_type_id` int NOT NULL,
  `default_floors` int DEFAULT '1',
  `default_area` decimal(10,2) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_templates`
--

INSERT INTO `project_templates` (`id`, `template_code`, `template_name`, `project_type_id`, `default_floors`, `default_area`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'TPL001', 'Rumah Tinggal 45', 1, 1, '45.00', 'Template rumah tipe 45', 1, '2026-07-06 10:48:58', '2026-07-06 10:48:58'),
(2, 'TPL002', 'Rumah Tinggal 60', 1, 2, '60.00', 'Template rumah tipe 60', 1, '2026-07-06 10:48:58', '2026-07-06 10:48:58');

-- --------------------------------------------------------

--
-- Table structure for table `project_template_items`
--

CREATE TABLE `project_template_items` (
  `id` bigint NOT NULL,
  `template_id` bigint NOT NULL,
  `work_category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `work_item` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sequence_no` int DEFAULT '1',
  `is_required` tinyint(1) DEFAULT '1',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_template_items`
--

INSERT INTO `project_template_items` (`id`, `template_id`, `work_category`, `work_item`, `sequence_no`, `is_required`, `remarks`, `created_at`) VALUES
(1, 1, 'Persiapan', 'Pembersihan Lahan', 1, 1, NULL, '2026-07-06 10:48:58'),
(2, 1, 'Tanah', 'Galian Pondasi', 2, 1, NULL, '2026-07-06 10:48:58'),
(3, 1, 'Pondasi', 'Pondasi Batu Kali', 3, 1, NULL, '2026-07-06 10:48:58'),
(4, 1, 'Struktur', 'Sloof Beton', 4, 1, NULL, '2026-07-06 10:48:58'),
(5, 1, 'Struktur', 'Kolom Beton', 5, 1, NULL, '2026-07-06 10:48:58'),
(6, 1, 'Struktur', 'Balok Beton', 6, 1, NULL, '2026-07-06 10:48:58'),
(7, 1, 'Dinding', 'Pasangan Bata Ringan', 7, 1, NULL, '2026-07-06 10:48:58'),
(8, 1, 'Atap', 'Rangka Atap', 8, 1, NULL, '2026-07-06 10:48:58'),
(9, 1, 'Atap', 'Penutup Atap', 9, 1, NULL, '2026-07-06 10:48:58'),
(10, 1, 'Lantai', 'Keramik', 10, 1, NULL, '2026-07-06 10:48:58'),
(11, 1, 'MEP', 'Instalasi Listrik', 11, 1, NULL, '2026-07-06 10:48:58'),
(12, 1, 'MEP', 'Instalasi Air Bersih', 12, 1, NULL, '2026-07-06 10:48:58'),
(13, 1, 'Finishing', 'Pengecatan', 13, 1, NULL, '2026-07-06 10:48:58');

-- --------------------------------------------------------

--
-- Table structure for table `project_types`
--

CREATE TABLE `project_types` (
  `id` int NOT NULL,
  `project_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_types`
--

INSERT INTO `project_types` (`id`, `project_type`, `description`) VALUES
(1, 'Rumah Tinggal', NULL),
(2, 'Renovasi', NULL),
(3, 'Renovasi Interior', NULL),
(4, 'Penambahan Bangunan', NULL),
(5, 'Komersial', NULL),
(6, 'Gudang', NULL),
(7, 'Pabrik', NULL),
(8, 'Perkantoran', NULL),
(9, 'Ruko', NULL),
(10, 'Infrastruktur', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rab_headers`
--

CREATE TABLE `rab_headers` (
  `id` bigint NOT NULL,
  `rab_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` bigint NOT NULL,
  `boq_id` bigint NOT NULL,
  `version_no` int DEFAULT '1',
  `generated_by` bigint DEFAULT NULL,
  `generated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `material_cost` decimal(18,2) DEFAULT '0.00',
  `labor_cost` decimal(18,2) DEFAULT '0.00',
  `equipment_cost` decimal(18,2) DEFAULT '0.00',
  `overhead_cost` decimal(18,2) DEFAULT '0.00',
  `profit_percent` decimal(5,2) DEFAULT '15.00',
  `total_cost` decimal(18,2) DEFAULT '0.00',
  `grand_total` decimal(18,2) DEFAULT '0.00',
  `status` enum('Draft','Approved','Revised') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `notes` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rab_items`
--

CREATE TABLE `rab_items` (
  `id` bigint NOT NULL,
  `rab_id` bigint NOT NULL,
  `boq_item_id` bigint NOT NULL,
  `wbs_item_id` bigint NOT NULL,
  `ahsp_id` bigint DEFAULT NULL,
  `quantity` decimal(18,3) NOT NULL,
  `material_cost` decimal(18,2) DEFAULT '0.00',
  `labor_cost` decimal(18,2) DEFAULT '0.00',
  `equipment_cost` decimal(18,2) DEFAULT '0.00',
  `subtotal` decimal(18,2) DEFAULT '0.00',
  `profit_percent` decimal(5,2) DEFAULT '15.00',
  `total` decimal(18,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rab_resource_details`
--

CREATE TABLE `rab_resource_details` (
  `id` bigint NOT NULL,
  `rab_item_id` bigint NOT NULL,
  `resource_type` enum('Material','Labor','Equipment') COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_id` bigint NOT NULL,
  `coefficient` decimal(18,4) NOT NULL,
  `quantity` decimal(18,4) NOT NULL,
  `unit_price` decimal(18,2) NOT NULL,
  `total_price` decimal(18,2) GENERATED ALWAYS AS ((`quantity` * `unit_price`)) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Owner', 'Akses penuh seluruh sistem', '2026-07-06 10:34:06', '2026-07-06 10:34:06'),
(2, 'Finance', 'Mengelola keuangan', '2026-07-06 10:34:06', '2026-07-06 10:34:06'),
(3, 'Purchasing', 'Mengelola pembelian material', '2026-07-06 10:34:06', '2026-07-06 10:34:06'),
(4, 'Project Manager', 'Mengelola proyek', '2026-07-06 10:34:06', '2026-07-06 10:34:06'),
(5, 'Mandor', 'Mengelola pekerjaan lapangan', '2026-07-06 10:34:06', '2026-07-06 10:34:06');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` bigint NOT NULL,
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` int NOT NULL,
  `unit_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `unit_code`, `unit_name`, `description`, `created_at`) VALUES
(1, 'PCS', 'Pieces', NULL, '2026-07-06 10:36:14'),
(2, 'M', 'Meter', NULL, '2026-07-06 10:36:14'),
(3, 'M2', 'Meter Persegi', NULL, '2026-07-06 10:36:14'),
(4, 'M3', 'Meter Kubik', NULL, '2026-07-06 10:36:14'),
(5, 'KG', 'Kilogram', NULL, '2026-07-06 10:36:14'),
(6, 'TON', 'Ton', NULL, '2026-07-06 10:36:14'),
(7, 'SAK', 'Sak', NULL, '2026-07-06 10:36:14'),
(8, 'LTR', 'Liter', NULL, '2026-07-06 10:36:14'),
(9, 'BTG', 'Batang', NULL, '2026-07-06 10:36:14'),
(10, 'LS', 'Lumpsum', NULL, '2026-07-06 10:36:14');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `role_id` int NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('L','P') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `last_login` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `remember_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `login_time` datetime DEFAULT NULL,
  `logout_time` datetime DEFAULT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `browser` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `operating_system` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token` text COLLATE utf8mb4_unicode_ci,
  `status` enum('LOGIN','LOGOUT') COLLATE utf8mb4_unicode_ci DEFAULT 'LOGIN',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `id` bigint NOT NULL,
  `vendor_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_holder` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_ahsp_detail`
-- (See below for the actual view)
--
CREATE TABLE `vw_ahsp_detail` (
`ahsp_code` varchar(40)
,`ahsp_name` varchar(255)
,`equipment_coef` decimal(18,4)
,`equipment_name` varchar(150)
,`item_code` varchar(30)
,`item_name` varchar(200)
,`labor_coef` decimal(18,4)
,`labor_name` varchar(150)
,`material_coef` decimal(18,4)
,`material_name` varchar(150)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_master_resource`
-- (See below for the actual view)
--
CREATE TABLE `vw_master_resource` (
`category` varchar(100)
,`code` varchar(30)
,`id` bigint
,`name` varchar(150)
,`rate` decimal(18,2)
,`resource_type` varchar(9)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_material_master`
-- (See below for the actual view)
--
CREATE TABLE `vw_material_master` (
`category_name` varchar(100)
,`current_stock` decimal(18,2)
,`id` bigint
,`material_code` varchar(30)
,`material_name` varchar(150)
,`minimum_stock` decimal(18,2)
,`purchase_price` decimal(18,2)
,`selling_price` decimal(18,2)
,`status` enum('Active','Inactive')
,`unit_name` varchar(50)
,`vendor_name` varchar(150)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_project_summary`
-- (See below for the actual view)
--
CREATE TABLE `vw_project_summary` (
`contract_value` decimal(18,2)
,`customer_name` varchar(150)
,`end_date` date
,`id` bigint
,`project_code` varchar(30)
,`project_name` varchar(200)
,`project_type` varchar(100)
,`start_date` date
,`status` enum('Perencanaan','Berjalan','Tertunda','Selesai')
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_project_template_items`
-- (See below for the actual view)
--
CREATE TABLE `vw_project_template_items` (
`sequence_no` int
,`template_id` bigint
,`template_name` varchar(150)
,`work_category` varchar(100)
,`work_item` varchar(200)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_rab_summary`
-- (See below for the actual view)
--
CREATE TABLE `vw_rab_summary` (
`equipment_cost` decimal(18,2)
,`generated_at` datetime
,`grand_total` decimal(18,2)
,`id` bigint
,`labor_cost` decimal(18,2)
,`material_cost` decimal(18,2)
,`overhead_cost` decimal(18,2)
,`profit_percent` decimal(5,2)
,`project_name` varchar(200)
,`rab_code` varchar(30)
,`status` enum('Draft','Approved','Revised')
,`total_cost` decimal(18,2)
,`version_no` int
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_wbs_master`
-- (See below for the actual view)
--
CREATE TABLE `vw_wbs_master` (
`category_code` varchar(10)
,`category_name` varchar(150)
,`item_code` varchar(30)
,`item_name` varchar(200)
,`sub_code` varchar(20)
,`sub_name` varchar(150)
,`unit_name` varchar(50)
);

-- --------------------------------------------------------

--
-- Table structure for table `wbs_categories`
--

CREATE TABLE `wbs_categories` (
  `id` int NOT NULL,
  `category_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wbs_categories`
--

INSERT INTO `wbs_categories` (`id`, `category_code`, `category_name`, `description`, `sort_order`, `is_active`, `created_at`) VALUES
(1, '01', 'Persiapan', NULL, 1, 1, '2026-07-06 10:51:03'),
(2, '02', 'Pekerjaan Tanah', NULL, 2, 1, '2026-07-06 10:51:03'),
(3, '03', 'Pondasi', NULL, 3, 1, '2026-07-06 10:51:03'),
(4, '04', 'Struktur', NULL, 4, 1, '2026-07-06 10:51:03'),
(5, '05', 'Dinding', NULL, 5, 1, '2026-07-06 10:51:03'),
(6, '06', 'Atap', NULL, 6, 1, '2026-07-06 10:51:03'),
(7, '07', 'MEP', NULL, 7, 1, '2026-07-06 10:51:03'),
(8, '08', 'Finishing', NULL, 8, 1, '2026-07-06 10:51:03');

-- --------------------------------------------------------

--
-- Table structure for table `wbs_items`
--

CREATE TABLE `wbs_items` (
  `id` bigint NOT NULL,
  `subcategory_id` bigint NOT NULL,
  `item_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_id` int NOT NULL,
  `default_volume_formula` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wbs_items`
--

INSERT INTO `wbs_items` (`id`, `subcategory_id`, `item_code`, `item_name`, `unit_id`, `default_volume_formula`, `sort_order`, `is_active`, `created_at`) VALUES
(1, 1, '01.01.001', 'Pembersihan Semak', 3, NULL, 1, 1, '2026-07-06 10:51:03'),
(2, 1, '01.01.002', 'Pembersihan Sampah', 3, NULL, 2, 1, '2026-07-06 10:51:03'),
(3, 3, '02.01.001', 'Galian Pondasi Batu Kali', 4, NULL, 1, 1, '2026-07-06 10:51:03'),
(4, 5, '03.01.001', 'Pasangan Pondasi Batu Kali', 4, NULL, 1, 1, '2026-07-06 10:51:03'),
(5, 6, '04.01.001', 'Pengecoran Sloof', 4, NULL, 1, 1, '2026-07-06 10:51:03'),
(6, 7, '04.02.001', 'Pengecoran Kolom', 4, NULL, 1, 1, '2026-07-06 10:51:03'),
(7, 8, '04.03.001', 'Pengecoran Balok', 4, NULL, 1, 1, '2026-07-06 10:51:03'),
(8, 9, '05.01.001', 'Pasangan Bata Ringan', 3, NULL, 1, 1, '2026-07-06 10:51:03'),
(9, 10, '06.01.001', 'Pemasangan Baja Ringan', 3, NULL, 1, 1, '2026-07-06 10:51:03'),
(10, 11, '07.01.001', 'Instalasi Titik Lampu', 1, NULL, 1, 1, '2026-07-06 10:51:03'),
(11, 12, '07.02.001', 'Instalasi Pipa Air Bersih', 2, NULL, 1, 1, '2026-07-06 10:51:03'),
(12, 13, '08.01.001', 'Pemasangan Keramik', 3, NULL, 1, 1, '2026-07-06 10:51:03'),
(13, 14, '08.02.001', 'Pengecatan Interior', 3, NULL, 1, 1, '2026-07-06 10:51:03');

-- --------------------------------------------------------

--
-- Table structure for table `wbs_resources`
--

CREATE TABLE `wbs_resources` (
  `id` bigint NOT NULL,
  `wbs_item_id` bigint NOT NULL,
  `resource_type` enum('Material','Labor','Equipment') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resource_reference` bigint DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wbs_subcategories`
--

CREATE TABLE `wbs_subcategories` (
  `id` bigint NOT NULL,
  `category_id` int NOT NULL,
  `sub_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sub_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wbs_subcategories`
--

INSERT INTO `wbs_subcategories` (`id`, `category_id`, `sub_code`, `sub_name`, `description`, `sort_order`, `is_active`, `created_at`) VALUES
(1, 1, '01.01', 'Pembersihan Lahan', NULL, 1, 1, '2026-07-06 10:51:03'),
(2, 1, '01.02', 'Pengukuran Bouwplank', NULL, 2, 1, '2026-07-06 10:51:03'),
(3, 2, '02.01', 'Galian Pondasi', NULL, 1, 1, '2026-07-06 10:51:03'),
(4, 2, '02.02', 'Urugan Tanah', NULL, 2, 1, '2026-07-06 10:51:03'),
(5, 3, '03.01', 'Pondasi Batu Kali', NULL, 1, 1, '2026-07-06 10:51:03'),
(6, 4, '04.01', 'Sloof', NULL, 1, 1, '2026-07-06 10:51:03'),
(7, 4, '04.02', 'Kolom', NULL, 2, 1, '2026-07-06 10:51:03'),
(8, 4, '04.03', 'Balok', NULL, 3, 1, '2026-07-06 10:51:03'),
(9, 5, '05.01', 'Pasangan Bata', NULL, 1, 1, '2026-07-06 10:51:03'),
(10, 6, '06.01', 'Rangka Atap', NULL, 1, 1, '2026-07-06 10:51:03'),
(11, 7, '07.01', 'Instalasi Listrik', NULL, 1, 1, '2026-07-06 10:51:03'),
(12, 7, '07.02', 'Instalasi Air', NULL, 2, 1, '2026-07-06 10:51:03'),
(13, 8, '08.01', 'Keramik', NULL, 1, 1, '2026-07-06 10:51:03'),
(14, 8, '08.02', 'Pengecatan', NULL, 2, 1, '2026-07-06 10:51:03');

-- --------------------------------------------------------

--
-- Table structure for table `wbs_template_items`
--

CREATE TABLE `wbs_template_items` (
  `id` bigint NOT NULL,
  `template_id` bigint NOT NULL,
  `wbs_item_id` bigint NOT NULL,
  `sequence_no` int DEFAULT NULL,
  `is_required` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure for view `vw_ahsp_detail`
--
DROP TABLE IF EXISTS `vw_ahsp_detail`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_ahsp_detail`  AS SELECT `a`.`ahsp_code` AS `ahsp_code`, `a`.`ahsp_name` AS `ahsp_name`, `w`.`item_code` AS `item_code`, `w`.`item_name` AS `item_name`, `m`.`material_name` AS `material_name`, `am`.`coefficient` AS `material_coef`, `l`.`labor_name` AS `labor_name`, `al`.`coefficient` AS `labor_coef`, `e`.`equipment_name` AS `equipment_name`, `ae`.`coefficient` AS `equipment_coef` FROM (((((((`ahsp_headers` `a` join `wbs_items` `w` on((`w`.`id` = `a`.`wbs_item_id`))) left join `ahsp_materials` `am` on((`am`.`ahsp_id` = `a`.`id`))) left join `materials` `m` on((`m`.`id` = `am`.`material_id`))) left join `ahsp_labors` `al` on((`al`.`ahsp_id` = `a`.`id`))) left join `labors` `l` on((`l`.`id` = `al`.`labor_id`))) left join `ahsp_equipments` `ae` on((`ae`.`ahsp_id` = `a`.`id`))) left join `equipments` `e` on((`e`.`id` = `ae`.`equipment_id`)))  ;

-- --------------------------------------------------------

--
-- Structure for view `vw_master_resource`
--
DROP TABLE IF EXISTS `vw_master_resource`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_master_resource`  AS SELECT 'LABOR' AS `resource_type`, `l`.`id` AS `id`, `l`.`labor_code` AS `code`, `l`.`labor_name` AS `name`, `lc`.`category_name` AS `category`, `l`.`daily_rate` AS `rate` FROM (`labors` `l` join `labor_categories` `lc` on((`lc`.`id` = `l`.`category_id`))) union all select 'EQUIPMENT' AS `EQUIPMENT`,`e`.`id` AS `id`,`e`.`equipment_code` AS `equipment_code`,`e`.`equipment_name` AS `equipment_name`,`ec`.`category_name` AS `category_name`,`e`.`rental_rate` AS `rental_rate` from (`equipments` `e` join `equipment_categories` `ec` on((`ec`.`id` = `e`.`category_id`)))  ;

-- --------------------------------------------------------

--
-- Structure for view `vw_material_master`
--
DROP TABLE IF EXISTS `vw_material_master`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_material_master`  AS SELECT `m`.`id` AS `id`, `m`.`material_code` AS `material_code`, `m`.`material_name` AS `material_name`, `mc`.`category_name` AS `category_name`, `u`.`unit_name` AS `unit_name`, `v`.`vendor_name` AS `vendor_name`, `m`.`purchase_price` AS `purchase_price`, `m`.`selling_price` AS `selling_price`, `m`.`current_stock` AS `current_stock`, `m`.`minimum_stock` AS `minimum_stock`, `m`.`status` AS `status` FROM (((`materials` `m` left join `material_categories` `mc` on((`mc`.`id` = `m`.`category_id`))) left join `units` `u` on((`u`.`id` = `m`.`unit_id`))) left join `vendors` `v` on((`v`.`id` = `m`.`default_vendor_id`)))  ;

-- --------------------------------------------------------

--
-- Structure for view `vw_project_summary`
--
DROP TABLE IF EXISTS `vw_project_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_project_summary`  AS SELECT `p`.`id` AS `id`, `p`.`project_code` AS `project_code`, `p`.`project_name` AS `project_name`, `c`.`customer_name` AS `customer_name`, `pt`.`project_type` AS `project_type`, `p`.`contract_value` AS `contract_value`, `p`.`status` AS `status`, `p`.`start_date` AS `start_date`, `p`.`end_date` AS `end_date` FROM ((`projects` `p` join `customers` `c` on((`c`.`id` = `p`.`customer_id`))) join `project_types` `pt` on((`pt`.`id` = `p`.`project_type_id`)))  ;

-- --------------------------------------------------------

--
-- Structure for view `vw_project_template_items`
--
DROP TABLE IF EXISTS `vw_project_template_items`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_project_template_items`  AS SELECT `pt`.`id` AS `template_id`, `pt`.`template_name` AS `template_name`, `pti`.`sequence_no` AS `sequence_no`, `pti`.`work_category` AS `work_category`, `pti`.`work_item` AS `work_item` FROM (`project_templates` `pt` join `project_template_items` `pti` on((`pt`.`id` = `pti`.`template_id`))) ORDER BY `pt`.`template_name` ASC, `pti`.`sequence_no` ASC  ;

-- --------------------------------------------------------

--
-- Structure for view `vw_rab_summary`
--
DROP TABLE IF EXISTS `vw_rab_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_rab_summary`  AS SELECT `rh`.`id` AS `id`, `rh`.`rab_code` AS `rab_code`, `p`.`project_name` AS `project_name`, `rh`.`version_no` AS `version_no`, `rh`.`material_cost` AS `material_cost`, `rh`.`labor_cost` AS `labor_cost`, `rh`.`equipment_cost` AS `equipment_cost`, `rh`.`overhead_cost` AS `overhead_cost`, `rh`.`profit_percent` AS `profit_percent`, `rh`.`total_cost` AS `total_cost`, `rh`.`grand_total` AS `grand_total`, `rh`.`status` AS `status`, `rh`.`generated_at` AS `generated_at` FROM (`rab_headers` `rh` join `projects` `p` on((`p`.`id` = `rh`.`project_id`)))  ;

-- --------------------------------------------------------

--
-- Structure for view `vw_wbs_master`
--
DROP TABLE IF EXISTS `vw_wbs_master`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_wbs_master`  AS SELECT `c`.`category_code` AS `category_code`, `c`.`category_name` AS `category_name`, `s`.`sub_code` AS `sub_code`, `s`.`sub_name` AS `sub_name`, `i`.`item_code` AS `item_code`, `i`.`item_name` AS `item_name`, `u`.`unit_name` AS `unit_name` FROM (((`wbs_categories` `c` join `wbs_subcategories` `s` on((`s`.`category_id` = `c`.`id`))) join `wbs_items` `i` on((`i`.`subcategory_id` = `s`.`id`))) join `units` `u` on((`u`.`id` = `i`.`unit_id`))) ORDER BY `c`.`category_code` ASC, `s`.`sub_code` ASC, `i`.`item_code` ASC  ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_activity_user` (`user_id`);

--
-- Indexes for table `ahsp_equipments`
--
ALTER TABLE `ahsp_equipments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ae_ahsp` (`ahsp_id`),
  ADD KEY `fk_ae_equipment` (`equipment_id`);

--
-- Indexes for table `ahsp_headers`
--
ALTER TABLE `ahsp_headers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ahsp_code` (`ahsp_code`),
  ADD KEY `fk_ahsp_ver` (`version_id`),
  ADD KEY `idx_ahsp_code` (`ahsp_code`),
  ADD KEY `idx_ahsp_wbs` (`wbs_item_id`);

--
-- Indexes for table `ahsp_labors`
--
ALTER TABLE `ahsp_labors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_al_ahsp` (`ahsp_id`),
  ADD KEY `fk_al_labor` (`labor_id`);

--
-- Indexes for table `ahsp_materials`
--
ALTER TABLE `ahsp_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_am_ahsp` (`ahsp_id`),
  ADD KEY `fk_am_material` (`material_id`);

--
-- Indexes for table `ahsp_versions`
--
ALTER TABLE `ahsp_versions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `version_code` (`version_code`);

--
-- Indexes for table `approvals`
--
ALTER TABLE `approvals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_approval_request` (`requested_by`),
  ADD KEY `fk_approval_approve` (`approved_by`);

--
-- Indexes for table `boq_headers`
--
ALTER TABLE `boq_headers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `boq_code` (`boq_code`),
  ADD KEY `fk_boq_user` (`generated_by`),
  ADD KEY `idx_boq_project` (`project_id`);

--
-- Indexes for table `boq_items`
--
ALTER TABLE `boq_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_boq_header` (`boq_id`),
  ADD KEY `fk_boq_unit` (`unit_id`),
  ADD KEY `idx_boq_item_wbs` (`wbs_item_id`),
  ADD KEY `idx_boq_item_ahsp` (`ahsp_id`);

--
-- Indexes for table `boq_resources`
--
ALTER TABLE `boq_resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_boq_res_item` (`boq_item_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_code` (`customer_code`);

--
-- Indexes for table `equipments`
--
ALTER TABLE `equipments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `equipment_code` (`equipment_code`),
  ADD KEY `fk_eq_cat` (`category_id`),
  ADD KEY `fk_eq_unit` (`unit_id`),
  ADD KEY `idx_equipment_name` (`equipment_name`);

--
-- Indexes for table `equipment_categories`
--
ALTER TABLE `equipment_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `equipment_maintenance`
--
ALTER TABLE `equipment_maintenance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_maint_eq` (`equipment_id`);

--
-- Indexes for table `equipment_rates`
--
ALTER TABLE `equipment_rates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_rate_eq` (`equipment_id`);

--
-- Indexes for table `labors`
--
ALTER TABLE `labors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `labor_code` (`labor_code`),
  ADD KEY `fk_labor_cat` (`category_id`),
  ADD KEY `fk_labor_unit` (`unit_id`),
  ADD KEY `idx_labor_name` (`labor_name`);

--
-- Indexes for table `labor_categories`
--
ALTER TABLE `labor_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `labor_types`
--
ALTER TABLE `labor_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `material_code` (`material_code`),
  ADD KEY `fk_material_unit` (`unit_id`),
  ADD KEY `fk_material_vendor` (`default_vendor_id`),
  ADD KEY `idx_material_name` (`material_name`),
  ADD KEY `idx_material_category` (`category_id`);

--
-- Indexes for table `material_categories`
--
ALTER TABLE `material_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `material_classes`
--
ALTER TABLE `material_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `class_name` (`class_name`);

--
-- Indexes for table `material_price_history`
--
ALTER TABLE `material_price_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_history_vendor` (`vendor_id`),
  ADD KEY `fk_history_user` (`created_by`),
  ADD KEY `idx_price_material` (`material_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notification_user` (`user_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `project_code` (`project_code`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `project_manager_id` (`project_manager_id`),
  ADD KEY `project_type_id` (`project_type_id`),
  ADD KEY `material_class_id` (`material_class_id`),
  ADD KEY `labor_type_id` (`labor_type_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_project_status` (`status`),
  ADD KEY `idx_project_dates` (`start_date`,`end_date`);

--
-- Indexes for table `project_documents`
--
ALTER TABLE `project_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `project_members`
--
ALTER TABLE `project_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `project_payment_terms`
--
ALTER TABLE `project_payment_terms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `project_scopes`
--
ALTER TABLE `project_scopes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `project_templates`
--
ALTER TABLE `project_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `template_code` (`template_code`),
  ADD KEY `idx_tpl_project_type` (`project_type_id`);

--
-- Indexes for table `project_template_items`
--
ALTER TABLE `project_template_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tpl_item_seq` (`template_id`,`sequence_no`);

--
-- Indexes for table `project_types`
--
ALTER TABLE `project_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `project_type` (`project_type`);

--
-- Indexes for table `rab_headers`
--
ALTER TABLE `rab_headers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rab_code` (`rab_code`),
  ADD KEY `generated_by` (`generated_by`),
  ADD KEY `idx_rab_project` (`project_id`),
  ADD KEY `idx_rab_boq` (`boq_id`);

--
-- Indexes for table `rab_items`
--
ALTER TABLE `rab_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rab_id` (`rab_id`),
  ADD KEY `boq_item_id` (`boq_item_id`),
  ADD KEY `wbs_item_id` (`wbs_item_id`),
  ADD KEY `ahsp_id` (`ahsp_id`);

--
-- Indexes for table `rab_resource_details`
--
ALTER TABLE `rab_resource_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rab_item_id` (`rab_item_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_id` (`role_id`,`permission_id`),
  ADD KEY `fk_rp_permission` (`permission_id`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unit_code` (`unit_code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `fk_user_role` (`role_id`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_session_user` (`user_id`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vendor_code` (`vendor_code`);

--
-- Indexes for table `wbs_categories`
--
ALTER TABLE `wbs_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category_code` (`category_code`);

--
-- Indexes for table `wbs_items`
--
ALTER TABLE `wbs_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `item_code` (`item_code`),
  ADD KEY `fk_wbs_sub` (`subcategory_id`),
  ADD KEY `fk_wbs_unit` (`unit_id`),
  ADD KEY `idx_wbs_code` (`item_code`),
  ADD KEY `idx_wbs_name` (`item_name`);

--
-- Indexes for table `wbs_resources`
--
ALTER TABLE `wbs_resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_wbs_resource` (`wbs_item_id`);

--
-- Indexes for table `wbs_subcategories`
--
ALTER TABLE `wbs_subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_wbs_cat` (`category_id`);

--
-- Indexes for table `wbs_template_items`
--
ALTER TABLE `wbs_template_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tpl_map` (`template_id`),
  ADD KEY `fk_wbs_map` (`wbs_item_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ahsp_equipments`
--
ALTER TABLE `ahsp_equipments`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `ahsp_headers`
--
ALTER TABLE `ahsp_headers`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ahsp_labors`
--
ALTER TABLE `ahsp_labors`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `ahsp_materials`
--
ALTER TABLE `ahsp_materials`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `ahsp_versions`
--
ALTER TABLE `ahsp_versions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `approvals`
--
ALTER TABLE `approvals`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `boq_headers`
--
ALTER TABLE `boq_headers`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `boq_items`
--
ALTER TABLE `boq_items`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `boq_resources`
--
ALTER TABLE `boq_resources`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `equipments`
--
ALTER TABLE `equipments`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `equipment_categories`
--
ALTER TABLE `equipment_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `equipment_maintenance`
--
ALTER TABLE `equipment_maintenance`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `equipment_rates`
--
ALTER TABLE `equipment_rates`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `labors`
--
ALTER TABLE `labors`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `labor_categories`
--
ALTER TABLE `labor_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `labor_types`
--
ALTER TABLE `labor_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `material_categories`
--
ALTER TABLE `material_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `material_classes`
--
ALTER TABLE `material_classes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `material_price_history`
--
ALTER TABLE `material_price_history`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_documents`
--
ALTER TABLE `project_documents`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_members`
--
ALTER TABLE `project_members`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_payment_terms`
--
ALTER TABLE `project_payment_terms`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_scopes`
--
ALTER TABLE `project_scopes`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_templates`
--
ALTER TABLE `project_templates`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `project_template_items`
--
ALTER TABLE `project_template_items`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `project_types`
--
ALTER TABLE `project_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `rab_headers`
--
ALTER TABLE `rab_headers`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rab_items`
--
ALTER TABLE `rab_items`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rab_resource_details`
--
ALTER TABLE `rab_resource_details`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wbs_categories`
--
ALTER TABLE `wbs_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `wbs_items`
--
ALTER TABLE `wbs_items`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `wbs_resources`
--
ALTER TABLE `wbs_resources`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wbs_subcategories`
--
ALTER TABLE `wbs_subcategories`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `wbs_template_items`
--
ALTER TABLE `wbs_template_items`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `ahsp_equipments`
--
ALTER TABLE `ahsp_equipments`
  ADD CONSTRAINT `fk_ae_ahsp` FOREIGN KEY (`ahsp_id`) REFERENCES `ahsp_headers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ae_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipments` (`id`);

--
-- Constraints for table `ahsp_headers`
--
ALTER TABLE `ahsp_headers`
  ADD CONSTRAINT `fk_ahsp_ver` FOREIGN KEY (`version_id`) REFERENCES `ahsp_versions` (`id`),
  ADD CONSTRAINT `fk_ahsp_wbs` FOREIGN KEY (`wbs_item_id`) REFERENCES `wbs_items` (`id`);

--
-- Constraints for table `ahsp_labors`
--
ALTER TABLE `ahsp_labors`
  ADD CONSTRAINT `fk_al_ahsp` FOREIGN KEY (`ahsp_id`) REFERENCES `ahsp_headers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_al_labor` FOREIGN KEY (`labor_id`) REFERENCES `labors` (`id`);

--
-- Constraints for table `ahsp_materials`
--
ALTER TABLE `ahsp_materials`
  ADD CONSTRAINT `fk_am_ahsp` FOREIGN KEY (`ahsp_id`) REFERENCES `ahsp_headers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_am_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`);

--
-- Constraints for table `approvals`
--
ALTER TABLE `approvals`
  ADD CONSTRAINT `fk_approval_approve` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_approval_request` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `boq_headers`
--
ALTER TABLE `boq_headers`
  ADD CONSTRAINT `fk_boq_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `fk_boq_user` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `boq_items`
--
ALTER TABLE `boq_items`
  ADD CONSTRAINT `fk_boq_ahsp` FOREIGN KEY (`ahsp_id`) REFERENCES `ahsp_headers` (`id`),
  ADD CONSTRAINT `fk_boq_header` FOREIGN KEY (`boq_id`) REFERENCES `boq_headers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_boq_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  ADD CONSTRAINT `fk_boq_wbs` FOREIGN KEY (`wbs_item_id`) REFERENCES `wbs_items` (`id`);

--
-- Constraints for table `boq_resources`
--
ALTER TABLE `boq_resources`
  ADD CONSTRAINT `fk_boq_res_item` FOREIGN KEY (`boq_item_id`) REFERENCES `boq_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `equipments`
--
ALTER TABLE `equipments`
  ADD CONSTRAINT `fk_eq_cat` FOREIGN KEY (`category_id`) REFERENCES `equipment_categories` (`id`),
  ADD CONSTRAINT `fk_eq_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`);

--
-- Constraints for table `equipment_maintenance`
--
ALTER TABLE `equipment_maintenance`
  ADD CONSTRAINT `fk_maint_eq` FOREIGN KEY (`equipment_id`) REFERENCES `equipments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `equipment_rates`
--
ALTER TABLE `equipment_rates`
  ADD CONSTRAINT `fk_rate_eq` FOREIGN KEY (`equipment_id`) REFERENCES `equipments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `labors`
--
ALTER TABLE `labors`
  ADD CONSTRAINT `fk_labor_cat` FOREIGN KEY (`category_id`) REFERENCES `labor_categories` (`id`),
  ADD CONSTRAINT `fk_labor_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`);

--
-- Constraints for table `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `fk_material_category` FOREIGN KEY (`category_id`) REFERENCES `material_categories` (`id`),
  ADD CONSTRAINT `fk_material_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  ADD CONSTRAINT `fk_material_vendor` FOREIGN KEY (`default_vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `material_price_history`
--
ALTER TABLE `material_price_history`
  ADD CONSTRAINT `fk_history_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_history_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_history_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`project_manager_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `projects_ibfk_3` FOREIGN KEY (`project_type_id`) REFERENCES `project_types` (`id`),
  ADD CONSTRAINT `projects_ibfk_4` FOREIGN KEY (`material_class_id`) REFERENCES `material_classes` (`id`),
  ADD CONSTRAINT `projects_ibfk_5` FOREIGN KEY (`labor_type_id`) REFERENCES `labor_types` (`id`),
  ADD CONSTRAINT `projects_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `project_documents`
--
ALTER TABLE `project_documents`
  ADD CONSTRAINT `project_documents_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `project_members`
--
ALTER TABLE `project_members`
  ADD CONSTRAINT `project_members_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `project_payment_terms`
--
ALTER TABLE `project_payment_terms`
  ADD CONSTRAINT `project_payment_terms_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_scopes`
--
ALTER TABLE `project_scopes`
  ADD CONSTRAINT `project_scopes_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_templates`
--
ALTER TABLE `project_templates`
  ADD CONSTRAINT `fk_tpl_project_type` FOREIGN KEY (`project_type_id`) REFERENCES `project_types` (`id`);

--
-- Constraints for table `project_template_items`
--
ALTER TABLE `project_template_items`
  ADD CONSTRAINT `fk_tpl_item` FOREIGN KEY (`template_id`) REFERENCES `project_templates` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rab_headers`
--
ALTER TABLE `rab_headers`
  ADD CONSTRAINT `rab_headers_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `rab_headers_ibfk_2` FOREIGN KEY (`boq_id`) REFERENCES `boq_headers` (`id`),
  ADD CONSTRAINT `rab_headers_ibfk_3` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `rab_items`
--
ALTER TABLE `rab_items`
  ADD CONSTRAINT `rab_items_ibfk_1` FOREIGN KEY (`rab_id`) REFERENCES `rab_headers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rab_items_ibfk_2` FOREIGN KEY (`boq_item_id`) REFERENCES `boq_items` (`id`),
  ADD CONSTRAINT `rab_items_ibfk_3` FOREIGN KEY (`wbs_item_id`) REFERENCES `wbs_items` (`id`),
  ADD CONSTRAINT `rab_items_ibfk_4` FOREIGN KEY (`ahsp_id`) REFERENCES `ahsp_headers` (`id`);

--
-- Constraints for table `rab_resource_details`
--
ALTER TABLE `rab_resource_details`
  ADD CONSTRAINT `rab_resource_details_ibfk_1` FOREIGN KEY (`rab_item_id`) REFERENCES `rab_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `fk_session_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wbs_items`
--
ALTER TABLE `wbs_items`
  ADD CONSTRAINT `fk_wbs_sub` FOREIGN KEY (`subcategory_id`) REFERENCES `wbs_subcategories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_wbs_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`);

--
-- Constraints for table `wbs_resources`
--
ALTER TABLE `wbs_resources`
  ADD CONSTRAINT `fk_wbs_resource` FOREIGN KEY (`wbs_item_id`) REFERENCES `wbs_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wbs_subcategories`
--
ALTER TABLE `wbs_subcategories`
  ADD CONSTRAINT `fk_wbs_cat` FOREIGN KEY (`category_id`) REFERENCES `wbs_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wbs_template_items`
--
ALTER TABLE `wbs_template_items`
  ADD CONSTRAINT `fk_tpl_map` FOREIGN KEY (`template_id`) REFERENCES `project_templates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_wbs_map` FOREIGN KEY (`wbs_item_id`) REFERENCES `wbs_items` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
