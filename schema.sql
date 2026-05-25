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
    deletedAt TIMESTAMP NULL
);

CREATE TABLE UserPhones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    taxId VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE SupplierPhones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplierId INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    FOREIGN KEY (supplierId) REFERENCES Suppliers(id) ON DELETE CASCADE
);

CREATE TABLE Publishers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE Authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
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
    FOREIGN KEY (publisherId) REFERENCES Publishers(id) ON DELETE SET NULL,
    FOREIGN KEY (authorId) REFERENCES Authors(id) ON DELETE SET NULL
);

CREATE TABLE BookCategories (
    categoryId INT NOT NULL,
    bookId INT NOT NULL,
    PRIMARY KEY (categoryId, bookId),
    FOREIGN KEY (categoryId) REFERENCES Categories(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES Books(id) ON DELETE CASCADE
);


CREATE TABLE Inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookId INT NOT NULL UNIQUE,
    quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (bookId) REFERENCES Books(id) ON DELETE CASCADE
);

CREATE TABLE SupplierPurchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplierId INT NOT NULL,
    purchaseDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    totalCost DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (supplierId) REFERENCES Suppliers(id)
);

CREATE TABLE PurchaseItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchaseId INT NOT NULL,
    bookId INT NOT NULL,
    quantity INT NOT NULL,
    costPrice DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (purchaseId) REFERENCES SupplierPurchases(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES Books(id)
);

CREATE TABLE PaymentMethods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE Sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT NOT NULL,
    userId INT NULL,
    saleDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    totalAmount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending',
    saleType ENUM('PhysicalStore', 'Online') NOT NULL,
    FOREIGN KEY (customerId) REFERENCES Users(id),
    FOREIGN KEY (userId) REFERENCES Users(id)
);

CREATE TABLE SaleItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    saleId INT NOT NULL,
    bookId INT NOT NULL,
    quantity INT NOT NULL,
    historicalUnitPrice DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (saleId) REFERENCES Sales(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES Books(id)
);

CREATE TABLE Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    saleId INT NOT NULL UNIQUE,
    paymentMethodId INT,
    paymentStatus ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Pending',
    paymentDate DATETIME,
    FOREIGN KEY (saleId) REFERENCES Sales(id) ON DELETE CASCADE,
    FOREIGN KEY (paymentMethodId) REFERENCES PaymentMethods(id)
);

CREATE TABLE Cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE CartItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cartId INT NOT NULL,
    bookId INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (cartId) REFERENCES Cart(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES Books(id) ON DELETE CASCADE
);



-- Views and Advanced Querys

-- show procedures; 
SHOW PROCEDURE STATUS WHERE Db = DATABASE();

-- return details of book. 

CREATE VIEW v_BookDetails AS
SELECT 
    b.id, b.name AS title, b.isbn, b.currentPrice, b.coverImageUrl, b.releaseDate,
    p.name AS publisher,
    a.name As author, 
    GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS categories,
    i.quantity AS stock
FROM Books b
LEFT JOIN Publishers p ON b.publisherId = p.id
LEFT JOIN Authors a ON b.authorId = a.id
LEFT JOIN BookCategories bc ON b.id = bc.bookId
LEFT JOIN Categories c ON bc.categoryId = c.id
LEFT JOIN Inventory i ON b.id = i.bookId
GROUP BY b.id;


-- Summary all registries in sales

CREATE VIEW v_SalesSummary AS
SELECT 
    s.id AS saleId, 
    CONCAT(u.firstName, ' ', u.lastName) AS customerName,
    s.totalAmount, 
    s.status AS orderStatus, 
    pm.name AS paymentMethod,
    p.paymentStatus,
    s.saleDate
FROM Sales s
JOIN Users u ON s.customerId = u.id
LEFT JOIN Payments p ON s.id = p.saleId
LEFT JOIN PaymentMethods pm ON p.paymentMethodId = pm.id;

-- Return the 10 top selling books

CREATE VIEW v_TopSellingBooks AS
SELECT 
    b.name, 
    SUM(si.quantity) AS totalUnitsSold,
    SUM(si.quantity * si.historicalUnitPrice) AS totalRevenue
FROM SaleItems si
JOIN Books b ON si.bookId = b.id
GROUP BY b.id
ORDER BY totalRevenue DESC
LIMIT 10;

-- Find customers who haven't made a purchase in the last 6 months
CREATE VIEW v_InactiveCustomers AS
SELECT firstName, lastName, email, MAX(saleDate) as lastPurchase
FROM Users u
JOIN Sales s ON u.id = s.customerId
GROUP BY u.id
HAVING lastPurchase < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- Store Procedures

-- sp_ProcessSale
DELIMITER //

CREATE PROCEDURE sp_ProcessSale(
    IN p_userId INT, 
    IN p_saleType ENUM('PhysicalStore', 'Online')
)
BEGIN
    DECLARE v_cartId INT;
    DECLARE v_total DECIMAL(10,2);
    
    -- 1. Get Cart ID and Total
    SELECT id INTO v_cartId FROM Cart WHERE userId = p_userId;
    
    SELECT SUM(ci.quantity * b.currentPrice) INTO v_total
    FROM CartItems ci
    JOIN Books b ON ci.bookId = b.id
    WHERE ci.cartId = v_cartId;

    START TRANSACTION;

    -- 2. Create Sale Record
    INSERT INTO Sales (customerId, totalAmount, status, saleType)
    VALUES (p_userId, v_total, 'Pending', p_saleType);
    
    SET @last_sale_id = LAST_INSERT_ID();

    -- 3. Move items from CartItems to SaleItems
    INSERT INTO SaleItems (saleId, bookId, quantity, historicalUnitPrice)
    SELECT @last_sale_id, ci.bookId, ci.quantity, b.currentPrice
    FROM CartItems ci
    JOIN Books b ON ci.bookId = b.id
    WHERE ci.cartId = v_cartId;

    -- 4. Update Inventory
    UPDATE Inventory i
    JOIN CartItems ci ON i.bookId = ci.bookId
    SET i.quantity = i.quantity - ci.quantity
    WHERE ci.cartId = v_cartId;

    -- 5. Clear Cart
    DELETE FROM CartItems WHERE cartId = v_cartId;

    COMMIT;
END //

DELIMITER ;

-- sp_AddStock

DELIMITER //

CREATE PROCEDURE sp_AddStock(
    IN p_supplierId INT,
    IN p_bookId INT,
    IN p_qty INT,
    IN p_cost DECIMAL(10,2)
)
BEGIN
    START TRANSACTION;
    
    -- Record the purchase
    INSERT INTO SupplierPurchases (supplierId, totalCost) VALUES (p_supplierId, (p_qty * p_cost));
    SET @purch_id = LAST_INSERT_ID();
    
    INSERT INTO PurchaseItems (purchaseId, bookId, quantity, costPrice)
    VALUES (@purch_id, p_bookId, p_qty, p_cost);
    
    -- Update or Insert Inventory
    INSERT INTO Inventory (bookId, quantity) 
    VALUES (p_bookId, p_qty)
    ON DUPLICATE KEY UPDATE quantity = quantity + p_qty;
    
    COMMIT;
END //

DELIMITER ;

