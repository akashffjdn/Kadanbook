import { useTranslation } from 'react-i18next';

export const useGreeting = () => {
  const { t } = useTranslation();
  const h = new Date().getHours();
  if (h < 12) return t('home.morning');
  if (h < 17) return t('home.afternoon');
  return t('home.evening');
};
