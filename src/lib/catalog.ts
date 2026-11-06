// Starting products and placeholder prices in PHP. They are copied into the database the first
// time the site loads; after that, edit them in the admin (Products), not here.

export type Choice = { id: string; label: string; mult?: number; add?: number };
export type OptionDef = { id: string; label: string; choices: Choice[] };
export type Tier = { min: number; mult: number };

export type Product = {
  id: string;
  name: string;
  summary: string;
  unit: string;
  fulfillment: "in-house" | "outsourced";
  base: number; // price per unit before options and discounts
  setupFee: number;
  minOrder: number;
  qty: { min: number; step: number; presets: number[] };
  tiers: Tier[]; // quantity discounts; mult applies to the unit price
  options: OptionDef[];
};

const sides: OptionDef = {
  id: "sides",
  label: "Printed sides",
  choices: [
    { id: "single", label: "One side" },
    { id: "double", label: "Both sides", mult: 1.7 },
  ],
};

const laminate: OptionDef = {
  id: "laminate",
  label: "Lamination",
  choices: [
    { id: "none", label: "None" },
    { id: "yes", label: "Laminated", add: 10 },
  ],
};

export const products: Product[] = [
  {
    id: "documents",
    name: "Documents",
    summary: "Reports, school work, resumes",
    unit: "page",
    fulfillment: "in-house",
    base: 3,
    setupFee: 0,
    minOrder: 10,
    qty: { min: 1, step: 1, presets: [1, 10, 50, 100] },
    tiers: [{ min: 1, mult: 1 }, { min: 50, mult: 0.9 }, { min: 200, mult: 0.8 }],
    options: [
      {
        id: "size",
        label: "Paper size",
        choices: [{ id: "short", label: "Short (8.5×11)" }, { id: "a4", label: "A4" }],
      },
      {
        id: "color",
        label: "Colour",
        choices: [{ id: "bw", label: "Black & white" }, { id: "color", label: "Full colour", mult: 4 }],
      },
    ],
  },
  {
    id: "photos",
    name: "Photo prints",
    summary: "4R, 5R and A4 on photo paper",
    unit: "photo",
    fulfillment: "in-house",
    base: 8,
    setupFee: 0,
    minOrder: 20,
    qty: { min: 1, step: 1, presets: [1, 5, 10, 20] },
    tiers: [{ min: 1, mult: 1 }, { min: 20, mult: 0.92 }, { min: 50, mult: 0.85 }],
    options: [
      {
        id: "size",
        label: "Size",
        choices: [
          { id: "4r", label: "4R" },
          { id: "5r", label: "5R", mult: 1.75 },
          { id: "a4", label: "A4", mult: 6 },
        ],
      },
      {
        id: "paper",
        label: "Paper",
        choices: [{ id: "glossy", label: "Glossy" }, { id: "matte", label: "Matte", add: 2 }],
      },
    ],
  },
  {
    id: "id-pictures",
    name: "ID pictures",
    summary: "Printed sets, ready to cut",
    unit: "set",
    fulfillment: "in-house",
    base: 40,
    setupFee: 0,
    minOrder: 40,
    qty: { min: 1, step: 1, presets: [1, 2, 3, 5] },
    tiers: [{ min: 1, mult: 1 }, { min: 5, mult: 0.9 }],
    options: [
      {
        id: "size",
        label: "Size",
        choices: [
          { id: "1x1", label: "1×1 (8 pcs)" },
          { id: "2x2", label: "2×2 (6 pcs)", mult: 1.1 },
          { id: "passport", label: "Passport (4 pcs)", mult: 1.2 },
        ],
      },
    ],
  },
  {
    id: "business-cards",
    name: "Business cards",
    summary: "Card stock, trimmed to size",
    unit: "card",
    fulfillment: "in-house",
    base: 3,
    setupFee: 50,
    minOrder: 200,
    qty: { min: 50, step: 50, presets: [50, 100, 200, 500] },
    tiers: [{ min: 1, mult: 1 }, { min: 200, mult: 0.85 }, { min: 500, mult: 0.75 }],
    options: [
      sides,
      {
        id: "finish",
        label: "Finish",
        choices: [{ id: "matte", label: "Matte" }, { id: "glossy", label: "Glossy", mult: 1.1 }],
      },
    ],
  },
  {
    id: "flyers",
    name: "Flyers & leaflets",
    summary: "A5 or A4, for promos and events",
    unit: "flyer",
    fulfillment: "in-house",
    base: 6,
    setupFee: 0,
    minOrder: 100,
    qty: { min: 10, step: 10, presets: [20, 50, 100, 200] },
    tiers: [{ min: 1, mult: 1 }, { min: 100, mult: 0.85 }, { min: 300, mult: 0.75 }],
    options: [
      {
        id: "size",
        label: "Size",
        choices: [{ id: "a5", label: "A5" }, { id: "a4", label: "A4", mult: 1.9 }],
      },
      sides,
      laminate,
    ],
  },
  {
    id: "invitations",
    name: "Invitations & certificates",
    summary: "Heavier paper for keepsakes",
    unit: "piece",
    fulfillment: "in-house",
    base: 15,
    setupFee: 50,
    minOrder: 100,
    qty: { min: 5, step: 5, presets: [10, 25, 50, 100] },
    tiers: [{ min: 1, mult: 1 }, { min: 50, mult: 0.9 }],
    options: [
      {
        id: "size",
        label: "Size",
        choices: [{ id: "a5", label: "A5" }, { id: "a4", label: "A4", mult: 1.9 }],
      },
      {
        id: "paper",
        label: "Paper",
        choices: [{ id: "matte", label: "Matte card" }, { id: "pearl", label: "Pearl card", mult: 1.4 }],
      },
    ],
  },
  {
    id: "stickers",
    name: "Stickers & labels",
    summary: "Printed on A4 sticker sheets",
    unit: "A4 sheet",
    fulfillment: "in-house",
    base: 35,
    setupFee: 0,
    minOrder: 50,
    qty: { min: 1, step: 1, presets: [1, 5, 10, 20] },
    tiers: [{ min: 1, mult: 1 }, { min: 10, mult: 0.92 }, { min: 30, mult: 0.85 }],
    options: [
      {
        id: "material",
        label: "Material",
        choices: [{ id: "paper", label: "Paper" }, { id: "vinyl", label: "Vinyl", mult: 1.6 }],
      },
      laminate,
      {
        id: "cut",
        label: "Cutting",
        choices: [{ id: "sheet", label: "Uncut sheet" }, { id: "shape", label: "Cut to shape", add: 15 }],
      },
    ],
  },
];
