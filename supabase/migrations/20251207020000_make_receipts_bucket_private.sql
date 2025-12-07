-- Make receipts bucket private for security (contains sensitive financial data)
-- Receipts should only be accessible via signed URLs, not public URLs

UPDATE storage.buckets SET public = false WHERE id = 'receipts';
