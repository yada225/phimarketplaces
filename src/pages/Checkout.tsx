import { useI18n } from "@/i18n";
import { useCart } from "@/hooks/use-cart";
import { useCountry } from "@/hooks/use-country";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatFCFA } from "@/lib/pricing";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { CreditCard, Truck } from "lucide-react";
import CountrySelector from "@/components/CountrySelector";

const generateRef = () => "PHI-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

const Checkout = () => {
  const { lang } = useI18n();
  const { items, total, clearCart } = useCart();
  const { country } = useCountry();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFr = lang === "fr";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    navigate(`/${lang}/cart`);
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError(isFr ? "Veuillez remplir les champs obligatoires" : "Please fill in required fields");
      return;
    }
    setLoading(true);
    setError("");

    const orderRef = generateRef();
    const currencyLabel = country === "CIV" ? "FCFA" : country === "NG" ? "FCFA" : "FCFA";

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_ref: orderRef,
        user_id: user?.id || null,
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        customer_phone: form.phone.trim() || null,
        delivery_address: form.address.trim() || null,
        city: form.city.trim() || null,
        country,
        currency_label: currencyLabel,
        subtotal: total,
        total,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      setError(orderErr?.message || "Error creating order");
      setLoading(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      item_type: item.type,
      item_key: item.id,
      item_name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);

    if (itemsErr) {
      setError(itemsErr.message);
      setLoading(false);
      return;
    }

    clearCart();
    navigate(`/${lang}/order-confirmation/${orderRef}`);
  };

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
          {isFr ? "Finaliser la commande" : "Checkout"}
        </h1>
        <div className="flex justify-end mb-6">
          <CountrySelector />
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-3 space-y-4"
          >
            <div className="p-5 rounded-xl border border-border bg-card space-y-4">
              <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                {isFr ? "Informations de livraison" : "Delivery Information"}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">{isFr ? "Nom complet *" : "Full name *"}</label>
                  <input name="name" required value={form.name} onChange={handleChange}
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email *</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange}
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">{isFr ? "Téléphone" : "Phone"}</label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">{isFr ? "Ville" : "City"}</label>
                  <input name="city" value={form.city} onChange={handleChange}
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{isFr ? "Adresse de livraison" : "Delivery address"}</label>
                <input name="address" value={form.address} onChange={handleChange}
                  className="mt-1 w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card">
              <h2 className="font-heading font-semibold text-foreground flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-primary" />
                {isFr ? "Paiement" : "Payment"}
              </h2>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {isFr
                  ? "💳 L'intégration de paiement (Stripe/Paystack) sera bientôt disponible. Pour l'instant, votre commande sera enregistrée et un conseiller vous contactera."
                  : "💳 Payment integration (Stripe/Paystack) coming soon. For now, your order will be recorded and an advisor will contact you."}
              </p>
            </div>

            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg orange-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading
                ? (isFr ? "Traitement..." : "Processing...")
                : (isFr ? "Confirmer la commande" : "Confirm Order")}
            </button>
          </motion.form>

          {/* Order summary */}
          <div className="md:col-span-2">
            <div className="p-5 rounded-xl border border-border bg-card sticky top-24">
              <h2 className="font-heading font-semibold text-foreground mb-4">
                {isFr ? "Résumé" : "Summary"}
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                    </span>
                    <span className="font-medium text-foreground">{formatFCFA(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between">
                <span className="font-heading font-bold text-foreground">{isFr ? "Total" : "Total"}</span>
                <span className="text-xl font-bold text-primary">{formatFCFA(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
