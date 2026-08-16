export const ENV = {
  API_URL:
    process.env.EXPO_PUBLIC_API_URL ??
    "http://localhost:8000",

  REVENUECAT_IOS_API_KEY:
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY!,

  REVENUECAT_TEST_API_KEY:
    process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY!,
};