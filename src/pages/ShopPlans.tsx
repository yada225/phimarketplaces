import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Star, Lock } from "lucide-react";

const SHOP_PLANS = [
  {
    key: "starter",
    price: "$10",
    period: { fr: "/mois", en: "/month" },
    features: {
      fr: ["Page boutique personnalisée", "Lien unique de parrainage", "Catalogue PHI complet", "Support email"],
      en: ["Personalized shop page", "Unique referral link", "Full PHI catalog", "Email support"],
    },
  },
  {
    key: "pro",
    price: "$100",
    period: { fr: "/an", en: "/year" },
    features: {
      fr: ["Toutes les fonctionnalités Starter", "Statistiques avancées", "Support prioritaire", "Nom de boutique personnalisé"],
      en: ["All Starter features", "Advanced analytics", "Priority support", "Custom shop name"],
    },
  },
  {
    key: "elite",
    price: "$159",
    period: { fr: " à vie", en: " lifetime" },
    features: {
      fr: ["Toutes les fonctionnalités Pro", "Boutique premium illimitée", "CRM intégré", "Formation exclusive", "Manager dédié"],
      en: ["All Pro features", "Unlimited premium shop", "Integrated CRM", "Exclusive training", "Dedicated manager"],
    },
  },
];

const ShopPlans = () => {
  const { lang } = useI18n();
  const { user } = useAuth();
  const isFr = lang === "fr";

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
            {isFr ? "Boutiques Personnelles" : "Personal Shops"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {isFr
              ? "Choisissez un abonnement pour créer votre boutique en ligne"
              : "Choose a subscription to create your online shop"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {SHOP_PLANS.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`rounded-xl border p-6 flex flex-col ${
                i === 2 ? "border-primary bg-accent shadow-lg" : "border-border bg-card"
              }`}
            >
              {i === 2 && (
                <div className="flex items-center gap-1 text-xs font-semibold text-primary mb-2">
                  <Star className="w-3 h-3" /> {isFr ? "Meilleure valeur" : "Best Value"}
                </div>
              )}
              <h3 className="text-xl font-heading font-bold text-foreground capitalize">{plan.key}</h3>
              <p className="text-3xl font-bold text-primary mt-2">
                {plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.period[lang]}</span>
              </p>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features[lang].map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              {user ? (
                <button
                  className={`mt-6 w-full py-2.5 rounded-lg font-semibold text-sm transition-opacity ${
                    i === 2
                      ? "orange-gradient text-primary-foreground hover:opacity-90"
                      : "bg-secondary text-secondary-foreground hover:opacity-80"
                  }`}
                >
                  {isFr ? "Choisir ce plan" : "Choose this plan"}
                </button>
              ) : (
                <Link
                  to={`/${lang}/auth`}
                  className={`mt-6 w-full py-2.5 rounded-lg font-semibold text-sm text-center flex items-center justify-center gap-2 transition-opacity ${
                    i === 2
                      ? "orange-gradient text-primary-foreground hover:opacity-90"
                      : "bg-secondary text-secondary-foreground hover:opacity-80"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  {isFr ? "Se connecter d'abord" : "Sign in first"}
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopPlans;
