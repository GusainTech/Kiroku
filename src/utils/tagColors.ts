// Clean, understated tag color generator for Soft Paper & Charcoal Graphite themes

export interface TagColorStyle {
  light: string;
  dark: string;
  name: string;
}

const TAG_PALETTE: TagColorStyle[] = [
  {
    name: 'slate',
    light: 'bg-[#EEF1F5] text-[#3E5568] border-[#D4DDE7]',
    dark: 'dark:bg-[#282A2F] dark:text-[#CBD5E1] dark:border-[#383B43]',
  },
  {
    name: 'stone',
    light: 'bg-[#F2EFEA] text-[#635548] border-[#DFD8CE]',
    dark: 'dark:bg-[#282A2F] dark:text-[#D6D3D1] dark:border-[#383B43]',
  },
  {
    name: 'amber',
    light: 'bg-[#F6F2E8] text-[#7A622A] border-[#EAE1CB]',
    dark: 'dark:bg-[#282A2F] dark:text-[#E8D4A2] dark:border-[#383B43]',
  },
  {
    name: 'clay',
    light: 'bg-[#F7EFEA] text-[#8C5237] border-[#EDDACF]',
    dark: 'dark:bg-[#282A2F] dark:text-[#DEB29E] dark:border-[#383B43]',
  },
  {
    name: 'sage',
    light: 'bg-[#EEF2EB] text-[#4F6348] border-[#D6DFD1]',
    dark: 'dark:bg-[#282A2F] dark:text-[#BAC8B6] dark:border-[#383B43]',
  },
  {
    name: 'neutral',
    light: 'bg-[#EFEFEA] text-[#55584F] border-[#DCDDD4]',
    dark: 'dark:bg-[#282A2F] dark:text-[#A2A5AC] dark:border-[#383B43]',
  },
];

export function getTagColorClasses(tagName: string): string {
  if (!tagName) {
    return `${TAG_PALETTE[0].light} ${TAG_PALETTE[0].dark}`;
  }
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = (hash << 5) - hash + tagName.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % TAG_PALETTE.length;
  const item = TAG_PALETTE[index];
  return `${item.light} ${item.dark} border`;
}
