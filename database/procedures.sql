
USE Library;

DROP PROCEDURE IF EXISTS sp_ProcessSale;
DROP PROCEDURE IF EXISTS sp_ReplenishInventory;

DELIMITER $$

-- 1. Stored Procedure ACID para Checkout Atomizado (Carrinho -> Venda)
CREATE PROCEDURE sp_ProcessSale(
    IN p_userId INT,
    IN p_saleType VARCHAR(50)
)
BEGIN
    DECLARE v_cartId INT;
    DECLARE v_saleId INT;
    DECLARE v_totalCost DECIMAL(10,2) DEFAULT 0.00;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Erro interno ao processar checkout. Operacao abortada.';
    END;

    START TRANSACTION;

    SELECT id INTO v_cartId FROM Cart WHERE userId = p_userId AND deletedAt IS NULL LIMIT 1;
    
    IF v_cartId IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Carrinho nao encontrado para este utilizador.';
    END IF;

    SELECT SUM(ci.quantity * b.currentPrice) INTO v_totalCost
    FROM CartItems ci
    INNER JOIN Books b ON ci.bookId = b.id
    WHERE ci.cartId = v_cartId AND ci.deletedAt IS NULL;

    IF v_totalCost IS NULL OR v_totalCost = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'O carrinho esta vazio ou contem produtos sem preco valido.';
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM CartItems ci
        INNER JOIN Inventory i ON ci.bookId = i.bookId
        WHERE ci.cartId = v_cartId AND ci.deletedAt IS NULL AND i.quantity < ci.quantity
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente para um ou mais livros no carrinho.';
    END IF;

    INSERT INTO Sales (customerId, userId, saleDate, totalAmount, status, saleType, createdAt, updatedAt)
    VALUES (p_userId, NULL, NOW(), v_totalCost, 'Pending', p_saleType, NOW(), NOW());
    
    SET v_saleId = LAST_INSERT_ID();

    INSERT INTO SaleItems (saleId, bookId, quantity, unitPrice, subtotal, createdAt, updatedAt)
    SELECT 
        v_saleId, 
        ci.bookId, 
        ci.quantity, 
        b.currentPrice, 
        (ci.quantity * b.currentPrice),
        NOW(),
        NOW()
    FROM CartItems ci
    INNER JOIN Books b ON ci.bookId = b.id
    WHERE ci.cartId = v_cartId AND ci.deletedAt IS NULL;

    UPDATE Inventory i
    INNER JOIN CartItems ci ON i.bookId = ci.bookId
    SET i.quantity = i.quantity - ci.quantity, i.updatedAt = NOW()
    WHERE ci.cartId = v_cartId AND ci.deletedAt IS NULL;

    DELETE FROM CartItems WHERE cartId = v_cartId;

    COMMIT;
END$$


DELIMITER $$
CREATE PROCEDURE sp_ReplenishInventory(
    IN p_supplierId INT,
    IN p_bookId INT,
    IN p_quantity INT,
    IN p_costPrice DECIMAL(10,2)
)
BEGIN
    DECLARE v_purchaseId INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Erro ao processar a entrada de estoque do fornecedor.';
    END;

    START TRANSACTION;
    INSERT INTO SupplierPurchases (supplierId, purchaseDate, totalCost)
    VALUES (p_supplierId, NOW(), (p_quantity * p_costPrice));
    SET v_purchaseId = LAST_INSERT_ID();

    INSERT INTO PurchaseItems (purchaseId, bookId, quantity, costPrice)
    VALUES (v_purchaseId, p_bookId, p_quantity, p_costPrice);

    INSERT INTO Inventory (bookId, quantity, createdAt, updatedAt, deletedAt)
    VALUES (p_bookId, p_quantity, NOW(), NOW(), NULL)
    ON DUPLICATE KEY UPDATE 
        quantity = quantity + p_quantity,
        updatedAt = NOW()
        deletedAt = NULL; 
    COMMIT;
END$$
DELIMITER ;