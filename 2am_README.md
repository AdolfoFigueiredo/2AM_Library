# 2AM — Sistema Integrado de Gestão de Livraria

<p align="center">
  <img src="./docs/assets/banner.png" alt="2AM Banner" width="100%">
</p>

<p align="center">
  Sistema omnichannel de gestão de livraria desenvolvido como projeto acadêmico da disciplina de Técnicas de Linguagem de Programação (TLP).
</p>

---

# Sobre o Projeto

O **2AM** é um sistema integrado de gestão de livraria baseado em arquitetura omnichannel, desenvolvido para centralizar e unificar operações de:

- Ecommerce
- POS (Point of Sale)
- ERP (Backoffice)

Todos os módulos compartilham:

- a mesma API REST;
- o mesmo banco de dados relacional;
- a mesma lógica de negócio.

O sistema foi projetado utilizando conceitos modernos de:

- arquitetura de software;
- modelagem relacional;
- separação de responsabilidades;
- APIs REST;
- engenharia de software;
- sistemas corporativos.

---

# Arquitetura Geral

```text
                 ┌────────────────────┐
                 │     Frontends      │
                 └────────────────────┘

      ┌──────────────┬──────────────┬──────────────┐
      │ Ecommerce    │ ERP          │ POS          │
      │ Web Store    │ Backoffice   │ Caixa        │
      └──────┬───────┴──────┬───────┴──────┬───────┘
             │              │              │
             └──────────────┼──────────────┘
                            │
                     REST API (Express)
                            │
                    Business Rules Layer
                            │
                         MySQL
```

---

# Tecnologias Utilizadas

## Backend

- Node.js
- TypeScript
- ExpressJS
- Zod
- JWT
- bcrypt
- dotenv
- cors
- helmet
- morgan
- MySQL / MariaDB

---

## Frontend

### Ecommerce

- HTML5
- CSS3
- JavaScript Vanilla

### ERP

- HTML5
- CSS3
- JavaScript Vanilla

### POS

- ElectronJS
- HTML/CSS/JavaScript Vanilla

---

# Módulos do Sistema

---

# Ecommerce

Plataforma online utilizada pelos clientes para compra de livros.

## Funcionalidades

- catálogo de produtos;
- busca e filtros;
- categorias;
- carrinho;
- checkout;
- autenticação;
- histórico de pedidos;
- favoritos;
- avaliações;
- pagamentos;
- rastreamento de pedidos.

---

# POS (Point of Sale)

Sistema de caixa utilizado na loja física.

## Funcionalidades

- abertura de caixa;
- fechamento de caixa;
- vendas rápidas;
- emissão de recibos;
- leitura de produtos;
- múltiplos pagamentos;
- consulta rápida de estoque.

---

# ERP (Backoffice)

Sistema administrativo e gerencial.

## Funcionalidades

- dashboard;
- relatórios;
- gestão de estoque;
- gestão de produtos;
- gestão de vendas;
- gestão financeira;
- gestão de usuários;
- gestão de fornecedores;
- analytics;
- auditoria básica.

---

# Banco de Dados

O sistema utiliza banco de dados relacional MySQL/MariaDB.

---

# Principais Entidades

- Users
- Roles
- Permissions
- Products
- Categories
- Inventory
- StockMovements
- Sales
- SaleItems
- Payments
- Suppliers
- Purchases
- Cart
- CartItems

---

# Recursos Avançados do Banco

O projeto implementa recursos avançados de SQL:

## Views

- vw_products_catalog
- vw_sales_report
- vw_inventory_status
- vw_dashboard_metrics

## Stored Procedures

- sp_create_sale
- sp_update_inventory
- sp_monthly_sales_report
- sp_register_purchase

## Triggers

- redução automática de estoque;
- prevenção de estoque negativo;
- logs de movimentação;
- atualização automática de timestamps.

## Consultas Avançadas

- livros mais vendidos;
- clientes que mais compraram;
- receita mensal;
- produtos sem estoque;
- analytics de vendas;
- faturamento diário;
- vendas por período.

---

# Segurança

O sistema utiliza:

- autenticação JWT;
- criptografia de senhas com bcrypt;
- validação de dados com Zod;
- controle de permissões;
- middlewares de segurança.

---

# Estrutura do Projeto

```text
2am/
│
├── backend/
│
├── ecommerce/
│
├── erp/
│
├── pos/
│
├── database/
│
├── docs/
│
└── README.md
```

---

# Estrutura do Backend

```text
backend/src/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── products/
│   ├── inventory/
│   ├── sales/
│   ├── payments/
│   ├── suppliers/
│   ├── purchases/
│   ├── reports/
│   └── dashboard/
│
├── middlewares/
├── routes/
├── services/
├── repositories/
├── database/
├── schemas/
├── utils/
├── config/
└── app.ts
```

---

# Design do Sistema

A identidade visual do projeto é inspirada em:

https://caravelaseditora.com/

## Características

- clean;
- moderno;
- editorial;
- elegante;
- minimalista;
- foco em livros;
- experiência agradável de leitura.

---

# Paleta de Cores

| Cor         | Hex     |
| ----------- | ------- |
| Preto       | #111111 |
| Branco      | #FFFFFF |
| Dourado     | #D4AF37 |
| Cinza Claro | #F5F5F5 |

---

# Tipografia

## Títulos

- Playfair Display
- Merriweather

## Texto

- Inter
- Poppins

---

# API REST

A API REST foi construída seguindo:

- arquitetura modular;
- separação de responsabilidades;
- SOLID;
- DTOs;
- Services;
- Repositories;
- middlewares;
- tratamento global de erros.

---

# Documentação da API

A documentação da API é gerada utilizando:

- Swagger/OpenAPI
- Postman Collection

---

# Fluxo do Sistema

```text
Cliente
   ↓
Frontend
   ↓
API REST
   ↓
Services
   ↓
Repositories
   ↓
MySQL
```

---

# Instalação

# 1. Clonar repositório

```bash
git clone https://github.com/AdolfoFigueiredo/2AM_Library.git
```

---

# 2. Entrar no projeto

```bash
cd 2am
```

---

# 3. Configurar variáveis de ambiente

Criar:

```bash
.env
```

Exemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=
DB_PASSWORD=password
DB_NAME=Library

JWT_SECRET=supersecret
```

---

# 4. Instalar dependências

## Backend

```bash
cd backend
npm install
```

## Ecommerce

```bash
cd ecommerce
npm install
```

## ERP

```bash
cd erp
npm install
```

## POS

```bash
cd pos
npm install
```

---

# 5. Configurar banco

Executar:

```bash
database/schema.sql
```

Depois:

```bash
database/seeds.sql
```

---

# 6. Rodar backend

```bash
npm run dev
```

---

# 7. Rodar frontends

## Ecommerce

```bash
npm run dev
```

## ERP

```bash
npm run dev
```

## POS

```bash
npm run electron
```

---

# Testes

O sistema deve possuir:

- testes de rotas;
- testes de autenticação;
- testes de validação;
- testes de services.

---

# Objetivos Acadêmicos

Este projeto tem como objetivo aplicar:

- modelagem de dados;
- bancos de dados relacionais;
- SQL avançado;
- APIs REST;
- arquitetura de software;
- engenharia de software;
- integração de sistemas;
- desenvolvimento fullstack.

---

# Autor

Adolfo Figueiredo - calebfigueiredo28@gmail.com - https://github.com/AdolfoFigueiredo

Projeto acadêmico — 12º Ano — Técnicas de Linguagem de Programação (TLP)

---

# Licença

Este projeto possui finalidade educacional e acadêmica.
