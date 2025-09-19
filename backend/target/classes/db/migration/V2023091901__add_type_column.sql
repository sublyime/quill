-- Add type column to connections table
ALTER TABLE connections 
ADD COLUMN IF NOT EXISTS type VARCHAR(255);

-- Set default value for existing records
UPDATE connections SET type = source_type WHERE type IS NULL;

-- Make the column not null after setting defaults
ALTER TABLE connections 
ALTER COLUMN type SET NOT NULL;