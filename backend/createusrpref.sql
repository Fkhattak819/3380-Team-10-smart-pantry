/*
=============================================================================
 REMOVE EXPIRY DATE COLUMN
=============================================================================
 This script removes the 'ExpiryDate' column from the Pantry table
 as the feature is no longer being supported.
*/

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Pantry') AND name = 'ExpiryDate')
BEGIN
    ALTER TABLE Pantry
    DROP COLUMN ExpiryDate;
    PRINT 'ExpiryDate column dropped successfully.';
END
ELSE
BEGIN
    PRINT 'ExpiryDate column does not exist (already dropped).';
END