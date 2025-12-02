/* =============================================================
  CORE & MASTER LIST TABLES
=============================================================
*/

CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL
);

CREATE TABLE Ingredients (
    IngredientID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL UNIQUE,
    DefaultUnit NVARCHAR(50) NOT NULL  -- <-- ADD THIS LINE
);

CREATE TABLE Tags (
    TagID INT IDENTITY(1,1) PRIMARY KEY,
    TagName NVARCHAR(100) NOT NULL UNIQUE
);

-- === MODIFIED TABLE ===
-- RecipeID is now the string from your JSON
CREATE TABLE Recipes (
    RecipeID NVARCHAR(100) NOT NULL PRIMARY KEY, -- CHANGED
    Title NVARCHAR(200) NOT NULL,
    TimeMinutes INT,
    Servings INT,
    CaloriesPerServing INT
    -- 'OriginalJsonID' column is no longer needed
);

/* =============================================================
  APP FEATURE TABLES (PANTRY & SHOPPING)
=============================================================
*/

CREATE TABLE Pantry (
    PantryID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    IngredientID INT NOT NULL FOREIGN KEY REFERENCES Ingredients(IngredientID),
    Quantity FLOAT,
    Unit NVARCHAR(50),
    UNIQUE(UserID, IngredientID)
);

CREATE TABLE ShoppingList (
    ShoppingListItemID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    IngredientID INT NOT NULL FOREIGN KEY REFERENCES Ingredients(IngredientID),
    IsPurchased BIT DEFAULT 0
);

/* =============================================================
  RECIPE LINKING (MANY-TO-MANY) TABLES
=============================================================
*/

-- === MODIFIED TABLE ===
-- RecipeID now links to the new string-based ID
CREATE TABLE RecipeIngredients (
    RecipeIngredientID INT IDENTITY(1,1) PRIMARY KEY,
    RecipeID NVARCHAR(100) NOT NULL FOREIGN KEY REFERENCES Recipes(RecipeID), -- CHANGED
    IngredientID INT NOT NULL FOREIGN KEY REFERENCES Ingredients(IngredientID),
    Quantity FLOAT,
    Unit NVARCHAR(50),
    UNIQUE(RecipeID, IngredientID)
);

-- === MODIFIED TABLE ===
-- RecipeID now links to the new string-based ID
CREATE TABLE RecipeTags (
    RecipeTagID INT IDENTITY(1,1) PRIMARY KEY,
    RecipeID NVARCHAR(100) NOT NULL FOREIGN KEY REFERENCES Recipes(RecipeID), -- CHANGED
    TagID INT NOT NULL FOREIGN KEY REFERENCES Tags(TagID),
    UNIQUE(RecipeID, TagID)
);

-- === MODIFIED TABLE ===
-- RecipeID now links to the new string-based ID
CREATE TABLE Instructions (
    InstructionID INT IDENTITY(1,1) PRIMARY KEY,
    RecipeID NVARCHAR(100) NOT NULL FOREIGN KEY REFERENCES Recipes(RecipeID), -- CHANGED
    StepNumber INT NOT NULL,
    StepText NVARCHAR(MAX) NOT NULL
);