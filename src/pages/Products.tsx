import { useI18n } from "@/i18n";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { productImages } from "@/lib/productImages";
import { getProductPrice, getRawPrice } from "@/lib/pricing";
import { useCountry } from "@/hooks/use-country";
import { useCart } from "@/hooks/use-cart";
import CountrySelector from "@/components/CountrySelector";
import { useState } from "react";

const ALL_PRODUCT_KEYS = [
  "completeDetox", "ovita", "vbh", "antica",
  "cafe", "hotChoco",
  "gelIntime", "pateDent", "savon",
  "teraFm", "tapisP",
] as const;

type ProductKey = typeof ALL_PRODUCT_KEYS[number];

const CATEGORY_KEYS = ["supplements", "beverages", "bodycare", "equipment"] as const;
type CategoryKey = typeof CATEGORY_KEYS[number];

const Products = () => {
  const { lang, t } = useI18n();
  const { country } = useCountry();
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<CategoryKey | "all">("all");

  const filteredKeys = activeCategory === "all"
    ? ALL_PRODUCT_KEYS
    : ALL_PRODUCT_KEYS.filter((key) => {
        const p = t.products[key as keyof typeof t.products];
        return typeof p === "object" && "category" in p && p.category === activeCategory;
      });

  return (
    <section className="section-padding">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-heading font-bold text-foreground">{t.products.title}</h1>
          <p className="mt-3 text-muted-foreground">{t.products.subtitle}</p>
        </div>

        <div className="flex justify-center mb-6">
          <CountrySelector />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {lang === "fr" ? "Tous" : "All"}
          </button>
          {CATEGORY_KEYS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.products.categories[cat]}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {(filteredKeys as readonly ProductKey[]).map((key, i) => {
            const p = t.products[key];
            if (typeof p !== "object" || !("name" in p)) return null;
            const price = getProductPrice(key, country);
            const rawPrice = getRawPrice(key, country);
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-44 sm:h-52 overflow-hidden bg-muted flex items-center justify-center">
                  <img src={productImages[key]} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                      {t.products.categories[p.category as CategoryKey]}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-heading font-bold text-foreground">{p.name}</h2>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.shortDesc}</p>
                  <div className="flex items-center justify-between mt-4 sm:mt-6 pt-4 border-t border-border gap-2">
                    <div className="min-w-0">
                      <span className="text-base sm:text-lg font-bold text-primary">{price.primary}</span>
                      {price.secondary && (
                        <span className="block text-xs text-muted-foreground">{price.secondary}</span>
                      )}
                      <span className="text-xs text-muted-foreground ml-1">{p.bv}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => addItem({
                          id: key,
                          type: "product",
                          name: p.name,
                          unitPrice: rawPrice,
                          bv: p.bv,
                        })}
                        className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        title={lang === "fr" ? "Ajouter au panier" : "Add to cart"}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/${lang}/products/${key}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        {t.products.viewDetails}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Products;
