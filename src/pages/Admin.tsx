import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Package, Users, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";

interface OrderRow {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_email: string;
  country: string;
  currency_label: string;
  total: number;
  status: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: string;
}

interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
}

const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const Admin = () => {
  const { lang } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const isFr = lang === "fr";

  const [tab, setTab] = useState<"orders" | "users">("orders");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [search, setSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders();
    fetchProfiles();
  }, [isAdmin]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setOrders(data);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setProfiles(data);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const toggleOrderItems = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    if (!orderItems[orderId]) {
      const { data } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);
      if (data) setOrderItems((prev) => ({ ...prev, [orderId]: data }));
    }
    setExpandedOrder(orderId);
  };

  if (authLoading || adminLoading) {
    return <div className="section-padding text-center text-muted-foreground">Loading...</div>;
  }

  if (!user) return <Navigate to={`/${lang}/auth`} replace />;
  if (!isAdmin) return <Navigate to={`/${lang}/dashboard`} replace />;

  const filteredOrders = orders.filter(
    (o) =>
      o.order_ref.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProfiles = profiles.filter(
    (p) =>
      (p.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      p.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {isFr ? "Administration" : "Admin Panel"}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={tab === "orders" ? "default" : "outline"}
            onClick={() => { setTab("orders"); setSearch(""); }}
          >
            <Package className="w-4 h-4 mr-2" />
            {isFr ? "Commandes" : "Orders"} ({orders.length})
          </Button>
          <Button
            variant={tab === "users" ? "default" : "outline"}
            onClick={() => { setTab("users"); setSearch(""); }}
          >
            <Users className="w-4 h-4 mr-2" />
            {isFr ? "Utilisateurs" : "Users"} ({profiles.length})
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder={isFr ? "Rechercher..." : "Search..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm mb-6"
        />

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isFr ? "Réf." : "Ref."}</TableHead>
                  <TableHead>{isFr ? "Client" : "Customer"}</TableHead>
                  <TableHead>{isFr ? "Pays" : "Country"}</TableHead>
                  <TableHead>{isFr ? "Total" : "Total"}</TableHead>
                  <TableHead>{isFr ? "Statut" : "Status"}</TableHead>
                  <TableHead>{isFr ? "Date" : "Date"}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <>
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.order_ref}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{order.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                      </TableCell>
                      <TableCell>{order.country}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        {order.total.toLocaleString("fr-FR")} {order.currency_label}
                      </TableCell>
                      <TableCell>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-xs rounded-md border border-input bg-background px-2 py-1"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleOrderItems(order.id)}
                        >
                          {expandedOrder === order.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedOrder === order.id && orderItems[order.id] && (
                      <TableRow key={`${order.id}-items`}>
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          <div className="space-y-1">
                            {orderItems[order.id].map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>
                                  {item.quantity}x {item.item_name}
                                  <span className="text-xs text-muted-foreground ml-1">({item.item_type})</span>
                                </span>
                                <span className="font-medium">
                                  {item.total_price.toLocaleString("fr-FR")} {order.currency_label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {isFr ? "Aucune commande trouvée" : "No orders found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isFr ? "Nom" : "Name"}</TableHead>
                  <TableHead>{isFr ? "Téléphone" : "Phone"}</TableHead>
                  <TableHead>{isFr ? "Ville" : "City"}</TableHead>
                  <TableHead>{isFr ? "Pays" : "Country"}</TableHead>
                  <TableHead>{isFr ? "Inscrit le" : "Joined"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                    <TableCell>{p.phone || "—"}</TableCell>
                    <TableCell>{p.city || "—"}</TableCell>
                    <TableCell>{p.country || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProfiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {isFr ? "Aucun utilisateur trouvé" : "No users found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Admin;
