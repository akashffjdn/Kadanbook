import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from './mmkv';

export type Language = 'ta' | 'en';

export interface SettingsState {
  language: Language;
  hapticEnabled: boolean;
  notifPaymentAlerts: boolean;
  notifReminderConfirm: boolean;
  notifDailySummary: boolean;
  monthlyAutoReminders: boolean;
  reminderTemplate: string;
  defaultDueDays: number;
  textScale: number; // 0.9 - 1.2
  upiId: string;

  setLanguage: (l: Language) => void;
  setHaptic: (v: boolean) => void;
  setNotif: (k: 'payment' | 'reminder' | 'daily', v: boolean) => void;
  setMonthlyAuto: (v: boolean) => void;
  setReminderTemplate: (t: string) => void;
  setDefaultDueDays: (n: number) => void;
  setTextScale: (n: number) => void;
  setUpiId: (v: string) => void;
}

const DEFAULT_TEMPLATE_TA =
  'வணக்கம் {name}, உங்கள் கடன் தொகை ₹{amount} கொடுக்க மறவாதீர்கள். நன்றி - {shop_name}';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'ta',
      hapticEnabled: true,
      notifPaymentAlerts: true,
      notifReminderConfirm: true,
      notifDailySummary: false,
      monthlyAutoReminders: false,
      reminderTemplate: DEFAULT_TEMPLATE_TA,
      defaultDueDays: 7,
      textScale: 1,
      upiId: '',

      setLanguage: (language) => set({ language }),
      setHaptic: (hapticEnabled) => set({ hapticEnabled }),
      setNotif: (k, v) =>
        set((s) => ({
          ...s,
          notifPaymentAlerts: k === 'payment' ? v : s.notifPaymentAlerts,
          notifReminderConfirm: k === 'reminder' ? v : s.notifReminderConfirm,
          notifDailySummary: k === 'daily' ? v : s.notifDailySummary,
        })),
      setMonthlyAuto: (monthlyAutoReminders) => set({ monthlyAutoReminders }),
      setReminderTemplate: (reminderTemplate) => set({ reminderTemplate }),
      setDefaultDueDays: (defaultDueDays) => set({ defaultDueDays }),
      setTextScale: (textScale) => set({ textScale }),
      setUpiId: (upiId) => set({ upiId }),
    }),
    {
      name: 'kadanbook-settings',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
