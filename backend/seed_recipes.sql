/*
=============================================================================
 PART 1: POPULATE MASTER LISTS (Ingredients and Tags)
 (This part is now updated to include DefaultUnit)
=============================================================================
*/

PRINT 'Populating master Ingredients table...';

IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'egg') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('egg', 'count');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'cheese') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('cheese', 'g');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'butter') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('butter', 'tbsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'salt') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('salt', 'tsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'black_pepper') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('black_pepper', 'tsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'cooked_rice') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('cooked_rice', 'g');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'garlic') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('garlic', 'clove');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'onion') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('onion', 'count');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'carrot') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('carrot', 'count');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'peas') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('peas', 'g');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'soy_sauce') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('soy_sauce', 'tbsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'olive_oil') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('olive_oil', 'tbsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'chicken_breast') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('chicken_breast', 'g');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'bell_pepper') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('bell_pepper', 'count');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'broccoli') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('broccoli', 'g');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'cornstarch') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('cornstarch', 'tsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'water') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('water', 'ml');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'canned_tuna') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('canned_tuna', 'g');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'mayonnaise') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('mayonnaise', 'tbsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'mustard') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('mustard', 'tsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'celery') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('celery', 'count');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'bread_slice') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('bread_slice', 'count');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'dry_lentils') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('dry_lentils', 'g');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'vegetable_broth') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('vegetable_broth', 'ml');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'cucumber') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('cucumber', 'count');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'tomato') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('tomato', 'count');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'red_onion') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('red_onion', 'count');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'feta_cheese') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('feta_cheese', 'g');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'olive') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('olive', 'count');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'red_wine_vinegar') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('red_wine_vinegar', 'tbsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'oregano_dried') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('oregano_dried', 'tsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'banana') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('banana', 'count');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'milk') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('milk', 'ml');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'all_purpose_flour') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('all_purpose_flour', 'g');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'baking_powder') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('baking_powder', 'tsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'sugar') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('sugar', 'tbsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'avocado') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('avocado', 'count');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'lemon_juice') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('lemon_juice', 'tsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'chili_flake') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('chili_flake', 'tsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'flour_tortilla') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('flour_tortilla', 'count');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'canned_black_beans') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('canned_black_beans', 'g');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'cumin') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('cumin', 'tsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'russet_potato') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('russet_potato', 'count');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'noodles') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('noodles', 'g');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'peanut_butter') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('peanut_butter', 'tbsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'rice_vinegar') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('rice_vinegar', 'tbsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'honey') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('honey', 'tbsp');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'rolled_oats') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('rolled_oats', 'g');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'smoked_sausage') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('smoked_sausage', 'g');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'potato') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('potato', 'g');
IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE Name = 'paprika') INSERT INTO Ingredients (Name, DefaultUnit) VALUES ('paprika', 'tsp');

PRINT 'Populating master Tags table...';

IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'breakfast') INSERT INTO Tags (TagName) VALUES ('breakfast');
IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'quick') INSERT INTO Tags (TagName) VALUES ('quick');
IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'easy') INSERT INTO Tags (TagName) VALUES ('easy');
IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'vegetarian') INSERT INTO Tags (TagName) VALUES ('vegetarian');
IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'high_protein') INSERT INTO Tags (TagName) VALUES ('high_protein');
IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'budget') INSERT INTO Tags (TagName) VALUES ('budget');
IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'gluten_free') INSERT INTO Tags (TagName) VALUES ('gluten_free');
IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'gluten_free_optional') INSERT INTO Tags (TagName) VALUES ('gluten_free_optional');
IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'one_pan') INSERT INTO Tags (TagName) VALUES ('one_pan');

PRINT 'Master lists populated.';

/*
=============================================================================
 PART 2: POPULATE RECIPES
=============================================================================
 This section adds each recipe, its ingredients, tags, and instructions.
 This part is NOT idempotent. If you run this twice, you will get
 a "Primary Key violation" error, which is fine. It just means
 the recipe is already in the database.
*/

