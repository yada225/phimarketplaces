import { useParams, Navigate } from "react-router-dom";
import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { productImages } from "@/lib/productImages";
import { getProductPrice } from "@/lib/pricing";
import { useCountry } from "@/hooks/use-country";
import CountrySelector from "@/components/CountrySelector";

const productKeys = [
  "completeDetox", "ovita", "vbh", "antica",
  "cafe", "hotChoco",
  "gelIntime", "pateDent", "savon",
  "teraFm", "tapisP",
] as const;
type ProductKey = typeof productKeys[number];

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { t } = useI18n();
  const { country } = useCountry();

  if (!productId || !productKeys.includes(productId as ProductKey)) {
    return <Navigate to=".." replace />;
  }

  const product = t.products[productId as ProductKey];
  if (typeof product !== "object" || !("name" in product)) {
    return <Navigate to=".." replace />;
  }

  const price = getProductPrice(productId, country);

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-end mb-4">
          <CountrySelector />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="rounded-xl overflow-hidden bg-muted flex items-center justify-center">
              <img src={productImages[productId]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">{product.name}</h1>
              <p className="text-muted-foreground mt-3">{product.description}</p>
              <div className="flex items-center gap-3 mt-5">
                <span className="text-2xl font-bold text-primary">{price.primary}</span>
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">{product.bv}</span>
              </div>
              {price.secondary && (
                <p className="text-sm text-muted-foreground mt-1">{price.secondary}</p>
              )}
              <ul className="mt-6 space-y-3">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <span className="w-6 h-6 rounded-full orange-gradient flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              {product.keyIngredients && (
                <div className="mt-6 p-4 rounded-lg bg-accent">
                  <h3 className="text-sm font-heading font-semibold text-accent-foreground mb-1">
                    {t.products.keyIngredientsLabel}
                  </h3>
                  <p className="text-sm text-muted-foreground">{product.keyIngredients}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductDetail;
