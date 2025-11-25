/*
=============================================================================
 RESET NUTRITION FOR IMPORTED RECIPES
=============================================================================
 This script resets the Calories and Servings for all imported recipes
 (TheMealDB recipes) back to their defaults.
 
 This forces the 'enrich_nutrition.py' script to re-process them
 using the newly cleaned ingredient data.
*/

PRINT 'Resetting nutrition for imported recipes...';

-- TheMealDB uses numeric IDs (e.g., '52772').
-- Your manual recipes use text IDs (e.g., 'cheese_omelette').
-- We use ISNUMERIC() to target only the imported ones so we don't
-- overwrite your manual "Cheese Omelette" data.

UPDATE Recipes
SET 
    CaloriesPerServing = 500, -- The default "needs update" flag
    Servings = 2              -- The default servings
WHERE 
    ISNUMERIC(RecipeID) = 1;  -- Only affects numeric IDs

PRINT 'Reset complete. You can now run enrich_nutrition.py again.';