-- DealSense AI – database schema (MySQL 8+)
CREATE DATABASE IF NOT EXISTS dealsense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dealsense;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  url VARCHAR(1000),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_product_name (name)
);

CREATE TABLE stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  store_id INT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  recorded_at DATE NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE KEY uq_product_store_date (product_id, store_id, recorded_at)
);

CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  alert_enabled TINYINT(1) NOT NULL DEFAULT 0,
  alert_target_price DECIMAL(12, 2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_product (user_id, product_id)
);

CREATE TABLE predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  predicted_price DECIMAL(12, 2),
  recommendation ENUM('Buy Now', 'Wait') NOT NULL,
  trend VARCHAR(32) NOT NULL,
  slope_per_day DECIMAL(14, 6),
  forecast_days INT DEFAULT 7,
  method VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  message VARCHAR(255) NOT NULL,
  triggered_price DECIMAL(12, 2) NOT NULL,
  alert_target_price DECIMAL(12, 2) NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
