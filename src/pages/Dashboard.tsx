import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Package, Store, LogOut, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  order_ref: string;
  total: number;
  status: string;
  created_at: string;
  currency_label: string;
}

const Dashboard = () => {
  const { lang } = useI18n();
  const { user, loading, signOut } = useAuth();
  const isFr = lang === "fr";
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, order_ref, total, status, created_at, currency_label")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setOrders(data);
      });
  }, [user]);

  if (loading) return <div className="section-padding text-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to={`/${lang}/auth`} replace />;

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {isFr ? "Mon Espace" : "My Dashboard"}
          </h1>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {isFr ? "Déconnexion" : "Sign Out"}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-xl border border-border bg-card">
            <User className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-heading font-semibold text-foreground">{isFr ? "Profil" : "Profile"}</h3>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </div>
          <div className="p-5 rounded-xl border border-border bg-card">
            <Package className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-heading font-semibold text-foreground">{isFr ? "Commandes" : "Orders"}</h3>
            <p className="text-sm text-muted-foreground mt-1">{orders.length} {isFr ? "commande(s)" : "order(s)"}</p>
          </div>
          <Link to={`/${lang}/shops`} className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
            <Store className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-heading font-semibold text-foreground">{isFr ? "Ma Boutique" : "My Shop"}</h3>
            <p className="text-sm text-muted-foreground mt-1">{isFr ? "Créer ou gérer" : "Create or manage"}</p>
          </Link>
        </div>

        {/* Orders */}
        <h2 className="text-xl font-heading font-bold text-foreground mb-4">
          {isFr ? "Mes Commandes" : "My Orders"}
        </h2>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-sm">{isFr ? "Aucune commande" : "No orders yet"}</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
              >
                <div>
                  <p className="font-heading font-semibold text-foreground">{order.order_ref}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {order.total.toLocaleString("fr-FR")} {order.currency_label}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
