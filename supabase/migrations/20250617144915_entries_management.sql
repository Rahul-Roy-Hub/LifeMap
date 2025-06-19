-- Create entries table
CREATE TABLE public.entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    mood INTEGER,
    content TEXT,
    habits JSONB,
    productivity INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own entries
CREATE POLICY "Users can read their own entries"
    ON public.entries
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own entries
CREATE POLICY "Users can insert their own entries"
    ON public.entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own entries
CREATE POLICY "Users can update their own entries"
    ON public.entries
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own entries
CREATE POLICY "Users can delete their own entries"
    ON public.entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index on user_id for better query performance
CREATE INDEX entries_user_id_idx ON public.entries(user_id);

-- Create index on created_at for better query performance
CREATE INDEX entries_created_at_idx ON public.entries(created_at);