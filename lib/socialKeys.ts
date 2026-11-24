export const SOCIAL_KEYS = [
  "website",
  "instagram",
  "x",
  "bluesky",
  "shop",
  "facebook",
  "tumblr",
  "pixiv",
] as const;

export type SocialKey = (typeof SOCIAL_KEYS)[number];
