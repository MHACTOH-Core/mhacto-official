/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.2.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: mhacto_db
-- ------------------------------------------------------
-- Server version	12.2.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(100) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES
(1,'admin','mhacto.municipalityofbocaue@gmail.com','$2y$12$7GWNefkMuvvdOkjGhgHF1OgZLQPn72BUu0d.lN3yUDnGARhU0xS8a','admin','2026-02-24 03:19:41'),
(2,'tourist_anna','','$2y$10$SampleHashForRegularUser0987654321','user','2026-02-24 03:19:41');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` enum('create','update','delete','login','logout') DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES
(1,1,'login','Admin logged in to the dashboard','192.168.1.15','2026-02-24 03:19:41'),
(2,1,'create','Added new content for St. Martin of Tours','192.168.1.15','2026-02-24 03:19:41');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `catergory`
--

DROP TABLE IF EXISTS `catergory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `catergory` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `label_name` varchar(50) DEFAULT NULL,
  `color_code` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catergory`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `catergory` WRITE;
/*!40000 ALTER TABLE `catergory` DISABLE KEYS */;
INSERT INTO `catergory` VALUES
(1,'Historical Site','#FF5733',1),
(2,'Festival','#33FF57',1),
(3,'Entertainment','#3357FF',1);
/*!40000 ALTER TABLE `catergory` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `click_analytics`
--

DROP TABLE IF EXISTS `click_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `click_analytics` (
  `click_id` int(11) NOT NULL AUTO_INCREMENT,
  `content_id` int(11) DEFAULT NULL,
  `page_path` varchar(255) DEFAULT NULL,
  `visitor_ip` varchar(45) DEFAULT NULL,
  `clicked_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`click_id`),
  KEY `content_id` (`content_id`),
  CONSTRAINT `1` FOREIGN KEY (`content_id`) REFERENCES `cms` (`content_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `click_analytics`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `click_analytics` WRITE;
/*!40000 ALTER TABLE `click_analytics` DISABLE KEYS */;
INSERT INTO `click_analytics` VALUES
(1,1,'/destinations/st-martin-parish','10.0.0.101','2026-02-24 03:19:41'),
(2,1,'/destinations/st-martin-parish','10.0.0.102','2026-02-24 03:19:41'),
(3,2,'/news/pagoda-festival-prep','10.0.0.105','2026-02-24 03:19:41');
/*!40000 ALTER TABLE `click_analytics` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cms`
--

DROP TABLE IF EXISTS `cms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cms` (
  `content_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `image_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`content_id`),
  KEY `user_id` (`user_id`),
  KEY `category_id` (`category_id`),
  KEY `fk_cms_featured_image` (`image_id`),
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `2` FOREIGN KEY (`category_id`) REFERENCES `catergory` (`category_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cms_featured_image` FOREIGN KEY (`image_id`) REFERENCES `content_image` (`image_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cms` WRITE;
/*!40000 ALTER TABLE `cms` DISABLE KEYS */;
INSERT INTO `cms` VALUES
(1,1,1,NULL,'St. Martin of Tours Parish','The diocesan shrine and home of the miraculous Krus sa Wawa.','published',1,'2026-02-24 03:19:41','2026-02-24 03:19:41'),
(2,1,2,NULL,'Upcoming Bocaue Pagoda Festival','Preparations are underway for the annual river festival held every first Sunday of July.','published',1,'2026-02-24 03:19:41','2026-02-24 03:19:41'),
(3,1,3,NULL,'Philippine Arena','The largest indoor arena in the world, hosting major international events.','published',0,'2026-02-24 03:19:41','2026-02-24 03:19:41'),
(6,1,NULL,NULL,'Bocaue River Festival','A historic and cultural water festival.','published',NULL,'2026-02-25 04:07:32','2026-02-25 04:07:32'),
(7,1,NULL,NULL,'Bocaue River Festival','A historic and cultural water festival.','published',NULL,'2026-02-25 04:47:47','2026-02-25 04:47:47'),
(8,1,NULL,NULL,'Bocaue River Festival','A historic and cultural water festival.','published',NULL,'2026-02-25 05:18:49','2026-02-25 05:18:49');
/*!40000 ALTER TABLE `cms` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `content_image`
--

DROP TABLE IF EXISTS `content_image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `content_image` (
  `image_id` int(11) NOT NULL AUTO_INCREMENT,
  `content_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_thumbnail` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`image_id`),
  KEY `content_id` (`content_id`),
  CONSTRAINT `1` FOREIGN KEY (`content_id`) REFERENCES `cms` (`content_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `content_image`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `content_image` WRITE;
/*!40000 ALTER TABLE `content_image` DISABLE KEYS */;
INSERT INTO `content_image` VALUES
(1,1,'public/images/places/church-bocaue.jpg',1,'2026-02-24 03:19:41'),
(2,1,'public/images/places/Arena.jpg',0,'2026-02-24 03:19:41'),
(3,2,'public/images/places/fireworks.jpg',1,'2026-02-24 03:19:41'),
(4,3,'public/images/places/oldtownbocaue.jpg',1,'2026-02-24 03:19:41');
/*!40000 ALTER TABLE `content_image` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `customer_inquiries`
--

DROP TABLE IF EXISTS `customer_inquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_inquiries` (
  `inquiry_id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) DEFAULT NULL,
  `Type` int(11) DEFAULT NULL,
  `purpose_id` int(11) DEFAULT NULL,
  `date_of_visit` date DEFAULT NULL,
  `number_of_pax` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  `is_starred` tinyint(1) DEFAULT NULL,
  `folder` enum('inbox','archive','spam','trash') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`inquiry_id`),
  KEY `sender_id` (`sender_id`),
  KEY `purpose_id` (`purpose_id`),
  CONSTRAINT `1` FOREIGN KEY (`sender_id`) REFERENCES `inquiry_sender` (`sender_id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`purpose_id`) REFERENCES `visit_purposes` (`purpose_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_inquiries`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `customer_inquiries` WRITE;
/*!40000 ALTER TABLE `customer_inquiries` DISABLE KEYS */;
INSERT INTO `customer_inquiries` VALUES
(1,1,1,1,'2026-04-15',5,'We are planning a family trip to see the church and the river. Are there guided tours available?',0,1,'inbox','2026-02-24 03:19:41',NULL),
(2,2,2,2,'2026-05-10',45,'Inquiring about an educational tour and technical visit for our IT and Tourism students.',0,0,'inbox','2026-02-24 03:19:41',NULL);
/*!40000 ALTER TABLE `customer_inquiries` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `inquiry_sender`
--

DROP TABLE IF EXISTS `inquiry_sender`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inquiry_sender` (
  `sender_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) DEFAULT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`sender_id`),
  UNIQUE KEY `email_address` (`email_address`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inquiry_sender`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `inquiry_sender` WRITE;
/*!40000 ALTER TABLE `inquiry_sender` DISABLE KEYS */;
INSERT INTO `inquiry_sender` VALUES
(1,'Maria Clara','maria@example.com','09171234567','2026-02-24 03:19:41'),
(2,'Jose Cruz','jose.cruz@example.com','09189876543','2026-02-24 03:19:41');
/*!40000 ALTER TABLE `inquiry_sender` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `news_id` int(11) NOT NULL AUTO_INCREMENT,
  `content_id` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`news_id`),
  KEY `content_id` (`content_id`),
  CONSTRAINT `1` FOREIGN KEY (`content_id`) REFERENCES `cms` (`content_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES
(1,2,'2026-06-15');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `place`
--

DROP TABLE IF EXISTS `place`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `place` (
  `place_id` int(11) NOT NULL AUTO_INCREMENT,
  `content_id` int(11) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `hours` varchar(100) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `established` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `story` text DEFAULT NULL,
  PRIMARY KEY (`place_id`),
  KEY `content_id` (`content_id`),
  CONSTRAINT `1` FOREIGN KEY (`content_id`) REFERENCES `cms` (`content_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `place`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `place` WRITE;
/*!40000 ALTER TABLE `place` DISABLE KEYS */;
INSERT INTO `place` VALUES
(1,1,'indoor','6:00 AM - 8:00 PM','2026-01-01 00:00:00','044-888-9999','1606','Church/Shrine','Founded by Franciscan missionaries, it is a cornerstone of Bocaue history...'),
(2,3,'indoor','8:00 AM - 5:00 PM','2026-01-01 00:00:00','0917-111-2222','2014','Arena/Events','Built for the Iglesia ni Cristo centennial, it holds the Guinness World Record...'),
(6,NULL,'Bocaue River','All Day Event',NULL,'09123456789',NULL,NULL,NULL),
(7,NULL,'Bocaue River','All Day Event',NULL,'09123456789',NULL,NULL,NULL),
(8,NULL,'Bocaue River','All Day Event',NULL,'09123456789',NULL,NULL,NULL);
/*!40000 ALTER TABLE `place` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `settings_id` int(11) NOT NULL AUTO_INCREMENT,
  `last_updated_by` int(11) DEFAULT NULL,
  `site_name` varchar(100) DEFAULT NULL,
  `site_description` text DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `office_address` varchar(255) DEFAULT NULL,
  `site_logo_url` varchar(255) DEFAULT NULL,
  `notify_inquiries` tinyint(1) DEFAULT NULL,
  `enable_analytics` tinyint(1) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`settings_id`),
  KEY `last_updated_by` (`last_updated_by`),
  CONSTRAINT `1` FOREIGN KEY (`last_updated_by`) REFERENCES `User` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES
(1,1,'MHACTO Portal','The official tourism and cultural heritage portal of Bocaue, Bulacan.','info@mhacto.com','(044) 123-4567','Bocaue Municipal Hall','/images/logos/mhacto-logo.png',1,1,'2026-02-24 03:19:41');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `student_verify`
--

DROP TABLE IF EXISTS `student_verify`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_verify` (
  `inquiry_id` int(11) NOT NULL,
  `student_number` varchar(255) DEFAULT NULL,
  `school_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`inquiry_id`),
  CONSTRAINT `1` FOREIGN KEY (`inquiry_id`) REFERENCES `customer_inquiries` (`inquiry_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_verify`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `student_verify` WRITE;
/*!40000 ALTER TABLE `student_verify` DISABLE KEYS */;
INSERT INTO `student_verify` VALUES
(2,'02000-123456','STI College Balagtas','2026-02-24 03:19:46');
/*!40000 ALTER TABLE `student_verify` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `visit_purposes`
--

DROP TABLE IF EXISTS `visit_purposes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit_purposes` (
  `purpose_id` int(11) NOT NULL AUTO_INCREMENT,
  `purpose_name` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`purpose_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit_purposes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `visit_purposes` WRITE;
/*!40000 ALTER TABLE `visit_purposes` DISABLE KEYS */;
INSERT INTO `visit_purposes` VALUES
(1,'Leisure & Tourism',1),
(2,'Educational Tour',1),
(3,'Research & Documentation',1);
/*!40000 ALTER TABLE `visit_purposes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Dumping routines for database 'mhacto_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-02-26 10:33:56