-- -------------------------------------------------------------------
-- Recipe 1: Cheese Omelette
-- -------------------------------------------------------------------
PRINT 'Inserting Cheese Omelette...';
INSERT INTO Recipes (RecipeID, Title, TimeMinutes, Servings, CaloriesPerServing)
VALUES ('cheese_omelette', 'Cheese Omelette', 10, 1, 360);

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit)
VALUES
('cheese_omelette', (SELECT IngredientID FROM Ingredients WHERE Name = 'egg'), 3, 'count'),
('cheese_omelette', (SELECT IngredientID FROM Ingredients WHERE Name = 'cheese'), 50, 'g'),
('cheese_omelette', (SELECT IngredientID FROM Ingredients WHERE Name = 'butter'), 1, 'tbsp'),
('cheese_omelette', (SELECT IngredientID FROM Ingredients WHERE Name = 'salt'), 0.25, 'tsp'),
('cheese_omelette', (SELECT IngredientID FROM Ingredients WHERE Name = 'black_pepper'), 0.25, 'tsp');

INSERT INTO RecipeTags (RecipeID, TagID)
VALUES
('cheese_omelette', (SELECT TagID FROM Tags WHERE TagName = 'breakfast')),
('cheese_omelette', (SELECT TagID FROM Tags WHERE TagName = 'quick')),
('cheese_omelette', (SELECT TagID FROM Tags WHERE TagName = 'easy')),
('cheese_omelette', (SELECT TagID FROM Tags WHERE TagName = 'vegetarian'));

INSERT INTO Instructions (RecipeID, StepNumber, StepText)
VALUES
('cheese_omelette', 1, 'Beat egg with salt and black_pepper until smooth.'),
('cheese_omelette', 2, 'Melt butter in a nonstick pan over medium-low heat.'),
('cheese_omelette', 3, 'Pour in egg; gently pull set edges toward center to let uncooked egg flow.'),
('cheese_omelette', 4, 'When top is slightly runny, add cheese over one half.'),
('cheese_omelette', 5, 'Fold and cook 20-30 seconds to melt. Slide onto a plate.');

-- -------------------------------------------------------------------
-- Recipe 2: Veggie Fried Rice
-- -------------------------------------------------------------------
PRINT 'Inserting Veggie Fried Rice...';
INSERT INTO Recipes (RecipeID, Title, TimeMinutes, Servings, CaloriesPerServing)
VALUES ('veggie_fried_rice', 'Veggie Fried Rice', 15, 2, 430);

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit)
VALUES
('veggie_fried_rice', (SELECT IngredientID FROM Ingredients WHERE Name = 'cooked_rice'), 300, 'g'),
('veggie_fried_rice', (SELECT IngredientID FROM Ingredients WHERE Name = 'egg'), 2, 'count'),
('veggie_fried_rice', (SELECT IngredientID FROM Ingredients WHERE Name = 'garlic'), 2, 'clove'),
('veggie_fried_rice', (SELECT IngredientID FROM Ingredients WHERE Name = 'onion'), 0.5, 'count'),
('veggie_fried_rice', (SELECT IngredientID FROM Ingredients WHERE Name = 'carrot'), 1, 'count'),
('veggie_fried_rice', (SELECT IngredientID FROM Ingredients WHERE Name = 'peas'), 100, 'g'),
('veggie_fried_rice', (SELECT IngredientID FROM Ingredients WHERE Name = 'soy_sauce'), 1, 'tbsp'),
('veggie_fried_rice', (SELECT IngredientID FROM Ingredients WHERE Name = 'olive_oil'), 1, 'tbsp');

INSERT INTO RecipeTags (RecipeID, TagID)
VALUES
('veggie_fried_rice', (SELECT TagID FROM Tags WHERE TagName = 'quick')),
('veggie_fried_rice', (SELECT TagID FROM Tags WHERE TagName = 'easy')),
('veggie_fried_rice', (SELECT TagID FROM Tags WHERE TagName = 'vegetarian'));

INSERT INTO Instructions (RecipeID, StepNumber, StepText)
VALUES
('veggie_fried_rice', 1, 'Mince garlic; finely dice onion and carrot. Beat egg.'),
('veggie_fried_rice', 2, 'Heat half the olive_oil in a pan over medium-high; scramble egg just set, remove.'),
('veggie_fried_rice', 3, 'Add remaining olive_oil; saute onion, carrot, and garlic 2-3 minutes.'),
('veggie_fried_rice', 4, 'Add cooked_rice and peas; stir-fry 2-3 minutes.'),
('veggie_fried_rice', 5, 'Return egg; add soy_sauce and toss. Serve hot.');

