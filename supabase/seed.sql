-- Optional seed data for local testing
-- Run after migrations

-- Example books (optional - users will add their own)
INSERT INTO books (id, title, author, category, language) VALUES
  (uuid_generate_v4(), 'The Great Gatsby', 'F. Scott Fitzgerald', 'fiction', 'en'),
  (uuid_generate_v4(), 'Cien años de soledad', 'Gabriel García Márquez', 'fiction', 'es'),
  (uuid_generate_v4(), '1984', 'George Orwell', 'fiction', 'en')
ON CONFLICT DO NOTHING;
