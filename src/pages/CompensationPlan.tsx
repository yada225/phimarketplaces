import { useI18n } from "@/i18n";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Award } from "lucide-react";

const CompensationPlan = () => {
  const { lang, t } = useI18n();

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-heading font-bold"
          >
            {t.compensation.title}
          </motion.h1>
          <p className="mt-3 text-primary-foreground/70 max-w-xl mx-auto">{t.compensation.subtitle}</p>
        </div>
      </section>

      {/* Levels */}
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl space-y-4">
          {t.compensation.levels.map((level, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 rounded-lg orange-gradient flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-heading font-bold text-primary-foreground">{level.percentage}</span>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">{level.title}</h3>
                <p className="text-sm text-muted-foreground">{level.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ranks */}
      <section className="section-padding bg-cream">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground text-center mb-8">
            <Award className="w-8 h-8 text-primary inline-block mr-2 -mt-1" />
            {t.compensation.ranksTitle}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.compensation.ranks.map((rank, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-xl bg-card border border-border"
              >
                <h3 className="font-heading font-bold text-primary text-lg">{rank.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{rank.requirement}</p>
                <p className="text-sm font-medium text-foreground mt-3">{rank.bonus}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to={`/${lang}/kits`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg orange-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              {t.compensation.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default CompensationPlan;
