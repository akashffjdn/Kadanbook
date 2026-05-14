/**
 * Centralized route paths for Expo Router. Use these constants instead of raw strings.
 */
export const ROUTES = {
  // Auth
  splash: '/',
  onboarding: '/onboarding',
  login: '/login',
  otp: '/otp',

  // Tabs (root)
  home: '/(tabs)',
  customers: '/(tabs)/customers',
  reports: '/(tabs)/reports',
  reminders: '/(tabs)/reminders',
  profile: '/(tabs)/profile',

  // Customer flows
  customerDetail: (id: string) => `/customer/${id}`,
  addCustomer: '/customer/new',
  editCustomer: (id: string) => `/customer/${id}/edit`,

  // Transaction flows
  addKadan: '/kadan/new',
  collectPayment: (customerId: string) => `/payment/collect?customerId=${customerId}`,

  // Modals & misc
  notifications: '/notifications',
  settings: '/settings',
} as const;
