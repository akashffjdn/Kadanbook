// `expo-file-system/legacy` exposes the proven `documentDirectory` +
// `writeAsStringAsync` API. The new (v19) class-based File/Paths API exists
// but is still in flux. Legacy is the supported escape hatch in SDK 54.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useAuthStore } from '@/store/auth.store';
import { useDataStore } from '@/store/data.store';
import { useSettingsStore } from '@/store/settings.store';

/**
 * Export all app data as a timestamped JSON file and open the system
 * share sheet so the user can save it to Drive, email it to themselves,
 * send via WhatsApp, etc.
 *
 * Design ref: WhatsApp chat backup (single tap → share sheet appears).
 *
 * Returns true if shared, false if user cancelled or sharing isn't available.
 */
export const exportAllDataAsJson = async (): Promise<boolean> => {
  const data = useDataStore.getState();
  const settings = useSettingsStore.getState();
  const auth = useAuthStore.getState();

  const payload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    profile: auth.profile,
    settings: {
      language: settings.language,
      reminderTemplate: settings.reminderTemplate,
      defaultDueDays: settings.defaultDueDays,
      upiId: settings.upiId,
    },
    customers: data.customers,
    transactions: data.transactions,
    notifications: data.notifications,
    reminderHistory: data.reminderHistory,
  };

  const json = JSON.stringify(payload, null, 2);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `kadanbook-backup-${stamp}.json`;
  const fileUri = `${FileSystem.documentDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(fileUri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) return false;

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Backup KadanBook data',
    UTI: 'public.json',
  });
  return true;
};
