import { useI18n } from "@/i18n";
import { useCart } from "@/hooks/use-cart";
import { useCountry } from "@/hooks/use-country";
import { motion } from "framer-motion";
import { Crown, Star, Package, TrendingUp } from "lucide-react";
import { KITS } from "@/lib/kits";
import { formatFCFA, formatNGN, formatKitPrice, getKitPrice } from "@/lib/pricing";
import CountrySelector from "@/components/CountrySelector";

const Kits = () => {
  const { lang, t } = useI18n();
  const { addItem } = useCart();
  const { country } = useCountry();

  const productName = (key: string): string => {
    const p = t.products[key as keyof typeof t.products];
    return typeof p === "object" && "name" in p ? p.name : key;
  };

  const fmtPrice = (amount: number) => {
    if (country === "NG") return formatNGN(amount);
    return formatFCFA(amount);
  };

  return (
    <section className="section-padding">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-heading font-bold text-foreground">{t.kits.title}</h1>
          <p className="mt-3 text-muted-foreground">{t.kits.subtitle}</p>
        </div>

        <div className="flex justify-center mb-8">
          <CountrySelector />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {KITS.map((kit, i) => {
            const kitPrice = getKitPrice(kit.key, country);
            return (
              <motion.div
                key={kit.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-xl border p-4 sm:p-6 flex flex-col ${
                  kit.recommended
                    ? "border-primary bg-accent shadow-lg scale-[1.02]"
                    : "border-border bg-card"
                }`}
              >
                {kit.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full orange-gradient text-xs font-semibold text-primary-foreground flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {t.kits.mostPopular}
                  </div>
                )}

                <h3 className="text-lg sm:text-xl font-heading font-bold text-foreground flex items-center gap-2">
                  {kit.key === "king" && <Crown className="w-5 h-5 text-primary" />}
                  {kit.nameKey}
                </h3>

                {/* Membership price */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center bg-foreground text-background text-sm sm:text-lg font-bold rounded-full px-3 sm:px-4 py-1.5">
                    {formatKitPrice(kit.key, country)}
                  </span>
                </div>

                {/* Resale value */}
                <p className="text-sm mt-2">
                  <span className="text-muted-foreground">{lang === "fr" ? "Valeur revente" : "Resale value"}: </span>
                  <span className="font-bold text-destructive">{fmtPrice(kit.resaleValue)}</span>
                </p>

                {/* Contents */}
                <div className="mt-4 space-y-1.5 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {lang === "fr" ? "Contenu" : "Contents"}
                  </p>
                  {kit.contents.map((item) => (
                    <p key={item.productKey} className="text-sm text-foreground">
                      {item.quantity}x {productName(item.productKey)}
                    </p>
                  ))}
                </div>

                {/* BV / PV / Seat */}
                <div className="mt-4 grid grid-cols-3 gap-1 text-center">
                  <div className="bg-muted rounded-md py-1.5 px-1">
                    <p className="text-xs text-muted-foreground">BV</p>
                    <p className="text-sm font-bold text-foreground">{kit.bv}</p>
                  </div>
                  <div className="bg-muted rounded-md py-1.5 px-1">
                    <p className="text-xs text-muted-foreground">PV</p>
                    <p className="text-sm font-bold text-foreground">{kit.pv}</p>
                  </div>
                  <div className="bg-muted rounded-md py-1.5 px-1">
                    <p className="text-xs text-muted-foreground">Seat</p>
                    <p className="text-sm font-bold text-foreground">{formatFCFA(kit.seatKit).replace(' FCFA', '')}</p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    addItem({
                      id: `kit-${kit.key}`,
                      type: "kit",
                      name: `Kit ${kit.nameKey}`,
                      unitPrice: kitPrice,
                      bv: `${kit.bv} BV`,
                    })
                  }
                  className={`mt-5 w-full py-2.5 rounded-lg font-semibold text-sm transition-opacity ${
                    kit.recommended
                      ? "orange-gradient text-primary-foreground hover:opacity-90"
                      : "bg-secondary text-secondary-foreground hover:opacity-80"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  {t.kits.selectKit}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Kits;
