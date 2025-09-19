-- First, create a function to check if we need to rename tables
CREATE OR REPLACE FUNCTION tmp_check_table_name() RETURNS void AS $$
BEGIN
    -- Check if we need to rename app_users to users
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'app_users' 
        AND table_schema = current_schema()
    ) THEN
        -- Rename app_users to users if users table doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'users' 
            AND table_schema = current_schema()
        ) THEN
            ALTER TABLE app_users RENAME TO users;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT tmp_check_table_name();

-- Drop the temporary function
DROP FUNCTION tmp_check_table_name();

-- Make sure foreign keys point to the correct table
DO $$ 
BEGIN
    -- Check if the constraint we want to create already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_permissions_user_id'
        AND table_name = 'user_permissions'
    ) THEN
        -- Drop old constraint if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fkmv0feu3yduxgnn5mlgnupph4d'
            AND table_name = 'user_permissions'
        ) THEN
            ALTER TABLE user_permissions
            DROP CONSTRAINT fkmv0feu3yduxgnn5mlgnupph4d;
        END IF;

        -- Add new constraint only if it doesn't exist
        ALTER TABLE user_permissions
        ADD CONSTRAINT fk_user_permissions_user_id
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE;
    END IF;
END $$;