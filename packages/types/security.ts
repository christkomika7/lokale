export interface RateLimiterResponse {
  permanent: boolean;
  reason: string | null;
  banExpires: Date;
  code: string;
  message: string;
  retryAfter: number;
  status: number;
  statusText: string;
}
