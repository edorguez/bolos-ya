CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR,
    google_id VARCHAR(255) UNIQUE,
    auth_provider VARCHAR(20) CHECK (auth_provider IN ('email', 'google', 'guest')),
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE supermarkets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supermarket_id UUID NOT NULL REFERENCES supermarkets(id),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    barcode VARCHAR(50),
    is_weight_based BOOLEAN DEFAULT FALSE,
    price_usd BIGINT NOT NULL, -- stored in cents
    price_bolivares BIGINT NOT NULL, -- stored in cents
    price_bcv BIGINT NOT NULL, -- stored in cents
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supermarket_id UUID NOT NULL REFERENCES supermarkets(id),
    user_id UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    budget_bs BIGINT NOT NULL DEFAULT 0, -- stored in cents
    budget_usd BIGINT NOT NULL DEFAULT 0, -- stored in cents
    total_estimated_bs BIGINT NOT NULL DEFAULT 0, -- stored in cents
    total_estimated_usd BIGINT NOT NULL DEFAULT 0, -- stored in cents
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE cart_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    is_manual_entry BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_supermarkets_user ON supermarkets(user_id);
CREATE INDEX idx_carts_user_active ON carts(user_id, is_active);
CREATE INDEX idx_cart_products_product ON cart_products(product_id);
