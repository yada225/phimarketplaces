import { useI18n } from "@/i18n";
import { useCart } from "@/hooks/use-cart";
import { useCountry } from "@/hooks/use-country";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { formatFCFA, formatNGN, getProductPrice } from "@/lib/pricing";
import CountrySelector from "@/components/CountrySelector";

const Cart = () => {
  const { lang, t } = useI18n();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { country } = useCountry();

  const isFr = lang === "fr";

  if (items.length === 0) {
    return (
      <section className="section-padding">
        <div className="container mx-auto max-w-2xl text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {isFr ? "Votre panier est vide" : "Your cart is empty"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isFr ? "Explorez nos produits et kits" : "Explore our products and kits"}
          </p>
          <Link
            to={`/${lang}/products`}
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-lg orange-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            {isFr ? "Voir les produits" : "View products"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {isFr ? "Mon Panier" : "My Cart"}
          </h1>
          <CountrySelector />
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-foreground truncate">{item.name}</h3>
                <p className="text-sm text-primary font-medium">{formatFCFA(item.unitPrice)}</p>
                {item.bv && <p className="text-xs text-muted-foreground">{item.bv}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-foreground hover:bg-muted/80"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold text-foreground">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-foreground hover:bg-muted/80"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="font-bold text-foreground w-32 text-right">{formatFCFA(item.unitPrice * item.quantity)}</p>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-8 p-6 rounded-xl border border-border bg-card">
          <div className="flex justify-between items-center text-lg">
            <span className="font-heading font-semibold text-foreground">{isFr ? "Total" : "Total"}</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{formatFCFA(total)}</span>
              {country === "NG" && (
                <span className="block text-sm text-muted-foreground">≈ {formatNGN(Math.round(total * 2.7))}</span>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={clearCart}
              className="px-4 py-2.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              {isFr ? "Vider le panier" : "Clear cart"}
            </button>
            <Link
              to={`/${lang}/checkout`}
              className="flex-1 text-center py-2.5 rounded-lg orange-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              {isFr ? "Passer la commande" : "Proceed to Checkout"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;
