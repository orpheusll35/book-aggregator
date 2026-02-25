-- Add essential indexes to speed up homepage queries
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_view_count ON public.books(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_book_prices_book_id ON public.book_prices(book_id);
CREATE INDEX IF NOT EXISTS idx_book_prices_in_stock ON public.book_prices(in_stock) WHERE in_stock = true;

-- Analyzing the tables to update statistics for the query planner
ANALYZE public.books;
ANALYZE public.book_prices;
