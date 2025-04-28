
export interface StatsProps {
  loading: boolean;
  subscribersCount: number;
  reflectionsCount: number;
  versesReadCount: number;
}

export interface TestimonialType {
  id: string;
  quote: string;
  author_name: string;
  author_role?: string;
}
