-- Drop existing constraint if exists
ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS user_permissions_permission_check;

-- Recreate the constraint with valid values
ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_permission_check 
    CHECK (permission IN ('READ', 'WRITE', 'DELETE', 'ADMIN', 'MANAGE_USERS', 'MANAGE_STORAGE', 'MANAGE_CONNECTIONS'));