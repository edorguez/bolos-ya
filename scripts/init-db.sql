-- Application tables (better-auth tables are managed by better-auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    better_auth_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    auth_provider VARCHAR(20) CHECK (auth_provider IN ('email', 'google', 'guest')),
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supermarkets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supermarket_id UUID NOT NULL REFERENCES supermarkets(id),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    barcode VARCHAR(50),
    is_weight_based BOOLEAN DEFAULT FALSE,
    price_usd BIGINT NOT NULL,
    price_bolivares BIGINT NOT NULL,
    price_bcv BIGINT NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supermarket_id UUID NOT NULL REFERENCES supermarkets(id),
    user_id UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    budget_bs BIGINT NOT NULL DEFAULT 0,
    budget_usd BIGINT NOT NULL DEFAULT 0,
    total_estimated_bs BIGINT,
    total_estimated_usd BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    is_manual_entry BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    number_of_months INTEGER NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    bank_name VARCHAR(80) NOT NULL,
    amount_bs BIGINT NOT NULL,
    price_bcv BIGINT NOT NULL,
    is_discount BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_supermarkets_user ON supermarkets(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_active ON carts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_cart_products_product ON cart_products(product_id);

-- Seed supermarkets (only if table is empty)
INSERT INTO supermarkets (id, name, is_custom, image_url, user_id, created_at, updated_at)
SELECT id, name, is_custom, image_url, user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'Automercado', FALSE, NULL, NULL::uuid),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'Casa & Mercado', FALSE, NULL, NULL::uuid),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'Casa Blanca', FALSE, NULL, NULL::uuid),
    ('44444444-4444-4444-4444-444444444444'::uuid, 'Central Madeirense', FALSE, NULL, NULL::uuid),
    ('55555555-5555-5555-5555-555555555555'::uuid, 'De Todo', FALSE, NULL, NULL::uuid),
    ('66666666-6666-6666-6666-666666666666'::uuid, 'El Super', FALSE, NULL, NULL::uuid),
    ('77777777-7777-7777-7777-777777777777'::uuid, 'Excelsior Gama', FALSE, NULL, NULL::uuid),
    ('88888888-8888-8888-8888-888888888888'::uuid, 'Forum', FALSE, NULL, NULL::uuid),
    ('99999999-9999-9999-9999-999999999999'::uuid, 'La Fuente', FALSE, NULL, NULL::uuid),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Makro', FALSE, NULL, NULL::uuid),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Plan Suárez', FALSE, NULL, NULL::uuid),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'Páramo', FALSE, NULL, NULL::uuid),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'Río Vida', FALSE, NULL, NULL::uuid),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Supermercado Plaza''s', FALSE, NULL, NULL::uuid),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'Unicasa', FALSE, NULL, NULL::uuid)
) AS data(id, name, is_custom, image_url, user_id)
WHERE NOT EXISTS (
    SELECT 1 FROM supermarkets s WHERE s.id = data.id
);