-- -------------------------------------------------------------------
-- Recipe 3: Simple Chicken Stir-Fry
-- -------------------------------------------------------------------
PRINT 'Inserting Simple Chicken Stir-Fry...';
INSERT INTO Recipes (RecipeID, Title, TimeMinutes, Servings, CaloriesPerServing)
VALUES ('chicken_stir_fry', 'Simple Chicken Stir-Fry', 20, 2, 480);

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit)
VALUES
('chicken_stir_fry', (SELECT IngredientID FROM Ingredients WHERE Name = 'chicken_breast'), 300, 'g'),
('chicken_stir_fry', (SELECT IngredientID FROM Ingredients WHERE Name = 'bell_pepper'), 1, 'count'),
('chicken_stir_fry', (SELECT IngredientID FROM Ingredients WHERE Name = 'broccoli'), 150, 'g'),
('chicken_stir_fry', (SELECT IngredientID FROM Ingredients WHERE Name = 'garlic'), 2, 'clove'),
('chicken_stir_fry', (SELECT IngredientID FROM Ingredients WHERE Name = 'soy_sauce'), 2, 'tbsp'),
('chicken_stir_fry', (SELECT IngredientID FROM Ingredients WHERE Name = 'olive_oil'), 1, 'tbsp'),
('chicken_stir_fry', (SELECT IngredientID FROM Ingredients WHERE Name = 'cornstarch'), 1, 'tsp'),
('chicken_stir_fry', (SELECT IngredientID FROM Ingredients WHERE Name = 'water'), 60, 'ml'),
('chicken_stir_fry', (SELECT IngredientID FROM Ingredients WHERE Name = 'black_pepper'), 0.25, 'tsp');

INSERT INTO RecipeTags (RecipeID, TagID)
VALUES
('chicken_stir_fry', (SELECT TagID FROM Tags WHERE TagName = 'quick')),
('chicken_stir_fry', (SELECT TagID FROM Tags WHERE TagName = 'easy')),
('chicken_stir_fry', (SELECT TagID FROM Tags WHERE TagName = 'high_protein'));

INSERT INTO Instructions (RecipeID, StepNumber, StepText)
VALUES
('chicken_stir_fry', 1, 'Slice chicken, bell_pepper, and broccoli; mince garlic.'),
('chicken_stir_fry', 2, 'Mix soy_sauce, water, cornstarch, and black_pepper in a small bowl.'),
('chicken_stir_fry', 3, 'Heat olive_oil over medium-high; saute chicken 4-5 minutes until cooked.'),
('chicken_stir_fry', 4, 'Add vegetables and garlic; cook 2-3 minutes.'),
('chicken_stir_fry', 5, 'Pour in sauce; toss 1-2 minutes until glossy. Serve immediately.');

-- -------------------------------------------------------------------
-- Recipe 4: Tuna Salad Sandwich
-- -------------------------------------------------------------------
PRINT 'Inserting Tuna Salad Sandwich...';
INSERT INTO Recipes (RecipeID, Title, TimeMinutes, Servings, CaloriesPerServing)
VALUES ('tuna_salad_sandwich', 'Tuna Salad Sandwich', 8, 2, 420);

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit)
VALUES
('tuna_salad_sandwich', (SELECT IngredientID FROM Ingredients WHERE Name = 'canned_tuna'), 160, 'g'),
('tuna_salad_sandwich', (SELECT IngredientID FROM Ingredients WHERE Name = 'mayonnaise'), 2, 'tbsp'),
('tuna_salad_sandwich', (SELECT IngredientID FROM Ingredients WHERE Name = 'mustard'), 1, 'tsp'),
('tuna_salad_sandwich', (SELECT IngredientID FROM Ingredients WHERE Name = 'celery'), 0.5, 'count'),
('tuna_salad_sandwich', (SELECT IngredientID FROM Ingredients WHERE Name = 'onion'), 0.25, 'count'),
('tuna_salad_sandwich', (SELECT IngredientID FROM Ingredients WHERE Name = 'bread_slice'), 4, 'count'),
('tuna_salad_sandwich', (SELECT IngredientID FROM Ingredients WHERE Name = 'salt'), 0.25, 'tsp'),
('tuna_salad_sandwich', (SELECT IngredientID FROM Ingredients WHERE Name = 'black_pepper'), 0.25, 'tsp');

