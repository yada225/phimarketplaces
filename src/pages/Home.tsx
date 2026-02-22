import { useI18n } from "@/i18n";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, TrendingUp, Globe, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6 } }),
};

const Home = () => {
  const { lang, t } = useI18n();

  const missionCards = [
    { icon: Heart, title: t.mission.card1Title, desc: t.mission.card1Desc },
    { icon: TrendingUp, title: t.mission.card2Title, desc: t.mission.card2Desc },
    { icon: Globe, title: t.mission.card3Title, desc: t.mission.card3Desc },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="PHI Health supplements" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-gradient opacity-85" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.h1
              custom={0}
              variants={fadeUp}
              className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-primary-foreground leading-tight"
            >
              {t.hero.title}
              <span className="block text-gradient">{t.hero.subtitle}</span>
            </motion.h1>
            <motion.p
              custom={1}
              variants={fadeUp}
              className="mt-6 text-lg text-primary-foreground/80 max-w-lg"
            >
              {t.hero.description}
            </motion.p>
            <motion.div custom={2} variants={fadeUp} className="flex flex-wrap gap-4 mt-8">
              <Link
                to={`/${lang}/kits`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg orange-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                {t.hero.joinCta}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={`/${lang}/compensation`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-primary-foreground/30 text-primary-foreground font-semibold hover:bg-primary-foreground/10 transition-colors"
              >
                {t.hero.partnerCta}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-cream">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{t.mission.title}</h2>
            <p className="mt-4 text-muted-foreground">{t.mission.description}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {missionCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg orange-gradient flex items-center justify-center mb-4">
                  <card.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products preview */}
      <section className="section-padding">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{t.products.title}</h2>
          <p className="mt-3 text-muted-foreground mb-10">{t.products.subtitle}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {(["completeDetox", "ovita", "vbh"] as const).map((key, i) => {
              const product = t.products[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border bg-card p-6 text-left hover:shadow-lg transition-shadow"
                >
                  <div className="w-full h-40 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <span className="text-2xl font-heading font-bold text-gradient">{product.name}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-foreground">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{product.shortDesc}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-semibold text-primary">{product.price}</span>
                    <Link
                      to={`/${lang}/products/${key}`}
                      className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {t.products.viewDetails}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
