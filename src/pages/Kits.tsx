import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

const Kits = () => {
  const { t } = useI18n();

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">{t.kits.title}</h1>
          <p className="mt-3 text-muted-foreground">{t.kits.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {t.kits.items.map((kit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-xl border p-6 flex flex-col ${
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
              <h3 className="text-xl font-heading font-bold text-foreground">{kit.name}</h3>
              <p className="text-2xl font-bold text-primary mt-3">{kit.price}</p>
              <p className="text-xs text-muted-foreground mt-1">{kit.bv}</p>
              <p className="text-sm text-muted-foreground mt-4 flex-1">{kit.contents}</p>
              <button
                className={`mt-6 w-full py-2.5 rounded-lg font-semibold text-sm transition-opacity ${
                  kit.recommended
                    ? "orange-gradient text-primary-foreground hover:opacity-90"
                    : "bg-secondary text-secondary-foreground hover:opacity-80"
                }`}
              >
                {t.kits.selectKit}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Kits;
