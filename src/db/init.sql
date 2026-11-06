-- TABLA: users
-- Almacena tanto a "user" como "admin". El rol se valida
-- a nivel DB (CHECK) y luego se replica en el JWT.
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'user'
                        CHECK (role IN ('user', 'admin')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- El email es único sin distinguir mayúsculas/minúsculas
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));

-- =========================================================
-- TABLA: categories
CREATE TABLE IF NOT EXISTS categories (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(80) NOT NULL UNIQUE,
    description     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- TABLA: products
CREATE TABLE IF NOT EXISTS products (
    id              SERIAL PRIMARY KEY,
    category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    brand           VARCHAR(80)  NOT NULL,
    model           VARCHAR(120) NOT NULL,
    description     TEXT,
    price           NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url       VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- TABLA: cart_items
CREATE TABLE IF NOT EXISTS cart_items (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- TABLA: orders
CREATE TABLE IF NOT EXISTS orders (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total_amount    NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    status          VARCHAR(20) NOT NULL DEFAULT 'COMPLETED'
                        CHECK (status IN ('COMPLETED', 'CANCELLED')),
    payment_method  VARCHAR(20) NOT NULL
                        CHECK (payment_method IN ('MERCADO_PAGO', 'NARANJA_X', 'TARJETA')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- TABLA: order_items
CREATE TABLE IF NOT EXISTS order_items (
    id              SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0)
);