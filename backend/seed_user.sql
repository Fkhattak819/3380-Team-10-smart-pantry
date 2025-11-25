/*
=============================================================================
 SCRIPT TO SEED A TEST USER, PANTRY, AND SHOPPING LIST
=============================================================================
 This script creates a 'test_user' and adds some demo items to their
 pantry and shopping list.
*/

PRINT 'Seeding test user...';

-- Step 1: Delete existing test_user to ensure UserID = 1
DELETE FROM Users WHERE Username = 'test_user';
GO

-- Step 2: Reset identity to start from 1 (only if Users table is empty)
IF NOT EXISTS (SELECT 1 FROM Users)
BEGIN
    DBCC CHECKIDENT ('Users', RESEED, 0);
END
GO

-- Step 3: Create the test user (will be UserID = 1)
INSERT INTO Users (Username, Email, PasswordHash)
VALUES (
    'test_user', 
    'test@example.com',
    HASHBYTES('SHA2_256', 'test123') -- Password is 'test123'
);
PRINT 'Created test_user with UserID = 1.';
GO

-- Step 4: Get the ID for our test user (should be 1)
DECLARE @TestUserID INT = 1;
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

-- Step 5: Clear existing pantry for test user
DELETE FROM Pantry WHERE UserID = @TestUserID;
GO

-- Step 6: Populate the user's Pantry with expiry dates
-- (These are items they "own" that they can use for the Cheese Omelette)
INSERT INTO Pantry (UserID, IngredientID, Quantity, Unit, ExpiryDate)
VALUES 
    (@TestUserID, (SELECT IngredientID FROM Ingredients WHERE Name = 'egg'), 6, 'count', DATEADD(day, 7, GETDATE())),
    (@TestUserID, (SELECT IngredientID FROM Ingredients WHERE Name = 'cheese'), 200, 'g', DATEADD(day, 14, GETDATE())),
    (@TestUserID, (SELECT IngredientID FROM Ingredients WHERE Name = 'butter'), 1, 'tbsp', DATEADD(day, 30, GETDATE()));
GO

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