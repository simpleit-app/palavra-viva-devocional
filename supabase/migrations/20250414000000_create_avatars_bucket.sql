
-- Create a bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create policy to allow users to upload avatars
CREATE POLICY "Allow users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create policy to allow users to update their avatars
CREATE POLICY "Allow users to update their avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create policy to allow users to delete their old avatars
CREATE POLICY "Allow users to delete their avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create policy to allow public read access to avatars
CREATE POLICY "Allow public to read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