INSERT INTO RecipeTags (RecipeID, TagID)
VALUES
('tuna_salad_sandwich', (SELECT TagID FROM Tags WHERE TagName = 'quick')),
('tuna_salad_sandwich', (SELECT TagID FROM Tags WHERE TagName = 'easy'));

INSERT INTO Instructions (RecipeID, StepNumber, StepText)
VALUES
('tuna_salad_sandwich', 1, 'Finely dice celery and onion.'),
('tuna_salad_sandwich', 2, 'Mix canned_tuna, mayonnaise, mustard, celery, onion, salt, and black_pepper.'),
('tuna_salad_sandwich', 3, 'Spread on bread_slice and close sandwiches. Serve.');

-- -------------------------------------------------------------------
-- Recipe 5: One-Pot Lentil Soup
-- -------------------------------------------------------------------
PRINT 'Inserting One-Pot Lentil Soup...';
INSERT INTO Recipes (RecipeID, Title, TimeMinutes, Servings, CaloriesPerServing)
VALUES ('lentil_soup', 'One-Pot Lentil Soup', 30, 4, 310);

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit)
VALUES
('lentil_soup', (SELECT IngredientID FROM Ingredients WHERE Name = 'dry_lentils'), 250, 'g'),
('lentil_soup', (SELECT IngredientID FROM Ingredients WHERE Name = 'onion'), 1, 'count'),
('lentil_soup', (SELECT IngredientID FROM Ingredients WHERE Name = 'carrot'), 1, 'count'),
('lentil_soup', (SELECT IngredientID FROM Ingredients WHERE Name = 'celery'), 1, 'count'),
('lentil_soup', (SELECT IngredientID FROM Ingredients WHERE Name = 'garlic'), 2, 'clove'),
('lentil_soup', (SELECT IngredientID FROM Ingredients WHERE Name = 'vegetable_broth'), 1000, 'ml'),
('lentil_soup', (SELECT IngredientID FROM Ingredients WHERE Name = 'olive_oil'), 1, 'tbsp'),
('lentil_soup', (SELECT IngredientID FROM Ingredients WHERE Name = 'salt'), 0.5, 'tsp'),
('lentil_soup', (SELECT IngredientID FROM Ingredients WHERE Name = 'black_pepper'), 0.25, 'tsp');

INSERT INTO RecipeTags (RecipeID, TagID)
VALUES
('lentil_soup', (SELECT TagID FROM Tags WHERE TagName = 'vegetarian')),
('lentil_soup', (SELECT TagID FROM Tags WHERE TagName = 'easy')),
('lentil_soup', (SELECT TagID FROM Tags WHERE TagName = 'budget'));

INSERT INTO Instructions (RecipeID, StepNumber, StepText)
VALUES
('lentil_soup', 1, 'Dice onion, carrot, celery; mince garlic.'),
('lentil_soup', 2, 'Saute onion, carrot, celery in olive_oil 3-4 minutes.'),
('lentil_soup', 3, 'Add garlic 30 seconds; stir.'),
('lentil_soup', 4, 'Add dry_lentils and vegetable_broth; bring to a boil.'),
('lentil_soup', 5, 'Reduce heat; simmer 20-25 minutes until lentils are tender.'),
('lentil_soup', 6, 'Season with salt and black_pepper; serve.');

-- -------------------------------------------------------------------
-- Recipe 6: Quick Greek Salad
-- -------------------------------------------------------------------
PRINT 'Inserting Quick Greek Salad...';
INSERT INTO Recipes (RecipeID, Title, TimeMinutes, Servings, CaloriesPerServing)
VALUES ('greek_salad', 'Quick Greek Salad', 10, 2, 280);

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit)
VALUES
('greek_salad', (SELECT IngredientID FROM Ingredients WHERE Name = 'cucumber'), 1, 'count'),
('greek_salad', (SELECT IngredientID FROM Ingredients WHERE Name = 'tomato'), 2, 'count'),
('greek_salad', (SELECT IngredientID FROM Ingredients WHERE Name = 'red_onion'), 0.25, 'count'),
('greek_salad', (SELECT IngredientID FROM Ingredients WHERE Name = 'feta_cheese'), 60, 'g'),
('greek_salad', (SELECT IngredientID FROM Ingredients WHERE Name = 'olive'), 12, 'count'),
('greek_salad', (SELECT IngredientID FROM Ingredients WHERE Name = 'olive_oil'), 1, 'tbsp'),
('greek_salad', (SELECT IngredientID FROM Ingredients WHERE Name = 'red_wine_vinegar'), 1, 'tbsp'),
('greek_salad', (SELECT IngredientID FROM Ingredients WHERE Name = 'oregano_dried'), 0.5, 'tsp'),
('greek_salad', (SELECT IngredientID FROM Ingredients WHERE Name = 'salt'), 0.25, 'tsp'),
('greek_salad', (SELECT IngredientID FROM Ingredients WHERE Name = 'black_pepper'), 0.25, 'tsp');

