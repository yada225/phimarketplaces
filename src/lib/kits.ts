export interface KitItem {
  productKey: string;
  quantity: number;
}

export interface Kit {
  key: string;
  nameKey: string;
  membershipPrice: number;
  resaleValue: number;
  contents: KitItem[];
  bv: number;
  pv: number;
  seatKit: number;
  recommended: boolean;
}

export const KITS: Kit[] = [
  {
    key: "starter",
    nameKey: "STARTER",
    membershipPrice: 70000,
    resaleValue: 76500,
    contents: [
      { productKey: "completeDetox", quantity: 1 },
      { productKey: "ovita", quantity: 1 },
      { productKey: "vbh", quantity: 1 },
    ],
    bv: 50,
    pv: 50,
    seatKit: 200,
    recommended: false,
  },
  {
    key: "entrepreneur",
    nameKey: "ENTREPRENEUR",
    membershipPrice: 130000,
    resaleValue: 200000,
    contents: [
      { productKey: "completeDetox", quantity: 2 },
      { productKey: "ovita", quantity: 2 },
      { productKey: "vbh", quantity: 2 },
    ],
    bv: 100,
    pv: 100,
    seatKit: 500,
    recommended: false,
  },
  {
    key: "investor",
    nameKey: "INVESTOR",
    membershipPrice: 255000,
    resaleValue: 400000,
    contents: [
      { productKey: "completeDetox", quantity: 4 },
      { productKey: "ovita", quantity: 4 },
      { productKey: "vbh", quantity: 4 },
    ],
    bv: 200,
    pv: 200,
    seatKit: 1000,
    recommended: true,
  },
  {
    key: "business",
    nameKey: "BUSINESS",
    membershipPrice: 500000,
    resaleValue: 612000,
    contents: [
      { productKey: "completeDetox", quantity: 8 },
      { productKey: "ovita", quantity: 8 },
      { productKey: "vbh", quantity: 8 },
    ],
    bv: 400,
    pv: 400,
    seatKit: 2000,
    recommended: false,
  },
  {
    key: "king",
    nameKey: "KING",
    membershipPrice: 990000,
    resaleValue: 1224000,
    contents: [
      { productKey: "completeDetox", quantity: 16 },
      { productKey: "ovita", quantity: 16 },
      { productKey: "vbh", quantity: 16 },
    ],
    bv: 800,
    pv: 800,
    seatKit: 4000,
    recommended: false,
  },
];
