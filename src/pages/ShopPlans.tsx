import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Check, Star, Lock, Upload, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

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
  const navigate = useNavigate();
  const isFr = lang === "fr";
  const fileRef = useRef<HTMLInputElement>(null);

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChoosePlan = (planKey: string) => {
    if (!user) { navigate(`/${lang}/auth`); return; }
    setSelectedPlan(planKey);
  };

  const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user || !selectedPlan) return;
    setUploading(true);

    const file = e.target.files[0];
    const path = `${user.id}/${Date.now()}-${file.name}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("receipts")
      .upload(path, file);

    if (uploadErr) {
      alert(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(path);

    // Create shop in pending status
    const slug = `shop-${user.id.slice(0, 8)}-${Date.now().toString(36)}`;
    const { data: shopData } = await supabase.from("shops").insert({
      user_id: user.id,
      name: `${isFr ? "Ma Boutique" : "My Shop"}`,
      slug,
      status: "pending",
      is_active: false,
      plan_type: selectedPlan,
      plan_status: "pending",
    }).select("id").single();

    // Create receipt
    await supabase.from("receipts").insert({
      user_id: user.id,
      shop_id: shopData?.id || null,
      receipt_type: "subscription",
      file_url: urlData.publicUrl,
      plan_type: selectedPlan,
      status: "pending",
    });

    setUploading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="section-padding">
        <div className="container mx-auto max-w-lg text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="p-8 rounded-xl border border-border bg-card">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              {isFr ? "Reçu envoyé !" : "Receipt submitted!"}
            </h2>
            <p className="text-muted-foreground">
              {isFr
                ? "Un administrateur va vérifier votre paiement et activer votre boutique. Vous recevrez un code OTP de confirmation."
                : "An administrator will verify your payment and activate your shop. You will receive a confirmation OTP code."}
            </p>
            <Button className="mt-6" onClick={() => navigate(`/${lang}/dashboard`)}>
              {isFr ? "Retour au tableau de bord" : "Back to Dashboard"}
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
            {isFr ? "Boutiques Personnelles" : "Personal Shops"}
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {isFr
              ? "Choisissez un abonnement, envoyez votre reçu de paiement, et un administrateur activera votre boutique."
              : "Choose a subscription, upload your payment receipt, and an administrator will activate your shop."}
          </p>
        </div>

        {/* Receipt upload modal */}
        {selectedPlan && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-10 p-6 rounded-xl border-2 border-primary bg-card">
            <h3 className="font-heading font-bold text-foreground mb-2">
              {isFr ? `Plan sélectionné : ${selectedPlan.toUpperCase()}` : `Selected plan: ${selectedPlan.toUpperCase()}`}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isFr
                ? "Envoyez votre preuve de paiement (capture d'écran ou photo du reçu)"
                : "Upload your proof of payment (screenshot or receipt photo)"}
            </p>
            <input type="file" ref={fileRef} className="hidden" accept="image/*,.pdf" onChange={handleUploadReceipt} />
            <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full">
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {uploading ? (isFr ? "Envoi en cours..." : "Uploading...") : (isFr ? "Envoyer le reçu" : "Upload Receipt")}
            </Button>
            <button onClick={() => setSelectedPlan(null)} className="mt-2 w-full text-sm text-muted-foreground hover:text-foreground">
              {isFr ? "Annuler" : "Cancel"}
            </button>
          </motion.div>
        )}

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
                  onClick={() => handleChoosePlan(plan.key)}
                  className={`mt-6 w-full py-2.5 rounded-lg font-semibold text-sm transition-opacity ${
                    selectedPlan === plan.key
                      ? "ring-2 ring-primary orange-gradient text-primary-foreground"
                      : i === 2
                        ? "orange-gradient text-primary-foreground hover:opacity-90"
                        : "bg-secondary text-secondary-foreground hover:opacity-80"
                  }`}
                >
                  {selectedPlan === plan.key ? (isFr ? "Sélectionné ✓" : "Selected ✓") : (isFr ? "Choisir ce plan" : "Choose this plan")}
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
