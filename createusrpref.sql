/*
=============================================================================
 UPDATE SHOPPING LIST SCHEMA
=============================================================================
 Adds Quantity and Unit columns to the ShoppingList table to match
 the Pantry table structure.
*/

PRINT 'Updating ShoppingList table...';

-- 1. Add Quantity (Default to 1 for existing rows)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ShoppingList') AND name = 'Quantity')
BEGIN
    ALTER TABLE ShoppingList
    ADD Quantity FLOAT DEFAULT 1;
    PRINT 'Added Quantity column.';
END

-- 2. Add Unit (Default to 'count' for existing rows)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ShoppingList') AND name = 'Unit')
BEGIN
    ALTER TABLE ShoppingList
    ADD Unit NVARCHAR(255) DEFAULT 'count';
    PRINT 'Added Unit column.';
END

PRINT 'ShoppingList table updated.';