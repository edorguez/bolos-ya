-- Drop application indexes
DROP INDEX IF EXISTS idx_supermarkets_user;
DROP INDEX IF EXISTS idx_carts_user_active;
DROP INDEX IF EXISTS idx_cart_products_product;

-- Drop better-auth indexes
DROP INDEX IF EXISTS idx_session_user_id;
DROP INDEX IF EXISTS idx_session_token;
DROP INDEX IF EXISTS idx_account_user_id;
DROP INDEX IF EXISTS idx_account_provider;
DROP INDEX IF EXISTS idx_verification_identifier;

-- Drop tables in reverse order of creation
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS cart_products;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS supermarkets;
DROP TABLE IF EXISTS users;

-- Drop better-auth tables
DROP TABLE IF EXISTS verification;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS "user";
