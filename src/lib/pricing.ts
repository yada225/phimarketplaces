export type CountryCode = "NG" | "CIV" | "OTHER";

export interface ProductPricing {
  NG_PRIMARY_FCFA: number;
  NG_INFO_NGN: number;
  CIV_FCFA: number;
  OTHER_FCFA: number;
}

export const PRICING: Record<string, ProductPricing> = {
  completeDetox: { NG_PRIMARY_FCFA: 26500, NG_INFO_NGN: 71550, CIV_FCFA: 25000, OTHER_FCFA: 26500 },
  ovita: { NG_PRIMARY_FCFA: 26500, NG_INFO_NGN: 71550, CIV_FCFA: 25000, OTHER_FCFA: 26500 },
  vbh: { NG_PRIMARY_FCFA: 23500, NG_INFO_NGN: 63450, CIV_FCFA: 22000, OTHER_FCFA: 23500 },
  antica: { NG_PRIMARY_FCFA: 36500, NG_INFO_NGN: 98550, CIV_FCFA: 35000, OTHER_FCFA: 36500 },
  cafe: { NG_PRIMARY_FCFA: 21500, NG_INFO_NGN: 58050, CIV_FCFA: 21500, OTHER_FCFA: 21500 },
  hotChoco: { NG_PRIMARY_FCFA: 21500, NG_INFO_NGN: 58050, CIV_FCFA: 20000, OTHER_FCFA: 21500 },
  gelIntime: { NG_PRIMARY_FCFA: 13500, NG_INFO_NGN: 36450, CIV_FCFA: 12000, OTHER_FCFA: 13500 },
  pateDent: { NG_PRIMARY_FCFA: 6500, NG_INFO_NGN: 17550, CIV_FCFA: 5000, OTHER_FCFA: 6500 },
  savon: { NG_PRIMARY_FCFA: 8000, NG_INFO_NGN: 21600, CIV_FCFA: 6500, OTHER_FCFA: 8000 },
  teraFm: { NG_PRIMARY_FCFA: 750000, NG_INFO_NGN: 2025000, CIV_FCFA: 750000, OTHER_FCFA: 750000 },
  tapisP: { NG_PRIMARY_FCFA: 150000, NG_INFO_NGN: 405000, CIV_FCFA: 120000, OTHER_FCFA: 150000 },
};

export const NGN_PER_FCFA = 2.7;

export function formatFCFA(amount: number): string {
  return amount.toLocaleString("fr-FR") + " FCFA";
}

export function formatNGN(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG");
}

export function getProductPrice(productKey: string, country: CountryCode): { primary: string; secondary?: string } {
  const p = PRICING[productKey];
  if (!p) return { primary: "—" };

  switch (country) {
    case "NG":
      return {
        primary: formatFCFA(p.NG_PRIMARY_FCFA),
        secondary: `≈ ${formatNGN(p.NG_INFO_NGN)}`,
      };
    case "CIV":
      return { primary: formatFCFA(p.CIV_FCFA) };
    default:
      return { primary: formatFCFA(p.OTHER_FCFA) };
  }
}
