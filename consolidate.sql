/*
=============================================================================
 ADD DIETARY CHECK FLAG
=============================================================================
 Adds a column to track which recipes have already been analyzed by the AI.
*/

-- 1. Add the column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Recipes') AND name = 'IsDietaryChecked')
BEGIN
    ALTER TABLE Recipes
    ADD IsDietaryChecked BIT DEFAULT 0;
    PRINT 'Column IsDietaryChecked added.';
END
GO -- <--- THIS IS THE FIX: Forces the column to be created before continuing

-- 2. Backfill: Mark recipes as "Checked" if they already have a dietary tag
-- This saves the API calls you just made!
UPDATE Recipes 
SET IsDietaryChecked = 1 
WHERE RecipeID IN (
    SELECT rt.RecipeID 
    FROM RecipeTags rt 
    JOIN Tags t ON rt.TagID = t.TagID 
    WHERE t.TagName IN (
        'vegan', 'vegetarian', 'pescatarian', 
        'gluten_free', 'dairy_free', 'egg_free', 'soy_free', 'nut_free', 'shellfish_free',
        'pork_free', 'beef_free',
        'keto', 'paleo', 'low_carb', 'no_added_sugar'
    )
);

PRINT 'Flags updated for existing tags.';