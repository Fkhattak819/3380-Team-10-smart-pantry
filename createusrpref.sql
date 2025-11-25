/*
=============================================================================
 ADD USER PREFERENCES
=============================================================================
 Creates a table to store dietary flags (e.g., 'vegan', 'pork-free') 
 linked to a user.
*/

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserPreferences]') AND type in (N'U'))
BEGIN
    CREATE TABLE UserPreferences (
        PreferenceID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
        DietType NVARCHAR(50) NOT NULL, -- e.g., 'vegan', 'no_pork', 'no_beef', 'gluten_free'
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UNIQUE(UserID, DietType) -- Prevent duplicate flags for one user
    );
    PRINT 'UserPreferences table created.';
END
ELSE
BEGIN
    PRINT 'UserPreferences table already exists.';
END