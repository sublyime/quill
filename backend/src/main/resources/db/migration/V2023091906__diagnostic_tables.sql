-- Create a function to show table information
CREATE OR REPLACE FUNCTION diagnostic_info() RETURNS void AS $$
DECLARE
    table_record record;
    constraint_record record;
BEGIN
    RAISE NOTICE 'Diagnostic Information:';
    RAISE NOTICE '----------------------';
    
    -- List all tables
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    LOOP
        RAISE NOTICE 'Table: %', table_record.table_name;
        
        -- List constraints for each table
        FOR constraint_record IN 
            SELECT conname, contype, pg_get_constraintdef(oid) as def
            FROM pg_constraint 
            WHERE conrelid = table_record.table_name::regclass
        LOOP
            RAISE NOTICE '  Constraint: % (%) - %', 
                constraint_record.conname, 
                constraint_record.contype, 
                constraint_record.def;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute diagnostic function
SELECT diagnostic_info();

-- Drop the function after use
DROP FUNCTION IF EXISTS diagnostic_info();