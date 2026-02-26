import { useParams, Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Home } from "lucide-react";

const OrderConfirmation = () => {
  const { lang } = useI18n();
  const { orderRef } = useParams<{ orderRef: string }>();
  const isFr = lang === "fr";

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-xl text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 rounded-full orange-gradient flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {isFr ? "Commande confirmée !" : "Order Confirmed!"}
          </h1>
          <p className="text-muted-foreground mt-3">
            {isFr
              ? "Votre commande a été enregistrée avec succès. Un conseiller vous contactera pour le suivi."
              : "Your order has been successfully recorded. An advisor will contact you for follow-up."}
          </p>
          <div className="mt-6 p-4 rounded-lg bg-accent inline-block">
            <p className="text-sm text-muted-foreground">{isFr ? "Référence de commande" : "Order Reference"}</p>
            <p className="text-xl font-heading font-bold text-primary">{orderRef}</p>
          </div>
          <div className="flex gap-4 justify-center mt-8">
            <Link
              to={`/${lang}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-80 transition-opacity"
            >
              <Home className="w-4 h-4" />
              {isFr ? "Accueil" : "Home"}
            </Link>
            <Link
              to={`/${lang}/products`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg orange-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {isFr ? "Continuer les achats" : "Continue Shopping"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OrderConfirmation;
