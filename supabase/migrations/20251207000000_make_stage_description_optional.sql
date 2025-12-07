-- Make description optional in stages table
ALTER TABLE stages ALTER COLUMN description DROP NOT NULL;
