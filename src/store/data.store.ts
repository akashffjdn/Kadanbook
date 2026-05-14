import { mockCustomers, mockNotifications, mockTransactions } from '@/mocks/seed';
import type { AppNotification, Customer, ID, Transaction } from '@/types/domain';
import { nanoid } from 'nanoid/non-secure';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from './mmkv';

/**
 * Local-first data store. In production this becomes a thin cache over
 * Drizzle/op-sqlite + a remote API. For now everything is in-memory + MMKV.
 */
export interface DataState {
  customers: Customer[];
  transactions: Transaction[];
  notifications: AppNotification[];
  reminderHistory: Record<ID, number>; // customerId → last sent timestamp

  hydratedSeed: boolean;
  seed: () => void;

  // Customers
  addCustomer: (
    data: Omit<
      Customer,
      'id' | 'pendingAmount' | 'totalPaid' | 'lastActivityAt' | 'createdAt' | 'updatedAt'
    >,
  ) => Customer;
  updateCustomer: (id: ID, patch: Partial<Customer>) => void;
  deleteCustomer: (id: ID) => void;
  getCustomer: (id: ID) => Customer | undefined;

  // Transactions
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  deleteTransaction: (id: ID) => void;
  getTransactionsForCustomer: (customerId: ID) => Transaction[];

  // Notifications
  markNotificationRead: (id: ID) => void;
  markAllNotificationsRead: () => void;
  archiveNotification: (id: ID) => void;

  // Reminders
  recordReminderSent: (customerId: ID) => void;
}

const recomputeTotals = (customers: Customer[], transactions: Transaction[]): Customer[] =>
  customers.map((c) => {
    const txns = transactions.filter((t) => t.customerId === c.id);
    const pending = txns.reduce((acc, t) => acc + (t.type === 'kadan' ? t.amount : -t.amount), 0);
    const totalPaid = txns.filter((t) => t.type === 'payment').reduce((a, t) => a + t.amount, 0);
    const lastActivityAt = txns.length
      ? Math.max(...txns.map((t) => t.createdAt))
      : c.lastActivityAt;
    return {
      ...c,
      pendingAmount: Math.max(0, pending),
      totalPaid,
      lastActivityAt,
    };
  });

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      customers: [],
      transactions: [],
      notifications: [],
      reminderHistory: {},
      hydratedSeed: false,

      seed: () => {
        if (get().hydratedSeed) return;
        const customers = recomputeTotals(mockCustomers, mockTransactions);
        set({
          customers,
          transactions: mockTransactions,
          notifications: mockNotifications,
          hydratedSeed: true,
        });
      },

      addCustomer: (data) => {
        const now = Date.now();
        const c: Customer = {
          ...data,
          id: nanoid(),
          pendingAmount: 0,
          totalPaid: 0,
          lastActivityAt: null,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ customers: [c, ...s.customers] }));
        return c;
      },

      updateCustomer: (id, patch) =>
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c,
          ),
        })),

      deleteCustomer: (id) =>
        set((s) => ({
          customers: s.customers.filter((c) => c.id !== id),
          transactions: s.transactions.filter((t) => t.customerId !== id),
        })),

      getCustomer: (id) => get().customers.find((c) => c.id === id),

      addTransaction: (data) => {
        const t: Transaction = { ...data, id: nanoid(), createdAt: Date.now() };
        const transactions = [t, ...get().transactions];
        const customers = recomputeTotals(get().customers, transactions);
        const notif: AppNotification = {
          id: nanoid(),
          type: data.type === 'kadan' ? 'kadan' : 'payment',
          title: data.type === 'kadan' ? 'New kadan added' : 'Payment received',
          body: data.type === 'kadan' ? `₹${data.amount} kadan added` : `₹${data.amount} received`,
          customerId: data.customerId,
          transactionId: t.id,
          read: false,
          createdAt: Date.now(),
        };
        set({
          transactions,
          customers,
          notifications: [notif, ...get().notifications],
        });
        return t;
      },

      deleteTransaction: (id) => {
        const transactions = get().transactions.filter((t) => t.id !== id);
        set({
          transactions,
          customers: recomputeTotals(get().customers, transactions),
        });
      },

      getTransactionsForCustomer: (customerId) =>
        get()
          .transactions.filter((t) => t.customerId === customerId)
          .sort((a, b) => b.createdAt - a.createdAt),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      archiveNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      recordReminderSent: (customerId) =>
        set((s) => ({
          reminderHistory: { ...s.reminderHistory, [customerId]: Date.now() },
        })),
    }),
    {
      name: 'kadanbook-data',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (s) => ({
        customers: s.customers,
        transactions: s.transactions,
        notifications: s.notifications,
        reminderHistory: s.reminderHistory,
        hydratedSeed: s.hydratedSeed,
      }),
    },
  ),
);

// Selector helpers
export const useTotalPending = () =>
  useDataStore((s) => s.customers.reduce((a, c) => a + c.pendingAmount, 0));

export const useCustomerCount = () => useDataStore((s) => s.customers.length);

export const useOverdueCount = () =>
  useDataStore((s) => {
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    return s.customers.filter(
      (c) => c.pendingAmount > 0 && c.lastActivityAt && c.lastActivityAt < cutoff,
    ).length;
  });

export const useTodayCollection = () =>
  useDataStore((s) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return s.transactions
      .filter((t) => t.type === 'payment' && t.createdAt >= start.getTime())
      .reduce((a, t) => a + t.amount, 0);
  });

export const useUnreadNotificationCount = () =>
  useDataStore((s) => s.notifications.filter((n) => !n.read).length);