INSERT INTO RecipeTags (RecipeID, TagID)
VALUES
('greek_salad', (SELECT TagID FROM Tags WHERE TagName = 'vegetarian')),
('greek_salad', (SELECT TagID FROM Tags WHERE TagName = 'quick')),
('greek_salad', (SELECT TagID FROM Tags WHERE TagName = 'easy')),
('greek_salad', (SELECT TagID FROM Tags WHERE TagName = 'gluten_free'));

INSERT INTO Instructions (RecipeID, StepNumber, StepText)
VALUES
('greek_salad', 1, 'Chop cucumber and tomato; thinly slice red_onion.'),
('greek_salad', 2, 'Combine vegetables with olive and feta_cheese.'),
('greek_salad', 3, 'Whisk olive_oil, red_wine_vinegar, oregano_dried, salt, and black_pepper.'),
('greek_salad', 4, 'Toss salad with dressing and serve.');

-- -------------------------------------------------------------------
-- Recipe 7: Banana Pancakes
-- -------------------------------------------------------------------
PRINT 'Inserting Banana Pancakes...';
INSERT INTO Recipes (RecipeID, Title, TimeMinutes, Servings, CaloriesPerServing)
VALUES ('banana_pancakes', 'Banana Pancakes', 20, 2, 390);

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit)
VALUES
('banana_pancakes', (SELECT IngredientID FROM Ingredients WHERE Name = 'banana'), 1, 'count'),
('banana_pancakes', (SELECT IngredientID FROM Ingredients WHERE Name = 'egg'), 1, 'count'),
('banana_pancakes', (SELECT IngredientID FROM Ingredients WHERE Name = 'milk'), 150, 'ml'),
('banana_pancakes', (SELECT IngredientID FROM Ingredients WHERE Name = 'all_purpose_flour'), 120, 'g'),
('banana_pancakes', (SELECT IngredientID FROM Ingredients WHERE Name = 'baking_powder'), 1, 'tsp'),
('banana_pancakes', (SELECT IngredientID FROM Ingredients WHERE Name = 'sugar'), 1, 'tbsp'),
('banana_pancakes', (SELECT IngredientID FROM Ingredients WHERE Name = 'butter'), 1, 'tbsp'),
('banana_pancakes', (SELECT IngredientID FROM Ingredients WHERE Name = 'salt'), 0.25, 'tsp');

INSERT INTO RecipeTags (RecipeID, TagID)
VALUES
('banana_pancakes', (SELECT TagID FROM Tags WHERE TagName = 'breakfast')),
('banana_pancakes', (SELECT TagID FROM Tags WHERE TagName = 'vegetarian')),
('banana_pancakes', (SELECT TagID FROM Tags WHERE TagName = 'easy'));

INSERT INTO Instructions (RecipeID, StepNumber, StepText)
VALUES
('banana_pancakes', 1, 'Mash banana in a bowl; whisk in egg, milk, and sugar.'),
('banana_pancakes', 2, 'Add all_purpose_flour, baking_powder, and salt; mix until just combined.'),
('banana_pancakes', 3, 'Heat butter on a griddle over medium; ladle batter.'),
('banana_pancakes', 4, 'Cook until bubbles form, flip, and cook until golden. Serve.');

