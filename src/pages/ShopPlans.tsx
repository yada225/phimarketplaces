import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const ShopPlans = () => {
  const { t } = useI18n();

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">{t.shops.title}</h1>
          <p className="mt-3 text-muted-foreground">{t.shops.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {t.shops.plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`rounded-xl border p-6 flex flex-col ${
                i === 1 ? "border-primary bg-accent shadow-lg" : "border-border bg-card"
              }`}
            >
              <h3 className="text-xl font-heading font-bold text-foreground">{plan.name}</h3>
              <p className="text-2xl font-bold text-primary mt-2">{plan.price}</p>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full py-2.5 rounded-lg font-semibold text-sm transition-opacity ${
                  i === 1
                    ? "orange-gradient text-primary-foreground hover:opacity-90"
                    : "bg-secondary text-secondary-foreground hover:opacity-80"
                }`}
              >
                {t.shops.subscribe}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopPlans;
