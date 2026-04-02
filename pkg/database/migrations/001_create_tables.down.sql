-- Drop indexes
DROP INDEX IF EXISTS idx_supermarkets_user;
DROP INDEX IF EXISTS idx_carts_user_status;
DROP INDEX IF EXISTS idx_cart_products_product;

-- Drop tables in reverse order of creation
DROP TABLE IF EXISTS cart_products;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS supermarkets;
DROP TABLE IF EXISTS users;
