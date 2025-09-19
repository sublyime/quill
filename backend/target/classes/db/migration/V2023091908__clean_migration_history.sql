-- Clean up any existing flyway schema history entries for migrations we're replacing
DELETE FROM flyway_schema_history 
WHERE version IN ('2023091903', '2023091904', '2023091905');