import { useParams, Navigate } from "react-router-dom";
import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { productImages } from "@/lib/productImages";

const productKeys = ["completeDetox", "ovita", "vbh"] as const;
type ProductKey = typeof productKeys[number];

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { t } = useI18n();

  if (!productId || !productKeys.includes(productId as ProductKey)) {
    return <Navigate to=".." replace />;
  }

  const product = t.products[productId as ProductKey];

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="rounded-xl overflow-hidden">
              <img src={productImages[productId as keyof typeof productImages]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">{product.name}</h1>
              <p className="text-muted-foreground mt-3">{product.description}</p>
              <div className="flex items-center gap-3 mt-5">
                <span className="text-2xl font-bold text-primary">{product.price}</span>
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">{product.bv}</span>
              </div>
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
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductDetail;
