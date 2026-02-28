import { useI18n } from "@/i18n";
import { useCart } from "@/hooks/use-cart";
import { useCountry } from "@/hooks/use-country";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatFCFA } from "@/lib/pricing";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { CreditCard, Truck, CheckCircle, MessageCircle, Upload, Loader2, ShieldCheck } from "lucide-react";
import CountrySelector from "@/components/CountrySelector";
import { OFFICIAL_WHATSAPP } from "@/components/WhatsAppButton";

const generateRef = () => "PHI-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

function buildWhatsAppMessage(orderRef: string, form: { name: string; email: string; phone: string; city: string; address: string }, items: { name: string; quantity: number; unitPrice: number }[], total: number, country: string) {
  let msg = `🛒 *Nouvelle commande PHI*\n\n`;
  msg += `📋 Réf: ${orderRef}\n`;
  msg += `👤 ${form.name}\n📧 ${form.email}\n📞 ${form.phone || "—"}\n🌍 ${country}\n🏙️ ${form.city || "—"}\n📍 ${form.address || "—"}\n\n`;
  msg += `*Articles:*\n`;
  items.forEach(i => { msg += `• ${i.name} x${i.quantity} — ${formatFCFA(i.unitPrice * i.quantity)}\n`; });
  msg += `\n💰 *Total: ${formatFCFA(total)}*\n\n`;
  msg += `Merci de confirmer cette commande.`;
  return encodeURIComponent(msg);
}

const Checkout = () => {
  const { lang } = useI18n();
  const { items, total, clearCart } = useCart();
  const { country } = useCountry();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFr = lang === "fr";

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{ ref: string; id: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);

  if (items.length === 0 && !orderSuccess) {
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
    const currencyLabel = "FCFA";

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
        status: "pending_payment",
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

    setOrderSuccess({ ref: orderRef, id: order.id });
    clearCart();
    setLoading(false);
  };

  const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !orderSuccess) return;
    setUploading(true);

    const file = e.target.files[0];
    const path = `orders/${orderSuccess.id}/${Date.now()}-${file.name}`;

    const { error: uploadErr } = await supabase.storage.from("receipts").upload(path, file);
    if (uploadErr) {
      setError(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(path);

    await supabase.from("payment_receipts").insert({
      order_id: orderSuccess.id,
      user_id: user?.id || null,
      file_url: urlData.publicUrl,
      status: "pending",
    });

    await supabase.from("orders").update({ status: "receipt_uploaded" }).eq("id", orderSuccess.id);

    setReceiptUploaded(true);
    setUploading(false);
  };

  const whatsappUrl = orderSuccess
    ? `https://wa.me/${OFFICIAL_WHATSAPP}?text=${buildWhatsAppMessage(orderSuccess.ref, form, items.length > 0 ? items : [], total, country)}`
    : "";

  // ===== SUCCESS SCREEN =====
  if (orderSuccess) {
    return (
      <section className="section-padding">
        <div className="container mx-auto max-w-lg text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 rounded-xl border border-border bg-card">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              {isFr ? "Commande enregistrée !" : "Order Recorded!"}
            </h2>
            <div className="my-4 p-3 rounded-lg bg-accent inline-block">
              <p className="text-xs text-muted-foreground">{isFr ? "Référence" : "Reference"}</p>
              <p className="text-xl font-heading font-bold text-primary">{orderSuccess.ref}</p>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {isFr
                ? "Envoyez votre commande sur WhatsApp et téléchargez votre preuve de paiement ci-dessous."
                : "Send your order on WhatsApp and upload your payment proof below."}
            </p>

            {/* WhatsApp button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#25D366] text-white font-semibold hover:opacity-90 transition-opacity mb-4"
            >
              <MessageCircle className="w-5 h-5" />
              {isFr ? "Envoyer le panier sur WhatsApp" : "Send cart on WhatsApp"}
            </a>

            {/* Receipt upload */}
            {!receiptUploaded ? (
              <label className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-primary text-primary font-semibold cursor-pointer hover:bg-primary/5 transition-colors">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {uploading
                  ? (isFr ? "Envoi en cours..." : "Uploading...")
                  : (isFr ? "Télécharger la preuve de paiement" : "Upload payment proof")}
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleUploadReceipt} disabled={uploading} />
              </label>
            ) : (
              <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {isFr ? "Reçu envoyé ! Un admin vérifiera votre paiement." : "Receipt uploaded! Admin will verify your payment."}
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              {isFr ? "Paiement sécurisé vérifié par Admin" : "Secure payment verified by Admin"}
            </div>

            {error && <p className="text-sm text-destructive mt-3">{error}</p>}
          </motion.div>
        </div>
      </section>
    );
  }

  // ===== CHECKOUT FORM =====
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
                  ? "💳 Après validation, envoyez votre commande sur WhatsApp et téléchargez votre preuve de paiement. Un administrateur vérifiera et confirmera."
                  : "💳 After submitting, send your order on WhatsApp and upload your payment proof. An administrator will verify and confirm."}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              {isFr ? "Paiement sécurisé vérifié par Admin" : "Secure payment verified by Admin"}
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
                <span className="font-heading font-bold text-foreground">Total</span>
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
