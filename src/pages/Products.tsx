import { useI18n } from "@/i18n";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Products = () => {
  const { lang, t } = useI18n();
  const productKeys = ["completeDetox", "ovita", "vbh"] as const;

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">{t.products.title}</h1>
          <p className="mt-3 text-muted-foreground">{t.products.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {productKeys.map((key, i) => {
            const p = t.products[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-muted flex items-center justify-center">
                  <span className="text-3xl font-heading font-bold text-gradient">{p.name}</span>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-heading font-bold text-foreground">{p.name}</h2>
                  <p className="text-sm text-muted-foreground mt-2">{p.shortDesc}</p>
                  <ul className="mt-4 space-y-1">
                    {p.benefits.map((b, j) => (
                      <li key={j} className="text-sm text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <div>
                      <span className="text-lg font-bold text-primary">{p.price}</span>
                      <span className="text-xs text-muted-foreground ml-2">{p.bv}</span>
                    </div>
                    <Link
                      to={`/${lang}/products/${key}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {t.products.viewDetails}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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
