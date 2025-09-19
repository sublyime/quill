-- Function to safely migrate data between tables
CREATE OR REPLACE FUNCTION migrate_user_data() RETURNS void AS $$
DECLARE
    target_table text;
    source_table text;
BEGIN
    -- Determine which table to use as source and target
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'app_users' 
        AND table_schema = current_schema()
    ) THEN
        source_table := 'app_users';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users' 
        AND table_schema = current_schema()
    ) THEN
        target_table := 'users';
    END IF;
    
    -- If both tables exist, migrate data from app_users to users
    IF source_table IS NOT NULL AND target_table IS NOT NULL THEN
        -- Copy data from app_users to users if not already there
        EXECUTE format('
            INSERT INTO %I (id, username, email, password, first_name, last_name, phone, status, created_at, updated_at)
            SELECT id, username, email, password, first_name, last_name, phone, status, created_at, updated_at
            FROM %I
            ON CONFLICT (id) DO NOTHING',
            target_table, source_table
        );
        
        -- Drop the old table
        EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', source_table);
    END IF;
    
    -- If neither table exists, create users table
    IF source_table IS NULL AND target_table IS NULL THEN
        CREATE TABLE users (
            id BIGSERIAL PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            phone VARCHAR(255),
            status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
            created_at TIMESTAMP,
            updated_at TIMESTAMP
        );
    END IF;
    
    -- Ensure supporting tables exist with correct foreign keys
    DROP TABLE IF EXISTS user_roles CASCADE;
    CREATE TABLE user_roles (
        user_id BIGINT NOT NULL,
        role VARCHAR(50) NOT NULL,
        CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role),
        CONSTRAINT fk_user_roles_user_id 
            FOREIGN KEY (user_id) 
            REFERENCES users(id) 
            ON DELETE CASCADE
    );
    
    DROP TABLE IF EXISTS user_permissions CASCADE;
    CREATE TABLE user_permissions (
        user_id BIGINT NOT NULL,
        permission VARCHAR(50) NOT NULL,
        CONSTRAINT pk_user_permissions PRIMARY KEY (user_id, permission),
        CONSTRAINT fk_user_permissions_user_id 
            FOREIGN KEY (user_id) 
            REFERENCES users(id) 
            ON DELETE CASCADE,
        CONSTRAINT user_permissions_permission_check 
            CHECK (permission IN ('READ', 'WRITE', 'DELETE', 'ADMIN', 'MANAGE_USERS', 'MANAGE_STORAGE', 'MANAGE_CONNECTIONS'))
    );
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_user_data();

-- Drop the function after use
DROP FUNCTION IF EXISTS migrate_user_data();