export type MerchGroupKey =
  | "PRINT"
  | "STICKER"
  | "SMALL ACCESSORY"
  | "DESK & STATIONERY"
  | "APPEARAL & WEARABLE"
  | "INTERACTIVE";

export type MerchRow =
  | { type: "header"; label: MerchGroupKey }
  | { type: "item"; label: string; group: MerchGroupKey };

export const MERCH_ROWS: MerchRow[] = [
  { type: "header", label: "PRINT" },
  { type: "item", group: "PRINT", label: "Lenticular" },
  { type: "item", group: "PRINT", label: "Photocard" },
  { type: "item", group: "PRINT", label: "Print" },
  { type: "item", group: "PRINT", label: "Risograph" },
  { type: "item", group: "PRINT", label: "Shikishi" },
  { type: "item", group: "PRINT", label: "Tarot" },
  { type: "item", group: "PRINT", label: "Zine" },
  { type: "item", group: "PRINT", label: "Multi Print - Low Accuracy" },

  { type: "header", label: "STICKER" },
  { type: "item", group: "STICKER", label: "Sticker Binder" },
  { type: "item", group: "STICKER", label: "Sticker Sheet" },
  { type: "item", group: "STICKER", label: "Vinyl Sticker" },
  { type: "item", group: "STICKER", label: "Multi Sticker - Low Accuracy" },

  { type: "header", label: "SMALL ACCESSORY" },
  { type: "item", group: "SMALL ACCESSORY", label: "Acrylic Charm" },
  { type: "item", group: "SMALL ACCESSORY", label: "Acrylic Pin" },
  { type: "item", group: "SMALL ACCESSORY", label: "Button" },
  { type: "item", group: "SMALL ACCESSORY", label: "Enamel Pin" },
  { type: "item", group: "SMALL ACCESSORY", label: "Phone Strap" },
  { type: "item", group: "SMALL ACCESSORY", label: "Photocard Holder" },
  { type: "item", group: "SMALL ACCESSORY", label: "Wooden Pin" },
  { type: "item", group: "SMALL ACCESSORY", label: "Multi Charm - Low Accuracy" },
  { type: "item", group: "SMALL ACCESSORY", label: "Multi Pin - Low Accuracy" },

  { type: "header", label: "DESK & STATIONERY" },
  { type: "item", group: "DESK & STATIONERY", label: "Album" },
  { type: "item", group: "DESK & STATIONERY", label: "Bookmark" },
  { type: "item", group: "DESK & STATIONERY", label: "Candle" },
  { type: "item", group: "DESK & STATIONERY", label: "Clip" },
  { type: "item", group: "DESK & STATIONERY", label: "Coaster" },
  { type: "item", group: "DESK & STATIONERY", label: "Diorama Standee" },
  { type: "item", group: "DESK & STATIONERY", label: "Glass Bottle" },
  { type: "item", group: "DESK & STATIONERY", label: "Key Cap" },
  { type: "item", group: "DESK & STATIONERY", label: "Magnet" },
  { type: "item", group: "DESK & STATIONERY", label: "Microfiber Cloth" },
  { type: "item", group: "DESK & STATIONERY", label: "Mouse Pad" },
  { type: "item", group: "DESK & STATIONERY", label: "Note Pad" },
  { type: "item", group: "DESK & STATIONERY", label: "Notebook" },
  { type: "item", group: "DESK & STATIONERY", label: "Pencil Case" },
  { type: "item", group: "DESK & STATIONERY", label: "Stamp" },
  { type: "item", group: "DESK & STATIONERY", label: "Standee" },
  { type: "item", group: "DESK & STATIONERY", label: "Table Cup" },
  { type: "item", group: "DESK & STATIONERY", label: "Washi Tape" },

  { type: "header", label: "APPEARAL & WEARABLE" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Bandana" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Beanie" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Blanket" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Bracelet" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Bucket Hat" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Cap" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Crewneck" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Earring" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Hair Clip" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Hoodie" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Ita Bag" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Leather Bag" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Nail Decal" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Necklace" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Phone Grip" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Plush Charm" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Plushie" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Pouch" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Shirt" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Sock" },
  { type: "item", group: "APPEARAL & WEARABLE", label: "Tote Bag" },

  { type: "header", label: "INTERACTIVE" },
  { type: "item", group: "INTERACTIVE", label: "Build Your Own" },
  { type: "item", group: "INTERACTIVE", label: "Gachapon" },
  { type: "item", group: "INTERACTIVE", label: "Mystery Bag" },
  { type: "item", group: "INTERACTIVE", label: "Stamp Rally" },
];

export const MERCH_COMMON_DEFAULTS = [
  "Bookmark",
  "Wooden Pin",
  "Multi Sticker",
  "Standee",
  "Acrylic Charm",
  "Print",
  "Photocard",
  "Stamp Rally",
] as const;

export function normalizeMerchLabel(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

export function keyifyMerchLabel(s: string) {
  return normalizeMerchLabel(s).toLowerCase();
}

export function splitLowAccuracy(label: string) {
  const re = /\s*-\s*low accuracy\s*$/i;
  const isLow = re.test(label);
  const base = isLow
    ? normalizeMerchLabel(label.replace(re, ""))
    : normalizeMerchLabel(label);
  return { base, isLow };
}
