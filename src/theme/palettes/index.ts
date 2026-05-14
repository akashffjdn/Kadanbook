export { amoled } from './amoled';
export { midnight } from './midnight';
export { cream } from './cream';
export { light } from './light';
export type { Palette } from './types';

import { amoled } from './amoled';
import { cream } from './cream';
import { light } from './light';
import { midnight } from './midnight';
import type { Palette } from './types';

export const palettes: Record<Palette['name'], Palette> = {
  amoled,
  midnight,
  cream,
  light,
};

export const themeMeta: Array<{
  id: Palette['name'];
  label: string;
  description: string;
  preview: string;
}> = [
  {
    id: 'amoled',
    label: 'AMOLED Dark',
    description: 'True-black premium',
    preview: amoled.brand.primary,
  },
  {
    id: 'midnight',
    label: 'Midnight Blue',
    description: 'Deep navy modern',
    preview: midnight.brand.primary,
  },
  { id: 'cream', label: 'Cream', description: 'Warm daytime', preview: cream.brand.primary },
  { id: 'light', label: 'Light', description: 'High contrast', preview: light.brand.primary },
];
