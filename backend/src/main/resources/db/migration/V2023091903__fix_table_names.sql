DO $$
DECLARE
    has_app_users boolean;
    has_app_user_roles boolean;
    has_app_user_permissions boolean;
BEGIN
    -- Check table existence
    SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'app_users'
    ) INTO has_app_users;
    
    SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'app_user_roles'
    ) INTO has_app_user_roles;
    
    SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'app_user_permissions'
    ) INTO has_app_user_permissions;

    -- Drop conflicting tables if they exist
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS user_roles CASCADE;
    DROP TABLE IF EXISTS user_permissions CASCADE;

    -- Rename tables if they exist
    IF has_app_users THEN
        ALTER TABLE app_users RENAME TO users;
    END IF;

    IF has_app_user_roles THEN
        ALTER TABLE app_user_roles RENAME TO user_roles;
    END IF;

    IF has_app_user_permissions THEN
        ALTER TABLE app_user_permissions RENAME TO user_permissions;
    END IF;

    -- Update foreign key constraints if the tables exist
    IF has_app_user_roles THEN
        ALTER TABLE user_roles
        DROP CONSTRAINT IF EXISTS fk_user_roles_user_id,
        ADD CONSTRAINT fk_user_roles_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id);
    END IF;

    IF has_app_user_permissions THEN
        ALTER TABLE user_permissions
        DROP CONSTRAINT IF EXISTS fk_user_permissions_user_id,
        ADD CONSTRAINT fk_user_permissions_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id);
    END IF;

END $$;