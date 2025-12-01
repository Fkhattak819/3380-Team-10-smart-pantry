/*
=============================================================================
 REMOVE MANUAL RECIPES (TEXT IDs)
=============================================================================
 This script deletes all recipes that have NON-NUMERIC IDs.
 This targets the manual recipes from your original json file 
 (e.g. 'cheese_omelette', 'veggie_fried_rice') while preserving 
 the API recipes (which have numeric IDs).
*/

PRINT 'Deleting manual recipes (Text IDs)...';

-- 1. Delete from linking tables first (Foreign Key constraints)
DELETE FROM RecipeIngredients 
WHERE ISNUMERIC(RecipeID) = 0;

DELETE FROM RecipeTags 
WHERE ISNUMERIC(RecipeID) = 0;

DELETE FROM Instructions 
WHERE ISNUMERIC(RecipeID) = 0;

-- 2. Delete from main Recipes table
DELETE FROM Recipes 
WHERE ISNUMERIC(RecipeID) = 0;

PRINT 'Manual recipes deleted. API recipes preserved.';