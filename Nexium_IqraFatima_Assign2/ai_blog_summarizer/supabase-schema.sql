-- Supabase SQL Schema for Assignment 2: Blog Summariser
-- This file contains the required table structure for storing blog summaries

-- Create blog_summaries table for storing AI-generated summaries
CREATE TABLE IF NOT EXISTS public.blog_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary_english TEXT NOT NULL,
    summary_urdu TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster URL lookups
CREATE INDEX IF NOT EXISTS idx_blog_summaries_url ON public.blog_summaries(url);

-- Create index for created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_blog_summaries_created_at ON public.blog_summaries(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.blog_summaries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access for authenticated users
CREATE POLICY IF NOT EXISTS "Allow read access for authenticated users" ON public.blog_summaries
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow insert for authenticated users
CREATE POLICY IF NOT EXISTS "Allow insert for authenticated users" ON public.blog_summaries
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow update for authenticated users
CREATE POLICY IF NOT EXISTS "Allow update for authenticated users" ON public.blog_summaries
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER IF NOT EXISTS handle_blog_summaries_updated_at
    BEFORE UPDATE ON public.blog_summaries
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Comment on table and columns for documentation
COMMENT ON TABLE public.blog_summaries IS 'Stores AI-generated summaries of blog posts in English and Urdu';
COMMENT ON COLUMN public.blog_summaries.url IS 'Original blog post URL (unique)';
COMMENT ON COLUMN public.blog_summaries.title IS 'Extracted title of the blog post';
COMMENT ON COLUMN public.blog_summaries.summary_english IS 'AI-generated summary in English';
COMMENT ON COLUMN public.blog_summaries.summary_urdu IS 'Translated summary in Urdu using JS dictionary';

-- Insert sample data for testing (optional)
INSERT INTO public.blog_summaries (url, title, summary_english, summary_urdu) 
VALUES 
(
    'https://example.com/test-blog',
    'Test Blog Post',
    'This is a sample English summary for testing purposes.',
    'یہ ٹیسٹ کے مقاصد کے لیے ایک نمونہ انگریزی خلاصہ ہے۔'
) 
ON CONFLICT (url) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.blog_summaries TO authenticated;
GRANT SELECT ON public.blog_summaries TO anon;
