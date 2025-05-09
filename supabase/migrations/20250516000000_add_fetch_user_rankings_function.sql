
-- Create or replace the function to fetch user rankings
CREATE OR REPLACE FUNCTION public.fetch_user_rankings(limit_count integer DEFAULT 10)
RETURNS TABLE (
  rank bigint,
  nickname text,
  points integer,
  level integer
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    rank,
    nickname,
    points,
    level
  FROM 
    public.user_rankings
  ORDER BY 
    rank ASC
  LIMIT limit_count;
$$;
