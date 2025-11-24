/*
=============================================================================
 SCRIPT TO SEED A TEST USER, PANTRY, AND SHOPPING LIST
=============================================================================
 This script creates a 'test_user' and adds some demo items to their
 pantry and shopping list.
*/

PRINT 'Seeding test user...';

-- Step 1: Create the test user if they don't exist
IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'test_user')
BEGIN
    INSERT INTO Users (Username, Email, PasswordHash)
    VALUES (
        'test_user', 
        'test@example.com',
        HASHBYTES('SHA2_256', 'test123') -- Password is 'test123'
    );
    PRINT 'Created test_user.';
END
ELSE
BEGIN
    PRINT 'test_user already exists.';
END
GO

-- Step 2: Get the ID for our new test user
DECLARE @TestUserID INT;
SELECT @TestUserID = UserID FROM Users WHERE Username = 'test_user';

-- Check if the user ID was found
IF @TestUserID IS NULL
BEGIN
    PRINT 'Error: Could not find UserID for test_user. Stopping script.';
    -- This will terminate the script execution
    RAISERROR('Test user not found, cannot seed pantry.', 16, 1);
    RETURN;
END

PRINT 'Seeding pantry for test_user (ID: ' + CAST(@TestUserID AS VARCHAR) + ')...';

-- Step 3: Populate the user's Pantry
-- (These are items they "own" that they can use for the Cheese Omelette)
IF NOT EXISTS (SELECT 1 FROM Pantry WHERE UserID = @TestUserID AND IngredientID = (SELECT IngredientID FROM Ingredients WHERE Name = 'egg'))
BEGIN
    INSERT INTO Pantry (UserID, IngredientID, Quantity, Unit)
    VALUES (@TestUserID, (SELECT IngredientID FROM Ingredients WHERE Name = 'egg'), 6, 'count');
END

IF NOT EXISTS (SELECT 1 FROM Pantry WHERE UserID = @TestUserID AND IngredientID = (SELECT IngredientID FROM Ingredients WHERE Name = 'cheese'))
BEGIN
    INSERT INTO Pantry (UserID, IngredientID, Quantity, Unit)
    VALUES (@TestUserID, (SELECT IngredientID FROM Ingredients WHERE Name = 'cheese'), 200, 'g');
END

IF NOT EXISTS (SELECT 1 FROM Pantry WHERE UserID = @TestUserID AND IngredientID = (SELECT IngredientID FROM Ingredients WHERE Name = 'butter'))
BEGIN
    INSERT INTO Pantry (UserID, IngredientID, Quantity, Unit)
    VALUES (@TestUserID, (SELECT IngredientID FROM Ingredients WHERE Name = 'butter'), 1, 'tbsp');
END

PRINT 'Pantry seeded.';

PRINT 'Seeding shopping list for test_user...';

-- Step 4: Populate the user's Shopping List
-- (These are items they "need")
IF NOT EXISTS (SELECT 1 FROM ShoppingList WHERE UserID = @TestUserID AND IngredientID = (SELECT IngredientID FROM Ingredients WHERE Name = 'milk'))
BEGIN
    INSERT INTO ShoppingList (UserID, IngredientID, IsPurchased)
    VALUES (@TestUserID, (SELECT IngredientID FROM Ingredients WHERE Name = 'milk'), 0);
END

IF NOT EXISTS (SELECT 1 FROM ShoppingList WHERE UserID = @TestUserID AND IngredientID = (SELECT IngredientID FROM Ingredients WHERE Name = 'bread_slice'))
BEGIN
    INSERT INTO ShoppingList (UserID, IngredientID, IsPurchased)
    VALUES (@TestUserID, (SELECT IngredientID FROM Ingredients WHERE Name = 'bread_slice'), 0);
END

PRINT 'Shopping list seeded.';
PRINT 'Test user seeding complete.';