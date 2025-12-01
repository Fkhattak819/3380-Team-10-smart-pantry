/*
=============================================================================
 INCREASE UNIT COLUMN SIZE
=============================================================================
 The 'Unit' column was originally NVARCHAR(50), which is too small for
 messy API data like "1 bulb, reserve fronds".
 
 This script increases it to NVARCHAR(255) to prevent truncation errors.
*/

PRINT 'Resizing Unit column in RecipeIngredients...';

ALTER TABLE RecipeIngredients
ALTER COLUMN Unit NVARCHAR(255);

PRINT 'RecipeIngredients.Unit resized to 255.';

-- Also resize the Master Ingredients table just to be safe/consistent
PRINT 'Resizing DefaultUnit column in Ingredients...';

ALTER TABLE Ingredients
ALTER COLUMN DefaultUnit NVARCHAR(255);

PRINT 'Ingredients.DefaultUnit resized to 255.';