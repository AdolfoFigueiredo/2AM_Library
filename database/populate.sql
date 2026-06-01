USE Library;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE CartItems;
TRUNCATE TABLE Cart;
TRUNCATE TABLE Payments;
TRUNCATE TABLE SaleItems;
TRUNCATE TABLE Sales;
TRUNCATE TABLE PaymentMethods;
TRUNCATE TABLE PurchaseItems;
TRUNCATE TABLE SupplierPurchases;
TRUNCATE TABLE Inventory;
TRUNCATE TABLE BookCategories;
TRUNCATE TABLE Books;
TRUNCATE TABLE Authors;
TRUNCATE TABLE Categories;
TRUNCATE TABLE Publishers;
TRUNCATE TABLE SupplierPhones;
TRUNCATE TABLE Suppliers;
TRUNCATE TABLE UserPhones;
TRUNCATE TABLE Users;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO PaymentMethods (id, name) VALUES 
(1, 'Cartão de Crédito'),
(2, 'Cartão de Débito'),
(3, 'Dinheiro'),
(4, 'Pix'),
(5, 'Transferência Bancária');

INSERT INTO Users (id, firstName, lastName, email, passwordHash, taxId, municipality, neighborhood, gender, birthDate, role, createdAt) VALUES 
(1, 'Carlos', 'Silva', 'carlos.gerente@2am.com', '$2b$10$xyz...', '12345678901', 'São Paulo', 'Centro', 'M', '1985-04-12', 'manager', NOW()),
(2, 'Ana', 'Souza', 'ana.balcao@2am.com', '$2b$10$xyz...', '98765432100', 'São Paulo', 'Pinheiros', 'F', '1992-08-24', 'employee', NOW()),
(3, 'Bruno', 'Oliveira', 'bruno.cliente@gmail.com', '$2b$10$xyz...', '11122233344', 'Rio de Janeiro', 'Copacabana', 'M', '1990-11-02', 'customer', NOW()),
(4, 'Amanda', 'Costa', 'amanda.c@hotmail.com', '$2b$10$xyz...', '55566677788', 'Belo Horizonte', 'Savassi', 'F', '1995-01-15', 'customer', NOW()),
(5, 'Diego', 'Santos', 'diego.santos@outlook.com', '$2b$10$xyz...', '44455566622', 'São Paulo', 'Morumbi', 'M', '1988-06-30', 'customer', NOW()),
(6, 'Marcos', 'Velho', 'marcos.antigo@yahoo.com', '$2b$10$xyz...', '99988877766', 'Curitiba', 'Batel', 'M', '1979-03-22', 'customer', NOW()),
(7, 'Julia', 'Lima', 'julia.lima@gmail.com', '$2b$10$xyz...', '77733322211', 'Porto Alegre', 'Moinhos', 'F', '1993-09-09', 'customer', NOW());

INSERT INTO UserPhones (userId, phone) VALUES 
(1, '11911111111'),
(2, '11922222222'),
(3, '21933333333'),
(4, '31944444444'),
(6, '41966666666');

INSERT INTO Suppliers (id, name, taxId) VALUES 
(1, 'Distribuidora Alpha de Livros', '12345678000100'),
(2, 'Logística Literária S.A.', '98765432000199');

INSERT INTO SupplierPhones (supplierId, phone) VALUES 
(1, '1133001122'),
(2, '2122004455');

INSERT INTO Publishers (id, name) VALUES 
(1, 'Editora Companhia das Letras'),
(2, 'Editora Aleph'),
(3, 'Editora Rocco'),
(4, 'Editora HarperCollins');

INSERT INTO Categories (id, name) VALUES 
(1, 'Ficção Científica'),
(2, 'Fantasia'),
(3, 'Desenvolvimento Pessoal'),
(4, 'Romance'),
(5, 'História');

INSERT INTO Authors (id, name) VALUES 
(1, 'George Orwell'),
(2, 'J.R.R. Tolkien'),
(3, 'Isaac Asimov'),
(4, 'Matt Haig'),
(5, 'Yuval Noah Harari');

