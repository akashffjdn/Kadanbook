/**
 * Environment configuration.
 * All EXPO_PUBLIC_* vars are inlined at build time by Expo.
 */
export const env = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.kadanbook.com/v1',
  USE_MOCKS: process.env.EXPO_PUBLIC_USE_MOCKS !== 'false',
  RAZORPAY_KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ?? '',
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  POSTHOG_KEY: process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '',
  APP_VERSION: '1.0.0',
} as const;
