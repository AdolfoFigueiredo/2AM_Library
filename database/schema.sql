
CREATE DATABASE IF NOT EXISTS Library;
USE Library;

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NULL,
    taxId VARCHAR(20) UNIQUE,
    municipality VARCHAR(100),
    neighborhood VARCHAR(100),
    gender ENUM('M', 'F'),
    birthDate DATE,
    role ENUM('customer', 'employee', 'manager') DEFAULT 'customer',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_deleted (deletedAt)
);

CREATE TABLE UserPhones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    INDEX idx_userphones_user (userId),
    INDEX idx_userphones_deleted (deletedAt),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    taxId VARCHAR(20) UNIQUE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    INDEX idx_suppliers_name (name),
    INDEX idx_suppliers_deleted (deletedAt)
);

CREATE TABLE SupplierPhones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplierId INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    INDEX idx_supplierphones_supplier (supplierId),
    INDEX idx_supplierphones_deleted (deletedAt),
    FOREIGN KEY (supplierId) REFERENCES Suppliers(id) ON DELETE CASCADE
);

CREATE TABLE Publishers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    INDEX idx_publishers_name (name),
    INDEX idx_publishers_deleted (deletedAt)
);

CREATE TABLE Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    INDEX idx_categories_name (name),
    INDEX idx_categories_deleted (deletedAt)
);

CREATE TABLE Authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    INDEX idx_authors_name (name),
    INDEX idx_authors_deleted (deletedAt)
);

CREATE TABLE PaymentMethods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    INDEX idx_paymentmethods_name (name)
);

CREATE TABLE Books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    releaseDate DATE,
    publisherId INT,
    description TEXT,
    coverImageUrl VARCHAR(255),
    edition VARCHAR(50),
    authorId INT,
    isbn VARCHAR(20) UNIQUE,
    currentPrice DECIMAL(10,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    
    INDEX idx_books_name (name),
    INDEX idx_books_author (authorId),
    INDEX idx_books_publisher (publisherId),
    INDEX idx_books_deleted (deletedAt),
    
    FOREIGN KEY (publisherId) REFERENCES Publishers(id) ON DELETE SET NULL,
    FOREIGN KEY (authorId) REFERENCES Authors(id) ON DELETE SET NULL
);

CREATE TABLE BookCategories (
    categoryId INT NOT NULL,
    bookId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    PRIMARY KEY (categoryId, bookId),
    INDEX idx_bookcategories_deleted (deletedAt),
    FOREIGN KEY (categoryId) REFERENCES Categories(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES Books(id) ON DELETE CASCADE
);

CREATE TABLE Inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookId INT NOT NULL UNIQUE,
    quantity INT NOT NULL DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    INDEX idx_inventory_book (bookId),
    INDEX idx_inventory_deleted (deletedAt),
    FOREIGN KEY (bookId) REFERENCES Books(id) ON DELETE CASCADE
);

CREATE TABLE Cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    INDEX idx_cart_user (userId),
    INDEX idx_cart_deleted (deletedAt),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE CartItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cartId INT NOT NULL,
    bookId INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    
    UNIQUE KEY uq_cart_book (cartId, bookId),
    
    INDEX idx_cartitems_cart (cartId),
    INDEX idx_cartitems_book (bookId),
    INDEX idx_cartitems_deleted (deletedAt),
    FOREIGN KEY (cartId) REFERENCES Cart(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES Books(id) ON DELETE CASCADE
);

-- ====================== VENDAS (HISTÓRICO) ======================

CREATE TABLE Sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT NOT NULL,
    userId INT NULL,
    saleDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    totalAmount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending',
    saleType ENUM('PhysicalStore', 'Online') NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    
    INDEX idx_sales_customer (customerId),
    INDEX idx_sales_date (saleDate),
    INDEX idx_sales_status (status),
    INDEX idx_sales_deleted (deletedAt),
    
    FOREIGN KEY (customerId) REFERENCES Users(id),
    FOREIGN KEY (userId) REFERENCES Users(id)
);

CREATE TABLE SaleItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    saleId INT NOT NULL,
    bookId INT NOT NULL,
    quantity INT NOT NULL,
    unitPrice DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    
    INDEX idx_saleitems_sale (saleId),
    INDEX idx_saleitems_book (bookId),
    INDEX idx_saleitems_deleted (deletedAt),
    
    FOREIGN KEY (saleId) REFERENCES Sales(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES Books(id)
);

-- ====================== PAGAMENTOS ======================

CREATE TABLE Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    saleId INT NOT NULL UNIQUE,
    paymentMethodId INT,
    paymentStatus ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Pending',
    paymentDate DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    
    INDEX idx_payments_sale (saleId),
    INDEX idx_payments_status (paymentStatus),
    INDEX idx_payments_deleted (deletedAt),
    
    FOREIGN KEY (saleId) REFERENCES Sales(id) ON DELETE CASCADE,
    FOREIGN KEY (paymentMethodId) REFERENCES PaymentMethods(id)
);

CREATE TABLE SupplierPurchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplierId INT NOT NULL,
    purchaseDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    totalCost DECIMAL(10,2) NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    
    INDEX idx_supplierpurchases_supplier (supplierId),
    INDEX idx_supplierpurchases_date (purchaseDate),
    INDEX idx_supplierpurchases_deleted (deletedAt),
    
    FOREIGN KEY (supplierId) REFERENCES Suppliers(id)
);

CREATE TABLE PurchaseItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchaseId INT NOT NULL,
    bookId INT NOT NULL,
    quantity INT NOT NULL,
    costPrice DECIMAL(10,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    
    INDEX idx_purchaseitems_purchase (purchaseId),
    INDEX idx_purchaseitems_book (bookId),
    INDEX idx_purchaseitems_deleted (deletedAt),
    
    CONSTRAINT fk_purchaseitems_purchase FOREIGN KEY (purchaseId) 
        REFERENCES SupplierPurchases(id) ON DELETE CASCADE,
        
    CONSTRAINT fk_purchaseitems_book FOREIGN KEY (bookId) 
        REFERENCES Books(id) ON DELETE RESTRICT
);