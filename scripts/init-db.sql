-- Application tables (better-auth tables are managed by better-auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    better_auth_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    auth_provider VARCHAR(20) CHECK (auth_provider IN ('email', 'google', 'guest')),
    is_premium BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
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

CREATE TABLE IF NOT EXISTS payment_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(30) NOT NULL,
    description VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS rejection_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reason VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    number_of_months INTEGER NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    bank_name VARCHAR(80) NOT NULL,
    amount_bs BIGINT NOT NULL,
    amount_usd BIGINT NOT NULL,
    price_bcv BIGINT NOT NULL,
    identification VARCHAR(20) NOT NULL,
    is_discount BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_id UUID NOT NULL REFERENCES payment_statuses(id),
    rejection_reason_id UUID REFERENCES rejection_reasons(id),
    rejection_message VARCHAR(200),
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
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
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Central Madeirense', FALSE, NULL, NULL::uuid),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Excelsior Gama', FALSE, NULL, NULL::uuid),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'Unicasa', FALSE, NULL, NULL::uuid),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'Farmatodo', FALSE, NULL, NULL::uuid),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Páramo', FALSE, NULL, NULL::uuid),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'Forum', FALSE, NULL, NULL::uuid),
    ('gggggggg-gggg-gggg-gggg-gggggggggggg'::uuid, 'Río Vida', FALSE, NULL, NULL::uuid),
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh'::uuid, 'Plan Suárez', FALSE, NULL, NULL::uuid),
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii'::uuid, 'Plaza''s', FALSE, NULL, NULL::uuid),
    ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj'::uuid, 'Makro', FALSE, NULL, NULL::uuid)
) AS data(id, name, is_custom, image_url, user_id)
WHERE NOT EXISTS (
    SELECT 1 FROM supermarkets s WHERE s.id = data.id
);

-- Seed payment statuses
INSERT INTO payment_statuses (id, name, description)
VALUES
    ('a1111111-1111-4a11-9a11-111111111111'::uuid, 'Pendiente', 'Pago recibido, esperando verificaci\u00f3n'),
    ('a2222222-2222-4a22-9a22-222222222222'::uuid, 'Aprobado', 'Pago verificado y aprobado'),
    ('a3333333-3333-4a33-9a33-333333333333'::uuid, 'Rechazado', 'Pago rechazado por el administrador')
ON CONFLICT (id) DO NOTHING;

-- Seed rejection reasons
INSERT INTO rejection_reasons (id, reason)
VALUES
    ('b1111111-1111-4b11-9b11-111111111111'::uuid, 'Monto insuficiente'),
    ('b2222222-2222-4b22-9b22-222222222222'::uuid, 'N\u00famero de referencia inv\u00e1lido'),
    ('b3333333-3333-4b33-9b33-333333333333'::uuid, 'Pago fuera del per\u00edodo permitido'),
    ('b4444444-4444-4b44-9b44-444444444444'::uuid, 'Pago duplicado'),
    ('b5555555-5555-4b55-9b55-555555555555'::uuid, 'Otro')
ON CONFLICT (id) DO NOTHING;