-- -------------------------------------------------------------------
-- Recipe 8: Avocado Toast
-- -------------------------------------------------------------------
PRINT 'Inserting Avocado Toast...';
INSERT INTO Recipes (RecipeID, Title, TimeMinutes, Servings, CaloriesPerServing)
VALUES ('avocado_toast', 'Avocado Toast', 7, 1, 360);

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit)
VALUES
('avocado_toast', (SELECT IngredientID FROM Ingredients WHERE Name = 'bread_slice'), 2, 'count'),
('avocado_toast', (SELECT IngredientID FROM Ingredients WHERE Name = 'avocado'), 1, 'count'),
('avocado_toast', (SELECT IngredientID FROM Ingredients WHERE Name = 'lemon_juice'), 1, 'tsp'),
('avocado_toast', (SELECT IngredientID FROM Ingredients WHERE Name = 'salt'), 0.25, 'tsp'),
('avocado_toast', (SELECT IngredientID FROM Ingredients WHERE Name = 'chili_flake'), 0.25, 'tsp');

INSERT INTO RecipeTags (RecipeID, TagID)
VALUES
('avocado_toast', (SELECT TagID FROM Tags WHERE TagName = 'vegetarian')),
('avocado_toast', (SELECT TagID FROM Tags WHERE TagName = 'quick')),
('avocado_toast', (SELECT TagID FROM Tags WHERE TagName = 'easy'));

INSERT INTO Instructions (RecipeID, StepNumber, StepText)
VALUES
('avocado_toast', 1, 'Toast bread_slice to preference.'),
('avocado_toast', 2, 'Mash avocado with lemon_juice, salt, and chili_flake.'),
('avocado_toast', 3, 'Spread on toast and serve.');

-- -------------------------------------------------------------------
-- Recipe 9: Bean & Cheese Quesadilla
-- -------------------------------------------------------------------
PRINT 'Inserting Bean & Cheese Quesadilla...';
INSERT INTO Recipes (RecipeID, Title, TimeMinutes, Servings, CaloriesPerServing)
VALUES ('bean_quesadilla', 'Bean & Cheese Quesadilla', 12, 2, 420);

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit)
VALUES
('bean_quesadilla', (SELECT IngredientID FROM Ingredients WHERE Name = 'flour_tortilla'), 2, 'count'),
('bean_quesadilla', (SELECT IngredientID FROM Ingredients WHERE Name = 'cheese'), 150, 'g'),
('bean_quesadilla', (SELECT IngredientID FROM Ingredients WHERE Name = 'canned_black_beans'), 120, 'g'),
('bean_quesadilla', (SELECT IngredientID FROM Ingredients WHERE Name = 'olive_oil'), 1, 'tbsp'),
('bean_quesadilla', (SELECT IngredientID FROM Ingredients WHERE Name = 'cumin'), 0.5, 'tsp'),
('bean_quesadilla', (SELECT IngredientID FROM Ingredients WHERE Name = 'salt'), 0.25, 'tsp');

INSERT INTO RecipeTags (RecipeID, TagID)
VALUES
('bean_quesadilla', (SELECT TagID FROM Tags WHERE TagName = 'quick')),
('bean_quesadilla', (SELECT TagID FROM Tags WHERE TagName = 'easy')),
('bean_quesadilla', (SELECT TagID FROM Tags WHERE TagName = 'vegetarian')),
('bean_quesadilla', (SELECT TagID FROM Tags WHERE TagName = 'budget'));

INSERT INTO Instructions (RecipeID, StepNumber, StepText)
VALUES
('bean_quesadilla', 1, 'Rinse and drain canned_black_beans; season with cumin and salt.'),
('bean_quesadilla', 2, 'Heat olive_oil in a skillet over medium.'),
('bean_quesadilla', 3, 'Place flour_tortilla, add cheese and beans on half; fold.'),
('bean_quesadilla', 4, 'Cook 2-3 minutes per side until golden and cheese melts. Repeat. Slice and serve.');

-- -------------------------------------------------------------------
-- Recipe 10: Crispy Baked Potato
-- -------------------------------------------------------------------
PRINT 'Inserting Crispy Baked Potato...';
INSERT INTO Recipes (RecipeID, Title, TimeMinutes, Servings, CaloriesPerServing)
VALUES ('baked_potato', 'Crispy Baked Potato', 50, 2, 300);

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit)
VALUES
('baked_potato', (SELECT IngredientID FROM Ingredients WHERE Name = 'russet_potato'), 2, 'count'),
('baked_potato', (SELECT IngredientID FROM Ingredients WHERE Name = 'olive_oil'), 1, 'tbsp'),
('baked_potato', (SELECT IngredientID FROM Ingredients WHERE Name = 'salt'), 0.5, 'tsp');

