-- Consumer Behaviour & Demand Forecasting System - MySQL Schema
-- Clean version aligned with dataset

DROP DATABASE IF EXISTS retail_inventory;
CREATE DATABASE retail_inventory;
USE retail_inventory;

-- Users (Admin / Seller)
CREATE TABLE Users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'seller') NOT NULL DEFAULT 'seller',
  zip_code VARCHAR(20),
  city VARCHAR(100),
  state VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50),
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Categories
CREATE TABLE Categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- Products
CREATE TABLE Products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id INT,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES Categories(id)
);

-- Customers
CREATE TABLE Customers (
  id VARCHAR(50) PRIMARY KEY,
  unique_id VARCHAR(100) UNIQUE,
  name VARCHAR(255),
  email VARCHAR(255),
  zip_code VARCHAR(20),
  city VARCHAR(100),
  state VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE Orders (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50),
  total_amount DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES Customers(id)
);

-- Inventory
CREATE TABLE Inventory (
  product_id VARCHAR(50),
  seller_id VARCHAR(50),
  stock INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, seller_id),
  FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Order Items
CREATE TABLE order_items (
  id INT NOT NULL,
  order_id VARCHAR(50) NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  seller_id VARCHAR(50) NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(12,2),
  PRIMARY KEY (id, order_id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);