/**
 * Core domain models for KadanBook.
 */

export type ID = string;
export type TimestampMs = number;
export type CurrencyINR = number; // stored in paise? we keep rupees as integer for simplicity

export type CustomerStatus = 'pending' | 'paid' | 'overdue';

export interface Customer {
  id: ID;
  name: string;
  phone: string; // +91XXXXXXXXXX, normalized
  email?: string;
  address?: string;
  notes?: string;
  avatarColor?: string; // computed from name hash
  pendingAmount: CurrencyINR;
  totalPaid: CurrencyINR;
  lastActivityAt: TimestampMs | null;
  createdAt: TimestampMs;
  updatedAt: TimestampMs;
}

export type TransactionType = 'kadan' | 'payment';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'other';
export type UPIApp = 'gpay' | 'phonepe' | 'paytm' | 'other';

export interface Transaction {
  id: ID;
  customerId: ID;
  type: TransactionType;
  amount: CurrencyINR;
  notes?: string;
  // For kadan
  dueDate?: TimestampMs;
  // For payment
  paymentMethod?: PaymentMethod;
  upiApp?: UPIApp;
  // Common
  createdAt: TimestampMs;
}

export type NotificationType = 'payment' | 'reminder' | 'kadan' | 'overdue';

export interface AppNotification {
  id: ID;
  type: NotificationType;
  title: string;
  body: string;
  customerId?: ID;
  transactionId?: ID;
  read: boolean;
  createdAt: TimestampMs;
}

export interface ReminderHistory {
  id: ID;
  customerId: ID;
  sentAt: TimestampMs;
  channel: 'whatsapp' | 'sms';
  message: string;
}

export interface ShopProfile {
  shopName: string;
  ownerName: string;
  phone: string;
  upiId?: string;
  reminderTemplate: string;
  defaultDueDays: number;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  phone: string;
  expiresAt: TimestampMs;
}