INSERT INTO RecipeTags (RecipeID, TagID)
VALUES
('baked_potato', (SELECT TagID FROM Tags WHERE TagName = 'vegetarian')),
('baked_potato', (SELECT TagID FROM Tags WHERE TagName = 'easy')),
('baked_potato', (SELECT TagID FROM Tags WHERE TagName = 'budget')),
('baked_potato', (SELECT TagID FROM Tags WHERE TagName = 'gluten_free'));

INSERT INTO Instructions (RecipeID, StepNumber, StepText)
VALUES
('baked_potato', 1, 'Preheat oven to 220C/425F.'),
('baked_potato', 2, 'Scrub russet_potato; poke holes with a fork. Rub with olive_oil and salt.'),
('baked_potato', 3, 'Bake on a rack 45-50 minutes until skins are crisp and centers tender.'),
('baked_potato', 4, 'Split and serve with desired toppings.');

-- -------------------------------------------------------------------
-- Recipe 11: 10-Min Peanut Noodles
-- -------------------------------------------------------------------
PRINT 'Inserting 10-Min Peanut Noodles...';
INSERT INTO Recipes (RecipeID, Title, TimeMinutes, Servings, CaloriesPerServing)
VALUES ('peanut_noodles', '10-Min Peanut Noodles', 10, 2, 520);

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit)
VALUES
('peanut_noodles', (SELECT IngredientID FROM Ingredients WHERE Name = 'noodles'), 200, 'g'),
('peanut_noodles', (SELECT IngredientID FROM Ingredients WHERE Name = 'peanut_butter'), 2, 'tbsp'),
('peanut_noodles', (SELECT IngredientID FROM Ingredients WHERE Name = 'soy_sauce'), 1.5, 'tbsp'),
('peanut_noodles', (SELECT IngredientID FROM Ingredients WHERE Name = 'rice_vinegar'), 1, 'tbsp'),
('peanut_noodles', (SELECT IngredientID FROM Ingredients WHERE Name = 'honey'), 1, 'tbsp'),
('peanut_noodles', (SELECT IngredientID FROM Ingredients WHERE Name = 'garlic'), 1, 'clove'),
('peanut_noodles', (SELECT IngredientID FROM Ingredients WHERE Name = 'water'), 2, 'tbsp');

INSERT INTO RecipeTags (RecipeID, TagID)
VALUES
('peanut_noodles', (SELECT TagID FROM Tags WHERE TagName = 'vegetarian')),
('peanut_noodles', (SELECT TagID FROM Tags WHERE TagName = 'quick')),
('peanut_noodles', (SELECT TagID FROM Tags WHERE TagName = 'easy'));

INSERT INTO Instructions (RecipeID, StepNumber, StepText)
VALUES
('peanut_noodles', 1, 'Boil noodles according to package; reserve 2 tbsp cooking water and drain.'),
('peanut_noodles', 2, 'Whisk peanut_butter, soy_sauce, rice_vinegar, honey, water, and minced garlic until smooth.'),
('peanut_noodles', 3, 'Toss noodles with sauce; loosen with reserved water as needed. Serve.');

-- -------------------------------------------------------------------
-- Recipe 12: Banana Oat Smoothie
-- -------------------------------------------------------------------
PRINT 'Inserting Banana Oat Smoothie...';
INSERT INTO Recipes (RecipeID, Title, TimeMinutes, Servings, CaloriesPerServing)
VALUES ('banana_smoothie', 'Banana Oat Smoothie', 5, 1, 350);

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit)
VALUES
('banana_smoothie', (SELECT IngredientID FROM Ingredients WHERE Name = 'banana'), 1, 'count'),
('banana_smoothie', (SELECT IngredientID FROM Ingredients WHERE Name = 'milk'), 250, 'ml'),
('banana_smoothie', (SELECT IngredientID FROM Ingredients WHERE Name = 'rolled_oats'), 30, 'g'),
('banana_smoothie', (SELECT IngredientID FROM Ingredients WHERE Name = 'peanut_butter'), 1, 'tbsp'),
('banana_smoothie', (SELECT IngredientID FROM Ingredients WHERE Name = 'honey'), 1, 'tsp');

