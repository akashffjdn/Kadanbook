import { i18n, initI18n } from '@/i18n';
import { useSettingsStore } from '@/store/settings.store';
import { useEffect } from 'react';

/**
 * Initialize i18n and keep it in sync with the persisted language setting.
 */
export const useI18nSync = () => {
  const language = useSettingsStore((s) => s.language);

  useEffect(() => {
    initI18n(language);
    if (i18n.language !== language) i18n.changeLanguage(language);
  }, [language]);
};