INSERT INTO Books (id, name, releaseDate, publisherId, description, coverImageUrl, edition, authorId, isbn, currentPrice) VALUES 
(1, '1984', '1949-06-08', 1, 'Clássica distopia sobre o poder do Estado.', 'https://img.com/1984.jpg', 'Edição de Luxo', 1, '9788535914849', 49.90),
(2, 'O Senhor dos Anéis: A Sociedade do Anel', '1954-07-29', 4, 'O início da jornada para destruir o Um Anel.', 'https://img.com/sda1.jpg', '1ª Edição', 2, '9788595086357', 79.90),
(3, 'Fundação', '1951-06-01', 2, 'O colapso e ressurgimento do Império Galáctico.', 'https://img.com/fundacao.jpg', 'Edição Especial', 3, '9788576572008', 59.90),
(4, 'A Biblioteca da Meia-Noite', '2020-08-13', 3, 'Entre a vida e a morte existe uma biblioteca de possibilidades.', 'https://img.com/biblioteca.jpg', 'Brochura', 4, '9786555321319', 44.90),
(5, 'Sapiens: Uma Breve História da Humanidade', '2011-01-01', 1, 'Como uma espécie insignificante dominou o planeta.', 'https://img.com/sapiens.jpg', '15ª Edição', 5, '9788535925111', 69.90);

INSERT INTO BookCategories (categoryId, bookId) VALUES 

INSERT INTO Inventory (bookId, quantity) VALUES 
(1, 50),
(2, 30),
(3, 40),
(4, 25),
(5, 15);

INSERT INTO SupplierPurchases (id, supplierId, purchaseDate, totalCost) VALUES 
(1, 1, '2026-01-10 14:00:00', 2500.00),
(2, 2, '2026-02-15 10:30:00', 1350.00);

INSERT INTO PurchaseItems (purchaseId, bookId, quantity, costPrice) VALUES 
(1, 1, 50, 25.00),
(1, 2, 30, 41.66),
(2, 3, 40, 30.00),
(2, 4, 10, 15.00);

INSERT INTO Sales (id, customerId, userId, saleDate, totalAmount, status, saleType) VALUES 
(1, 3, 2, NOW(), 129.80, 'Completed', 'PhysicalStore');

INSERT INTO SaleItems (saleId, bookId, quantity, historicalUnitPrice) VALUES 

INSERT INTO Payments (saleId, paymentMethodId, paymentStatus, paymentDate) VALUES 

INSERT INTO Sales (id, customerId, userId, saleDate, totalAmount, status, saleType) VALUES 
(2, 4, NULL, NOW(), 44.90, 'Completed', 'Online');

INSERT INTO SaleItems (saleId, bookId, quantity, historicalUnitPrice) VALUES 
(2, 4, 1, 44.90);

INSERT INTO Payments (saleId, paymentMethodId, paymentStatus, paymentDate) VALUES 
(2, 1, 'Paid', NOW());

INSERT INTO Sales (id, customerId, userId, saleDate, totalAmount, status, saleType) VALUES 
(3, 6, NULL, DATE_SUB(NOW(), INTERVAL 7 MONTH), 69.90, 'Completed', 'Online');

INSERT INTO SaleItems (saleId, bookId, quantity, historicalUnitPrice) VALUES 

INSERT INTO Payments (saleId, paymentMethodId, paymentStatus, paymentDate) VALUES 
(3, 1, 'Paid', DATE_SUB(NOW(), INTERVAL 7 MONTH));

INSERT INTO Sales (id, customerId, userId, saleDate, totalAmount, status, saleType) VALUES 
(4, 5, NULL, NOW(), 119.80, 'Pending', 'Online');

INSERT INTO SaleItems (saleId, bookId, quantity, historicalUnitPrice) VALUES 

INSERT INTO Payments (saleId, paymentMethodId, paymentStatus, paymentDate) VALUES 
(4, 1, 'Pending', NULL);

INSERT INTO Cart (id, userId, createdAt) VALUES 
(1, 7, NOW());

INSERT INTO CartItems (cartId, bookId, quantity) VALUES 