INSERT INTO RecipeTags (RecipeID, TagID)
VALUES
('banana_smoothie', (SELECT TagID FROM Tags WHERE TagName = 'breakfast')),
('banana_smoothie', (SELECT TagID FROM Tags WHERE TagName = 'vegetarian')),
('banana_smoothie', (SELECT TagID FROM Tags WHERE TagName = 'quick')),
('banana_smoothie', (SELECT TagID FROM Tags WHERE TagName = 'gluten_free_optional'));

INSERT INTO Instructions (RecipeID, StepNumber, StepText)
VALUES
('banana_smoothie', 1, 'Add all ingredients to a blender.'),
('banana_smoothie', 2, 'Blend until smooth and creamy. Serve cold.');

/*
=============================================================================
 SCRIPT TO FIX RECIPE 13 (Sheet-Pan Sausage & Veggies)
=============================================================================
 This script will first delete any partial data for the recipe
 'sheet_pan_sausage_veggies' and then insert the correct, complete data.
*/

PRINT 'Deleting any partial data for recipe "sheet_pan_sausage_veggies"...';

-- Use DELETE statements to clear out partial data, ignoring foreign key errors
-- (in case the recipe was never added)
DELETE FROM RecipeIngredients WHERE RecipeID = 'sheet_pan_sausage_veggies';
DELETE FROM RecipeTags WHERE RecipeID = 'sheet_pan_sausage_veggies';
DELETE FROM Instructions WHERE RecipeID = 'sheet_pan_sausage_veggies';
DELETE FROM Recipes WHERE RecipeID = 'sheet_pan_sausage_veggies';


-- -------------------------------------------------------------------
-- Recipe 13: Sheet-Pan Sausage & Veggies (Corrected)
-- -------------------------------------------------------------------
PRINT 'Inserting correct data for Sheet-Pan Sausage & Veggies...';

INSERT INTO Recipes (RecipeID, Title, TimeMinutes, Servings, CaloriesPerServing)
VALUES ('sheet_pan_sausage_veggies', 'Sheet-Pan Sausage & Veggies', 30, 3, 520);

INSERT INTO RecipeIngredients (RecipeID, IngredientID, Quantity, Unit)
VALUES
('sheet_pan_sausage_veggies', (SELECT IngredientID FROM Ingredients WHERE Name = 'smoked_sausage'), 300, 'g'),
('sheet_pan_sausage_veggies', (SELECT IngredientID FROM Ingredients WHERE Name = 'potato'), 300, 'g'),
('sheet_pan_sausage_veggies', (SELECT IngredientID FROM Ingredients WHERE Name = 'bell_pepper'), 1, 'count'),
('sheet_pan_sausage_veggies', (SELECT IngredientID FROM Ingredients WHERE Name = 'onion'), 1, 'count'),
('sheet_pan_sausage_veggies', (SELECT IngredientID FROM Ingredients WHERE Name = 'olive_oil'), 2, 'tbsp'),
('sheet_pan_sausage_veggies', (SELECT IngredientID FROM Ingredients WHERE Name = 'paprika'), 1, 'tsp'),
('sheet_pan_sausage_veggies', (SELECT IngredientID FROM Ingredients WHERE Name = 'salt'), 0.5, 'tsp'),
('sheet_pan_sausage_veggies', (SELECT IngredientID FROM Ingredients WHERE Name = 'black_pepper'), 0.25, 'tsp');

INSERT INTO RecipeTags (RecipeID, TagID)
VALUES
('sheet_pan_sausage_veggies', (SELECT TagID FROM Tags WHERE TagName = 'easy')),
('sheet_pan_sausage_veggies', (SELECT TagID FROM Tags WHERE TagName = 'one_pan'));

INSERT INTO Instructions (RecipeID, StepNumber, StepText)
VALUES
('sheet_pan_sausage_veggies', 1, 'Preheat oven to 220C/425F. Slice smoked_sausage and vegetables.'),
('sheet_pan_sausage_veggies', 2, 'Toss with olive_oil, paprika, salt, and black_pepper on a sheet pan.'),
('sheet_pan_sausage_veggies', 3, 'Roast 20-25 minutes, stirring once, until browned and tender. Serve.');

PRINT 'Recipe 13 has been fixed.';

PRINT 'All recipes have been inserted successfully.';

