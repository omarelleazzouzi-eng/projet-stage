-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : dim. 24 mai 2026 à 15:39
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestion_absences_bts`
--

-- --------------------------------------------------------

--
-- Structure de la table `absences`
--

DROP TABLE IF EXISTS `absences`;
CREATE TABLE IF NOT EXISTS `absences` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `etudiant_id` bigint UNSIGNED NOT NULL,
  `seance_id` bigint UNSIGNED NOT NULL,
  `statut` enum('present','absent','retard') COLLATE utf8mb4_unicode_ci NOT NULL,
  `heure_arrivee` time DEFAULT NULL,
  `justification` text COLLATE utf8mb4_unicode_ci,
  `est_justifiee` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `absences_etudiant_id_foreign` (`etudiant_id`),
  KEY `absences_seance_id_foreign` (`seance_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `annonces`
--

DROP TABLE IF EXISTS `annonces`;
CREATE TABLE IF NOT EXISTS `annonces` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `titre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenu` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `professor_id` bigint UNSIGNED DEFAULT NULL,
  `classe_id` bigint UNSIGNED DEFAULT NULL,
  `est_publique` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `annonces_professor_id_foreign` (`professor_id`),
  KEY `annonces_classe_id_foreign` (`classe_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cache`
--

DROP TABLE IF EXISTS `cache`;
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `classes`
--

DROP TABLE IF EXISTS `classes`;
CREATE TABLE IF NOT EXISTS `classes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filiere_id` bigint UNSIGNED NOT NULL,
  `niveau_id` bigint UNSIGNED NOT NULL,
  `annee_scolaire` int NOT NULL,
  `est_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `classes_code_unique` (`code`),
  KEY `classes_filiere_id_foreign` (`filiere_id`),
  KEY `classes_niveau_id_foreign` (`niveau_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `classes`
--

INSERT INTO `classes` (`id`, `nom`, `code`, `filiere_id`, `niveau_id`, `annee_scolaire`, `est_active`, `created_at`, `updated_at`) VALUES
(1, '1ère année DWFS', 'DWFS-1A', 1, 1, 2026, 1, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(2, '2ème année DWFS', 'DWFS-2A', 1, 2, 2026, 1, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(3, '1ère année PME', 'PME-1A', 2, 1, 2026, 1, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(4, '2ème année PME', 'PME-2A', 2, 2, 2026, 1, '2026-05-24 13:34:00', '2026-05-24 13:34:00');

-- --------------------------------------------------------

--
-- Structure de la table `classe_matiere`
--

DROP TABLE IF EXISTS `classe_matiere`;
CREATE TABLE IF NOT EXISTS `classe_matiere` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `classe_id` bigint UNSIGNED NOT NULL,
  `matiere_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `classe_matiere_classe_id_matiere_id_unique` (`classe_id`,`matiere_id`),
  KEY `classe_matiere_matiere_id_foreign` (`matiere_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `classe_professeur_matiere`
--

DROP TABLE IF EXISTS `classe_professeur_matiere`;
CREATE TABLE IF NOT EXISTS `classe_professeur_matiere` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `classe_id` bigint UNSIGNED NOT NULL,
  `professeur_id` bigint UNSIGNED NOT NULL,
  `matiere_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpm_unique` (`classe_id`,`professeur_id`,`matiere_id`),
  KEY `classe_professeur_matiere_professeur_id_foreign` (`professeur_id`),
  KEY `classe_professeur_matiere_matiere_id_foreign` (`matiere_id`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `classe_professeur_matiere`
--

INSERT INTO `classe_professeur_matiere` (`id`, `classe_id`, `professeur_id`, `matiere_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(2, 1, 1, 2, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(3, 1, 1, 3, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(4, 2, 1, 1, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(5, 2, 1, 2, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(6, 2, 1, 5, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(7, 3, 1, 6, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(8, 3, 1, 7, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(9, 3, 1, 4, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(10, 4, 1, 6, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(11, 4, 1, 7, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(12, 4, 1, 8, '2026-05-24 13:34:00', '2026-05-24 13:34:00');

-- --------------------------------------------------------

--
-- Structure de la table `clubs`
--

DROP TABLE IF EXISTS `clubs`;
CREATE TABLE IF NOT EXISTS `clubs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `logo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsable_id` bigint UNSIGNED DEFAULT NULL,
  `est_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `clubs_responsable_id_foreign` (`responsable_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cours`
--

DROP TABLE IF EXISTS `cours`;
CREATE TABLE IF NOT EXISTS `cours` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `titre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `classe_id` bigint UNSIGNED NOT NULL,
  `matiere_id` bigint UNSIGNED NOT NULL,
  `professor_id` bigint UNSIGNED NOT NULL,
  `fichier` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cours_classe_id_foreign` (`classe_id`),
  KEY `cours_matiere_id_foreign` (`matiere_id`),
  KEY `cours_professor_id_foreign` (`professor_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `emploi_temps`
--

DROP TABLE IF EXISTS `emploi_temps`;
CREATE TABLE IF NOT EXISTS `emploi_temps` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `classe_id` bigint UNSIGNED NOT NULL,
  `matiere_id` bigint UNSIGNED NOT NULL,
  `professeur_id` bigint UNSIGNED NOT NULL,
  `jour` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL,
  `salle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `emploi_temps_classe_id_foreign` (`classe_id`),
  KEY `emploi_temps_matiere_id_foreign` (`matiere_id`),
  KEY `emploi_temps_professeur_id_foreign` (`professeur_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `etudiants`
--

DROP TABLE IF EXISTS `etudiants`;
CREATE TABLE IF NOT EXISTS `etudiants` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `cne` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_naissance` date NOT NULL,
  `lieu_naissance` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `classe_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `est_archive` tinyint(1) NOT NULL DEFAULT '0',
  `annee_archive` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `etudiants_cne_unique` (`cne`),
  KEY `etudiants_user_id_foreign` (`user_id`),
  KEY `etudiants_classe_id_foreign` (`classe_id`)
) ENGINE=MyISAM AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `etudiants`
--

INSERT INTO `etudiants` (`id`, `cne`, `nom`, `prenom`, `email`, `date_naissance`, `lieu_naissance`, `telephone`, `photo`, `classe_id`, `user_id`, `est_archive`, `annee_archive`, `created_at`, `updated_at`) VALUES
(1, 'E1001', 'Alaoui', 'Ahmed', 'ahmed@email.com', '2000-01-01', NULL, '0600000000', NULL, 1, 3, 0, NULL, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(2, 'E1002', 'Benali', 'Fatima', 'fatima@email.com', '2000-01-01', NULL, '0600000000', NULL, 1, 4, 0, NULL, '2026-05-24 13:34:01', '2026-05-24 13:34:01'),
(3, 'E1003', 'Khaldi', 'Youssef', 'youssef@email.com', '2000-01-01', NULL, '0600000000', NULL, 1, 5, 0, NULL, '2026-05-24 13:34:01', '2026-05-24 13:34:01'),
(4, 'E1004', 'Moumen', 'Aicha', 'aicha@email.com', '2000-01-01', NULL, '0600000000', NULL, 1, 6, 0, NULL, '2026-05-24 13:34:01', '2026-05-24 13:34:01'),
(5, 'E1005', 'Sabbagh', 'Omar', 'omar@email.com', '2000-01-01', NULL, '0600000000', NULL, 1, 7, 0, NULL, '2026-05-24 13:34:02', '2026-05-24 13:34:02'),
(6, 'E2001', 'El Amrani', 'Imane', 'imane@email.com', '2000-01-01', NULL, '0600000000', NULL, 2, 8, 0, NULL, '2026-05-24 13:34:02', '2026-05-24 13:34:02'),
(7, 'E2002', 'Bennani', 'Sara', 'sara@email.com', '2000-01-01', NULL, '0600000000', NULL, 2, 9, 0, NULL, '2026-05-24 13:34:02', '2026-05-24 13:34:02'),
(8, 'E2003', 'Idrissi', 'Hassan', 'hassan@email.com', '2000-01-01', NULL, '0600000000', NULL, 2, 10, 0, NULL, '2026-05-24 13:34:03', '2026-05-24 13:34:03'),
(9, 'E2004', 'Ouazzani', 'Nadia', 'nadia@email.com', '2000-01-01', NULL, '0600000000', NULL, 2, 11, 0, NULL, '2026-05-24 13:34:03', '2026-05-24 13:34:03'),
(10, 'E2005', 'Tazi', 'Khalid', 'khalid@email.com', '2000-01-01', NULL, '0600000000', NULL, 2, 12, 0, NULL, '2026-05-24 13:34:03', '2026-05-24 13:34:03'),
(11, 'E3001', 'Berrada', 'Hicham', 'hicham@email.com', '2000-01-01', NULL, '0600000000', NULL, 3, 13, 0, NULL, '2026-05-24 13:34:04', '2026-05-24 13:34:04'),
(12, 'E3002', 'Chraibi', 'Samira', 'samira@email.com', '2000-01-01', NULL, '0600000000', NULL, 3, 14, 0, NULL, '2026-05-24 13:34:04', '2026-05-24 13:34:04'),
(13, 'E3003', 'Daoudi', 'Karim', 'karim@email.com', '2000-01-01', NULL, '0600000000', NULL, 3, 15, 0, NULL, '2026-05-24 13:34:04', '2026-05-24 13:34:04'),
(14, 'E3004', 'El Fassi', 'Leila', 'leila@email.com', '2000-01-01', NULL, '0600000000', NULL, 3, 16, 0, NULL, '2026-05-24 13:34:05', '2026-05-24 13:34:05'),
(15, 'E3005', 'Gharbi', 'Mounir', 'mounir@email.com', '2000-01-01', NULL, '0600000000', NULL, 3, 17, 0, NULL, '2026-05-24 13:34:05', '2026-05-24 13:34:05'),
(16, 'E4001', 'Hamzaoui', 'Rachid', 'rachid@email.com', '2000-01-01', NULL, '0600000000', NULL, 4, 18, 0, NULL, '2026-05-24 13:34:05', '2026-05-24 13:34:05'),
(17, 'E4002', 'Jaidi', 'Nawal', 'nawal@email.com', '2000-01-01', NULL, '0600000000', NULL, 4, 19, 0, NULL, '2026-05-24 13:34:05', '2026-05-24 13:34:05'),
(18, 'E4003', 'Kabbaj', 'Soufiane', 'soufiane@email.com', '2000-01-01', NULL, '0600000000', NULL, 4, 20, 0, NULL, '2026-05-24 13:34:06', '2026-05-24 13:34:06'),
(19, 'E4004', 'Loukili', 'Houda', 'houda@email.com', '2000-01-01', NULL, '0600000000', NULL, 4, 21, 0, NULL, '2026-05-24 13:34:06', '2026-05-24 13:34:06'),
(20, 'E4005', 'Marhraoui', 'Adil', 'adil@email.com', '2000-01-01', NULL, '0600000000', NULL, 4, 22, 0, NULL, '2026-05-24 13:34:06', '2026-05-24 13:34:06');

-- --------------------------------------------------------

--
-- Structure de la table `events`
--

DROP TABLE IF EXISTS `events`;
CREATE TABLE IF NOT EXISTS `events` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `titre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `date_evenement` datetime NOT NULL,
  `lieu` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categorie` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_participants` int DEFAULT NULL,
  `club_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `est_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `events_club_id_foreign` (`club_id`),
  KEY `events_user_id_foreign` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `event_registrations`
--

DROP TABLE IF EXISTS `event_registrations`;
CREATE TABLE IF NOT EXISTS `event_registrations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_id` bigint UNSIGNED NOT NULL,
  `etudiant_id` bigint UNSIGNED NOT NULL,
  `statut` enum('en_attente','confirme','annule') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_attente',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_registrations_event_id_etudiant_id_unique` (`event_id`,`etudiant_id`),
  KEY `event_registrations_etudiant_id_foreign` (`etudiant_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `filieres`
--

DROP TABLE IF EXISTS `filieres`;
CREATE TABLE IF NOT EXISTS `filieres` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `filieres_code_unique` (`code`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `filieres`
--

INSERT INTO `filieres` (`id`, `nom`, `code`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Développement Web et Systèmes', 'DWFS', 'Filière Développement Web et Systèmes', '2026-05-24 13:33:59', '2026-05-24 13:33:59'),
(2, 'PME et Gestion', 'PME', 'Filière PME et Gestion', '2026-05-24 13:33:59', '2026-05-24 13:33:59');

-- --------------------------------------------------------

--
-- Structure de la table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `matieres`
--

DROP TABLE IF EXISTS `matieres`;
CREATE TABLE IF NOT EXISTS `matieres` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `coefficient` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `filiere_id` bigint UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matieres_code_unique` (`code`),
  KEY `matieres_filiere_id_foreign` (`filiere_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `matieres`
--

INSERT INTO `matieres` (`id`, `nom`, `code`, `coefficient`, `created_at`, `updated_at`, `filiere_id`) VALUES
(1, 'Développement Web', 'DEVWEB', 1, '2026-05-24 13:33:59', '2026-05-24 13:33:59', NULL),
(2, 'Base de données', 'BDD', 1, '2026-05-24 13:34:00', '2026-05-24 13:34:00', NULL),
(3, 'Anglais', 'ANG', 1, '2026-05-24 13:34:00', '2026-05-24 13:34:00', NULL),
(4, 'Français', 'FR', 1, '2026-05-24 13:34:00', '2026-05-24 13:34:00', NULL),
(5, 'Mathématiques', 'MATH', 1, '2026-05-24 13:34:00', '2026-05-24 13:34:00', NULL),
(6, 'Comptabilité', 'COMPTA', 1, '2026-05-24 13:34:00', '2026-05-24 13:34:00', NULL),
(7, 'Gestion', 'GEST', 1, '2026-05-24 13:34:00', '2026-05-24 13:34:00', NULL),
(8, 'Marketing', 'MKT', 1, '2026-05-24 13:34:00', '2026-05-24 13:34:00', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000001_create_cache_table', 1),
(2, '0001_01_01_000002_create_jobs_table', 1),
(3, '2024_01_01_000000_create_users_table', 1),
(4, '2024_01_01_000001_create_filieres_table', 1),
(5, '2024_01_01_000002_create_niveaux_table', 1),
(6, '2024_01_01_000003_create_classes_table', 1),
(7, '2024_01_01_000004_create_matieres_table', 1),
(8, '2024_01_01_000005_create_etudiants_table', 1),
(9, '2024_01_01_000006_create_professeurs_table', 1),
(10, '2024_01_01_000007_create_professor_matiere_table', 1),
(11, '2024_01_01_000008_create_professor_classe_table', 1),
(12, '2024_01_01_000009_create_seances_table', 1),
(13, '2024_01_01_000010_create_absences_table', 1),
(14, '2024_01_01_000011_create_classe_matiere_table', 1),
(15, '2024_01_01_000012_create_personal_access_tokens_table', 1),
(16, '2024_01_01_000013_create_permission_tables', 1),
(17, '2024_01_01_000014_create_cours_annonces_tables', 1),
(18, '2024_01_01_000015_create_events_tables', 1),
(19, '2024_01_01_000016_add_module_classe_emploi_temps', 1),
(20, '2024_01_01_000017_add_filiere_to_matieres', 1),
(21, '2024_01_01_000018_create_classe_professeur_matiere_table', 1),
(22, '2026_05_23_110521_make_classe_id_nullable_in_etudiants_table', 1);

-- --------------------------------------------------------

--
-- Structure de la table `model_has_permissions`
--

DROP TABLE IF EXISTS `model_has_permissions`;
CREATE TABLE IF NOT EXISTS `model_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  KEY `model_id_model_type_index` (`model_id`,`model_type`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `model_has_roles`
--

DROP TABLE IF EXISTS `model_has_roles`;
CREATE TABLE IF NOT EXISTS `model_has_roles` (
  `role_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  KEY `model_id_model_type_index` (`model_id`,`model_type`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `module_classe`
--

DROP TABLE IF EXISTS `module_classe`;
CREATE TABLE IF NOT EXISTS `module_classe` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `classe_id` bigint UNSIGNED NOT NULL,
  `matiere_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `module_classe_classe_id_matiere_id_unique` (`classe_id`,`matiere_id`),
  KEY `module_classe_matiere_id_foreign` (`matiere_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `niveaux`
--

DROP TABLE IF EXISTS `niveaux`;
CREATE TABLE IF NOT EXISTS `niveaux` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ordre` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `niveaux_code_unique` (`code`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `niveaux`
--

INSERT INTO `niveaux` (`id`, `nom`, `code`, `ordre`, `created_at`, `updated_at`) VALUES
(1, '1ère année', '1A', 1, '2026-05-24 13:33:59', '2026-05-24 13:33:59'),
(2, '2ème année', '2A', 2, '2026-05-24 13:33:59', '2026-05-24 13:33:59');

-- --------------------------------------------------------

--
-- Structure de la table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'web',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `tokenable_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_id`, `tokenable_type`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(4, 1, 'App\\Models\\User', 'auth-token', '59f59a06704870d0b822724c0eaf16dab4cd77b2ab49dd505afb33088b55efa3', '[\"*\"]', '2026-05-24 13:37:11', NULL, '2026-05-24 13:37:09', '2026-05-24 13:37:11');

-- --------------------------------------------------------

--
-- Structure de la table `professeurs`
--

DROP TABLE IF EXISTS `professeurs`;
CREATE TABLE IF NOT EXISTS `professeurs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `cin` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `professeurs_cin_unique` (`cin`),
  KEY `professeurs_user_id_foreign` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `professeurs`
--

INSERT INTO `professeurs` (`id`, `cin`, `nom`, `prenom`, `email`, `telephone`, `photo`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 'P001', 'Alami', 'Mohammed', 'prof@gestion-absences.com', '0600000000', NULL, 2, '2026-05-24 13:34:00', '2026-05-24 13:34:00');

-- --------------------------------------------------------

--
-- Structure de la table `professor_classe`
--

DROP TABLE IF EXISTS `professor_classe`;
CREATE TABLE IF NOT EXISTS `professor_classe` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `professor_id` bigint UNSIGNED NOT NULL,
  `classe_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `professor_classe_professor_id_classe_id_unique` (`professor_id`,`classe_id`),
  KEY `professor_classe_classe_id_foreign` (`classe_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `professor_matiere`
--

DROP TABLE IF EXISTS `professor_matiere`;
CREATE TABLE IF NOT EXISTS `professor_matiere` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `professor_id` bigint UNSIGNED NOT NULL,
  `matiere_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `professor_matiere_professor_id_matiere_id_unique` (`professor_id`,`matiere_id`),
  KEY `professor_matiere_matiere_id_foreign` (`matiere_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'web',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `role_has_permissions`
--

DROP TABLE IF EXISTS `role_has_permissions`;
CREATE TABLE IF NOT EXISTS `role_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `role_has_permissions_role_id_foreign` (`role_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `seances`
--

DROP TABLE IF EXISTS `seances`;
CREATE TABLE IF NOT EXISTS `seances` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `classe_id` bigint UNSIGNED NOT NULL,
  `matiere_id` bigint UNSIGNED NOT NULL,
  `professor_id` bigint UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `seances_classe_id_foreign` (`classe_id`),
  KEY `seances_matiere_id_foreign` (`matiere_id`),
  KEY `seances_professor_id_foreign` (`professor_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('directeur','professor','etudiant') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'etudiant',
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `avatar`, `is_active`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Directeur Administrateur', 'directeur@gestion-absences.com', NULL, '$2y$12$T7bz8SXU6CFyoMEcn42cDuyb/4bR/PW71B7PPtuKu5PZ1C1rJnHZa', 'directeur', NULL, 1, NULL, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(2, 'Mohammed Alami', 'prof@gestion-absences.com', NULL, '$2y$12$WquII3CHS86eA.CWVt3cm..y8o.ADpu/KagOklTX96qdyU70EepbG', 'professor', NULL, 1, NULL, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(3, 'Ahmed Alaoui', 'ahmed@email.com', NULL, '$2y$12$BAhK6PlUonaROVitVUqu1uPdm6Wv0vpi/D7xqquGNMCkmUePGSJIy', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:00', '2026-05-24 13:34:00'),
(4, 'Fatima Benali', 'fatima@email.com', NULL, '$2y$12$y2cN2DQeJzESO4JCb5Wq3eH2KbGXFwPl.HdBfMSz8eCJWzumaarbe', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:01', '2026-05-24 13:34:01'),
(5, 'Youssef Khaldi', 'youssef@email.com', NULL, '$2y$12$vYcf1XTONdvb3hoKJr4Y4e/zUnS6osY4v3IXduIt790z15mN32Y..', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:01', '2026-05-24 13:34:01'),
(6, 'Aicha Moumen', 'aicha@email.com', NULL, '$2y$12$wxJmfOenJWoeTBR1wlvrIebHyT3hM9nfnQL3p/tN/0CBUEbV.NH/C', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:01', '2026-05-24 13:34:01'),
(7, 'Omar Sabbagh', 'omar@email.com', NULL, '$2y$12$gNu/mJG26HkUm2p5PP2HKe82c7dct47A5W.r5ouvnaF1tBpMSjVR2', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:02', '2026-05-24 13:34:02'),
(8, 'Imane El Amrani', 'imane@email.com', NULL, '$2y$12$SmhZLBm5esn7zarev1ypbOemSZbpP9/FwQyVffUxcm4ksjO6XeqrS', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:02', '2026-05-24 13:34:02'),
(9, 'Sara Bennani', 'sara@email.com', NULL, '$2y$12$mER0hR0a9z0JAkuspRw6UeJvP/5cL4K8YDaeDJrbaY4C0lbYSYzGC', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:02', '2026-05-24 13:34:02'),
(10, 'Hassan Idrissi', 'hassan@email.com', NULL, '$2y$12$qKjB609Qr9drfdRaxRr7je3WP5Kedvsf0AxBGhEhoVLlk51TkdeTu', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:03', '2026-05-24 13:34:03'),
(11, 'Nadia Ouazzani', 'nadia@email.com', NULL, '$2y$12$CltGcXZ1DcDWQL51nZihN.s/Rf9jqFKP0tsybTlhUdLITb1GIWdSm', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:03', '2026-05-24 13:34:03'),
(12, 'Khalid Tazi', 'khalid@email.com', NULL, '$2y$12$egbaTT6JvTxeHOMrUrfdHugy.aZKGiRjSOGz.aKgdxd2v9ZumV2Dm', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:03', '2026-05-24 13:34:03'),
(13, 'Hicham Berrada', 'hicham@email.com', NULL, '$2y$12$j1Tcy318JXaL.JiX8IATJ.6qH1VOCCtnUQLktTsoos8s/9ENoFIPC', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:04', '2026-05-24 13:34:04'),
(14, 'Samira Chraibi', 'samira@email.com', NULL, '$2y$12$V2MYsSxayw1W4k/qvxgoieK9dTy3c3rT5fKupTA/X7yjMu3kIKBPW', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:04', '2026-05-24 13:34:04'),
(15, 'Karim Daoudi', 'karim@email.com', NULL, '$2y$12$SgeYY.EjfrbvRNIqwo3LE.WKhTjJgm2Qnp2XOlNp9AsVx3/dViXye', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:04', '2026-05-24 13:34:04'),
(16, 'Leila El Fassi', 'leila@email.com', NULL, '$2y$12$qzD00lJ8I/2hny4YEAQwv.mdZySeBQzBDuiWCjIRc6Mg4rQanEEYu', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:05', '2026-05-24 13:34:05'),
(17, 'Mounir Gharbi', 'mounir@email.com', NULL, '$2y$12$wLW1d9vwv9oiEbRg/vvJkeMxht/vLKJMVFWyqV6Ugb6IAXjBfyyb.', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:05', '2026-05-24 13:34:05'),
(18, 'Rachid Hamzaoui', 'rachid@email.com', NULL, '$2y$12$rXnCJuFU53I4wXs7DqwDaeKYAQRnPOJG1bG/lHmgp7gfseMKWyU0a', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:05', '2026-05-24 13:34:05'),
(19, 'Nawal Jaidi', 'nawal@email.com', NULL, '$2y$12$rdxMFdiYxaLLkP7K.Ceyo.9QgLb4xyf11PQw8r3SqIEBXAhzIvC/m', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:05', '2026-05-24 13:34:05'),
(20, 'Soufiane Kabbaj', 'soufiane@email.com', NULL, '$2y$12$Qj/RUhfCtBEF.GussbvcC.DLtMV3dJESpONnP.OGckK1x/3JUslaC', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:06', '2026-05-24 13:34:06'),
(21, 'Houda Loukili', 'houda@email.com', NULL, '$2y$12$fKmEabPGLclvf3YnOjSCaOOnNDSrF5vG5BsMQ/FsfABhsW9r0zWJ.', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:06', '2026-05-24 13:34:06'),
(22, 'Adil Marhraoui', 'adil@email.com', NULL, '$2y$12$rzPRGaH0P4g9xsPySwYWC.PBjk4B2qmCM3mLSu7bPWizjVWt6HOcW', 'etudiant', NULL, 1, NULL, '2026-05-24 13:34:06', '2026-05-24 13:34:06');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
