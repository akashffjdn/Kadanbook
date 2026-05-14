import { Linking } from 'react-native';

export interface UPIParams {
  payeeVPA: string; // e.g. shop@okaxis
  payeeName: string;
  amount: number;
  note?: string;
}

const build = (params: UPIParams) => {
  const p = new URLSearchParams({
    pa: params.payeeVPA,
    pn: params.payeeName,
    am: params.amount.toFixed(2),
    cu: 'INR',
    tn: (params.note ?? 'KadanBook').slice(0, 80),
  });
  return p.toString();
};

export const upiLinks = (params: UPIParams) => {
  const qs = build(params);
  return {
    generic: `upi://pay?${qs}`,
    gpay: `tez://upi/pay?${qs}`,
    phonepe: `phonepe://pay?${qs}`,
    paytm: `paytmmp://pay?${qs}`,
  };
};

export const openUPI = async (
  app: 'gpay' | 'phonepe' | 'paytm' | 'generic',
  params: UPIParams,
): Promise<boolean> => {
  const url = upiLinks(params)[app];
  const can = await Linking.canOpenURL(url).catch(() => false);
  if (!can) return false;
  await Linking.openURL(url);
  return true;
};

export const detectInstalledUPIApps = async (): Promise<{
  gpay: boolean;
  phonepe: boolean;
  paytm: boolean;
}> => {
  const dummy: UPIParams = { payeeVPA: 'a@b', payeeName: 'KadanBook', amount: 1 };
  const links = upiLinks(dummy);
  const [gpay, phonepe, paytm] = await Promise.all([
    Linking.canOpenURL(links.gpay).catch(() => false),
    Linking.canOpenURL(links.phonepe).catch(() => false),
    Linking.canOpenURL(links.paytm).catch(() => false),
  ]);
  return { gpay, phonepe, paytm };
};

export const buildWhatsAppLink = (phone: string, message: string): string => {
  const digits = phone.replace(/\D/g, '').replace(/^91/, '');
  return `whatsapp://send?phone=91${digits}&text=${encodeURIComponent(message)}`;
};

export const openWhatsApp = async (phone: string, message: string): Promise<boolean> => {
  const url = buildWhatsAppLink(phone, message);
  const can = await Linking.canOpenURL(url).catch(() => false);
  if (!can) {
    const webUrl = `https://wa.me/91${phone.replace(/\D/g, '').replace(/^91/, '')}?text=${encodeURIComponent(message)}`;
    await Linking.openURL(webUrl);
    return true;
  }
  await Linking.openURL(url);
  return true;
};
