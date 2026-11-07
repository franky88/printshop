// Change these to your shop details.
export type PaymentMethod = {
  id: string;
  label: string;
  accountName: string;
  accountNumber: string;
  bank?: string;
};

export const shop = {
  name: "Smart Design & Media Solutions",
  orderPrefix: "PS",
  deliveryFee: 100, // flat fee in PHP, placeholder
  payment: {
    // Replace these placeholders with your real accounts before going live.
    methods: [
      {
        id: "gcash",
        label: "GCash",
        accountName: "Account Name",
        accountNumber: "09XX XXX XXXX",
      },
      {
        id: "maya",
        label: "Maya",
        accountName: "Account Name",
        accountNumber: "09XX XXX XXXX",
      },
      {
        id: "bank",
        label: "Bank transfer",
        bank: "Bank name",
        accountName: "Account Name",
        accountNumber: "0000 0000 0000",
      },
    ] as PaymentMethod[],
  },
};
