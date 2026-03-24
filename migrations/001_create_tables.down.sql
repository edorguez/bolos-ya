-- Drop triggers first
DROP TRIGGER IF EXISTS update_config_updated_at ON config;
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
DROP TRIGGER IF EXISTS update_prices_updated_at ON prices;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_supermarkets_updated_at ON supermarkets;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column;

-- Drop indexes
DROP INDEX IF EXISTS idx_prices_captured_at;
DROP INDEX IF EXISTS idx_carts_supermarket;
DROP INDEX IF EXISTS idx_prices_reported_by;
DROP INDEX IF EXISTS idx_cart_items_cart;
DROP INDEX IF EXISTS idx_carts_user_active;
DROP INDEX IF EXISTS idx_prices_product_supermarket;

-- Drop tables in reverse order of creation
DROP TABLE IF EXISTS config;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS prices;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS supermarkets;
DROP TABLE IF EXISTS users;
