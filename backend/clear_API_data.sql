/*
=============================================================================
 CLEAR IMPORTED API DATA & ORPHANED INGREDIENTS
=============================================================================
 1. Deletes all recipes (and links) that have NUMERIC IDs (TheMealDB data).
 2. Deletes all Ingredients that are no longer used by ANY recipe, pantry, 
    or shopping list (cleaning up the "junk" ingredients).
*/

PRINT 'Starting cleanup...';

-- STEP 1: Delete recipe links for imported (numeric ID) recipes
DELETE FROM RecipeIngredients 
WHERE ISNUMERIC(RecipeID) = 1;

DELETE FROM RecipeTags 
WHERE ISNUMERIC(RecipeID) = 1;

DELETE FROM Instructions 
WHERE ISNUMERIC(RecipeID) = 1;

-- STEP 2: Delete the recipes themselves
DELETE FROM Recipes 
WHERE ISNUMERIC(RecipeID) = 1;

PRINT 'Imported recipes deleted.';

-- STEP 3: Delete "Orphaned" Ingredients
-- This removes ingredients that are NOT used in:
--   a) The remaining recipes (your manual ones)
--   b) The Pantry
--   c) The Shopping List
DELETE FROM Ingredients
WHERE IngredientID NOT IN (SELECT IngredientID FROM RecipeIngredients)
  AND IngredientID NOT IN (SELECT IngredientID FROM Pantry)
  AND IngredientID NOT IN (SELECT IngredientID FROM ShoppingList);

PRINT 'Orphaned ingredients deleted. Database is clean.';