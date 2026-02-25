export type PostTone = 'professional' | 'casual' | 'educational';

export interface SocialPostRequest {
  chartTitle: string;
  chartSubtitle?: string;
  seriesLabels: string[];
  dateRange: string;
  explanation?: string;
  tone: PostTone;
  includeThread: boolean;
}

export interface SocialPostResult {
  single_tweet: string;
  thread?: string[];
  hashtags: string[];
  linkedin_post?: string;
}

export interface SocialPostResponse {
  post: SocialPostResult | null;
  error: string | null;
  timestamp: string;
}
