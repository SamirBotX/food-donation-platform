# 🍽️ Food Donation Platform — Database Design

This project is part of a **Bachelor’s Thesis** to develop a **web-based platform for food donation and distribution in Finland**.  
The database is designed to connect donors (restaurants, bakeries, supermarkets) with charities and individuals in need.

---

## 🧩 Database Overview

The system uses **PostgreSQL** as the database.  
It has three main tables:

### 1️⃣ users

Stores all types of users: donors, charities, individuals, and admins.

| Column            | Type         | Description                          |
| ----------------- | ------------ | ------------------------------------ |
| id                | SERIAL       | Primary key                          |
| email             | VARCHAR(255) | User’s email (unique)                |
| password_hash     | TEXT         | Encrypted password                   |
| full_name         | VARCHAR(200) | Person or contact name               |
| organization_name | VARCHAR(255) | If donor is a company/mart           |
| role              | VARCHAR(20)  | donor, charity, individual, or admin |
| phone             | VARCHAR(20)  | Contact number                       |
| created_at        | TIMESTAMP    | Account creation time                |

---

### 2️⃣ donations

Stores food items offered by donors.

| Column      | Type         | Description                         |
| ----------- | ------------ | ----------------------------------- |
| id          | SERIAL       | Primary key                         |
| donor_id    | INT          | References users(id)                |
| title       | VARCHAR(255) | Short title of donation             |
| description | TEXT         | Details about food                  |
| food_type   | VARCHAR(50)  | Category (e.g., baked goods, meals) |
| quantity    | INT          | Amount of food                      |
| unit        | VARCHAR(20)  | kg or portions                      |
| expires_at  | TIMESTAMP    | Expiry or pickup deadline           |
| status      | VARCHAR(20)  | open, claimed, closed, or expired   |
| created_at  | TIMESTAMP    | When donation was created           |

---

### 3️⃣ claims

Tracks who claimed which donation and its pickup status.

| Column      | Type        | Description                       |
| ----------- | ----------- | --------------------------------- |
| id          | SERIAL      | Primary key                       |
| donation_id | INT         | References donations(id)          |
| claimed_by  | INT         | References users(id)              |
| quantity    | INT         | Claimed amount                    |
| pickup_time | TIMESTAMP   | When pickup will happen           |
| status      | VARCHAR(20) | reserved, picked_up, or cancelled |
| created_at  | TIMESTAMP   | Claim creation time               |

---

## ⚙️ Relationships

- One **user (donor)** → can create many **donations**
- One **donation** → can have multiple **claims**
- One **user (charity or individual)** → can make many **claims**

### ER Diagram (simple)

```
-- ============================================
-- FOOD DONATION DATABASE STRUCTURE (THESIS)
-- ============================================

-- 1️⃣ USERS TABLE
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(200),
  organization_name VARCHAR(255),  -- for companies, marts, restaurants
  role VARCHAR(20) NOT NULL CHECK (role IN ('donor','charity','individual','admin')),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT now()
);

-- 2️⃣ DONATIONS TABLE
CREATE TABLE donations (
  id SERIAL PRIMARY KEY,
  donor_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  food_type VARCHAR(50),
  quantity INT NOT NULL,
  unit VARCHAR(20) DEFAULT 'portions',
  expires_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'open' CHECK(status IN ('open','claimed','closed','expired')),
  created_at TIMESTAMP DEFAULT now()
);


-- 3️⃣ CLAIMS TABLE
CREATE TABLE claims (
  id SERIAL PRIMARY KEY,
  donation_id INT REFERENCES donations(id) ON DELETE CASCADE,
  claimed_by INT REFERENCES users(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  pickup_time TIMESTAMP,
  status VARCHAR(20) DEFAULT 'reserved' CHECK(status IN ('reserved','picked_up','cancelled')),
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- SAMPLE TEST DATA (OPTIONAL)
-- ============================================

-- Example donor
INSERT INTO users (email, password_hash, full_name, organization_name, role, phone)
VALUES ('bakery@example.com', 'hashedpass', 'Fresh Bakery', 'Fresh Bakery Ltd', 'donor', '0401234567');

-- Example charity
INSERT INTO users (email, password_hash, full_name, organization_name, role, phone)
VALUES ('charity@example.com', 'hashedpass', 'Helping Hands', 'Helping Hands NGO', 'charity', '0417654321');

-- Example donation
INSERT INTO donations (donor_id, title, description, food_type, quantity, unit, expires_at)
VALUES (1, 'Leftover Bread', '10 loaves of bread available for donation', 'baked goods', 10, 'pieces', NOW() + INTERVAL '1 day');

-- Example claim
INSERT INTO claims (donation_id, claimed_by, quantity, pickup_time)
VALUES (1, 2, 10, NOW() + INTERVAL '3 hours');
```
