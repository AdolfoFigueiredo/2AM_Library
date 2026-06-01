
USE Library;

DROP VIEW IF EXISTS v_SalesSummary;
DROP VIEW IF EXISTS v_InventoryStatus;
DROP VIEW IF EXISTS v_DashboardMetrics;
DROP VIEW IF EXISTS v_DashboardMetrics;
DROP VIEW IF EXISTS v_InactiveCustomers;
DROP VIEW IF EXISTS v_BookDetails;

-- 1. View de Resumo de Vendas (Utilizada pelo SaleRepository e SaleController)
CREATE VIEW v_SalesSummary AS
SELECT 
    s.id AS saleId,
    s.customerId,
    CONCAT(u.firstName, ' ', u.lastName) AS customerName,
    u.email AS customerEmail,
    s.userId AS employeeId,
    s.saleDate,
    s.totalAmount,
    s.status AS orderStatus,
    s.saleType,
    COUNT(si.id) AS totalItems
FROM Sales s
LEFT JOIN Users u ON s.customerId = u.id
LEFT JOIN SaleItems si ON s.id = si.saleId
WHERE s.deletedAt IS NULL
GROUP BY s.id, s.customerId, u.firstName, u.lastName, u.email, s.userId, s.saleDate, s.totalAmount, s.status, s.saleType;

-- 2. View de Estado de Stock (Utilizada pelo módulo de Inventário e Alertas)
CREATE VIEW v_InventoryStatus AS
SELECT 
    i.id AS inventoryId,
    b.id AS bookId,
    b.name AS bookName,
    b.isbn,
    b.currentPrice,
    i.quantity AS currentStock,
    CASE 
        WHEN i.quantity = 0 THEN 'Out of Stock'
        WHEN i.quantity <= 5 THEN 'Low Stock Alert'
        ELSE 'In Stock'
    END AS stockStatus,
    a.name AS authorName,
    p.name AS publisherName
FROM Inventory i
INNER JOIN Books b ON i.bookId = b.id
LEFT JOIN Authors a ON b.authorId = a.id
LEFT JOIN Publishers p ON b.publisherId = p.id
WHERE i.deletedAt IS NULL AND b.deletedAt IS NULL;


CREATE VIEW v_InactiveCustomers AS
SELECT 
    u.id AS customerId,
    CONCAT(u.firstName, ' ', u.lastName) AS customerName,
    u.email AS customerEmail,
    (
        SELECT up.phone 
        FROM UserPhones up 
        WHERE up.userId = u.id AND up.deletedAt IS NULL 
        LIMIT 1
    ) AS customerPhone,
    MAX(s.saleDate) AS lastPurchaseDate,
    CASE 
        WHEN MAX(s.saleDate) IS NULL THEN 'Nunca Comprou'
        ELSE CONCAT('Inativo há ', DATEDIFF(NOW(), MAX(s.saleDate)), ' dias')
    END AS inactivityStatus
FROM Users u
LEFT JOIN Sales s ON u.id = s.customerId AND s.status = 'Completed' AND s.deletedAt IS NULL
WHERE u.role = 'customer' 
  AND u.deletedAt IS NULL
GROUP BY u.id, u.firstName, u.lastName, u.email
HAVING lastPurchaseDate IS NULL 
   OR lastPurchaseDate < DATE_SUB(NOW(), INTERVAL 180 DAY);

CREATE VIEW v_BookDetails AS
SELECT 
    b.id AS bookId,
    b.name AS bookName,
    b.isbn,
    b.edition,
    b.releaseDate,
    b.currentPrice,
    b.description,
    b.coverImageUrl,
    b.authorId,
    IFNULL(a.name, 'Autor Desconhecido') AS authorName,
    b.publisherId,
    IFNULL(p.name, 'Editora Desconhecida') AS publisherName,
    IFNULL(i.quantity, 0) AS stockQuantity,
    CASE 
        WHEN i.quantity IS NULL OR i.quantity = 0 THEN 'Out of Stock'
        WHEN i.quantity <= 5 THEN 'Low Stock'
        ELSE 'Available'
    END AS availabilityStatus,
    -- Concatena todas as categorias do livro numa string única separada por vírgulas
    IFNULL(
        (
            SELECT GROUP_CONCAT(c.name SEPARATOR ', ')
            FROM BookCategories bc
            INNER JOIN Categories c ON bc.categoryId = c.id
            WHERE bc.bookId = b.id AND bc.deletedAt IS NULL
        ), 
        'Sem Categoria'
    ) AS categoriesList
FROM Books b
LEFT JOIN Authors a ON b.authorId = a.id
LEFT JOIN Publishers p ON b.publisherId = p.id
LEFT JOIN Inventory i ON b.id = i.bookId AND i.deletedAt IS NULL
WHERE b.deletedAt IS NULL;