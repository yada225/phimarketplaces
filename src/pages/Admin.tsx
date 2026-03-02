import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield, Package, Users, Store, Receipt, ChevronDown, ChevronUp,
  Download, BarChart3, DollarSign, ShoppingCart, Clock, Filter,
  CheckCircle, XCircle, Eye, Pause, Play, Boxes
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { formatFCFA } from "@/lib/pricing";
import AdminStockTab from "@/components/admin/AdminStockTab";

type AdminTab = "overview" | "orders" | "shops" | "receipts" | "users" | "stock";

interface OrderRow {
  id: string; order_ref: string; customer_name: string; customer_email: string;
  country: string; currency_label: string; total: number; status: string; created_at: string;
}
interface OrderItem {
  id: string; item_name: string; quantity: number; unit_price: number; total_price: number; item_type: string;
}
interface ShopRow {
  id: string; name: string; slug: string; user_id: string; status: string;
  plan_type: string | null; plan_status: string; whatsapp: string | null;
  created_at: string; is_active: boolean; activated_at: string | null; renewal_at: string | null;
}
interface ShopOrderRow {
  id: string; shop_id: string; customer_name: string; total: number; status: string;
  order_ref: string; created_at: string; currency_label: string;
}
interface ReceiptRow {
  id: string; user_id: string; shop_id: string | null; receipt_type: string;
  file_url: string; plan_type: string | null; status: string; created_at: string;
  admin_notes: string | null; otp_code: string | null;
}
interface ProfileRow {
  id: string; user_id: string; full_name: string | null; phone: string | null;
  city: string | null; country: string | null; created_at: string;
}

const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const Admin = () => {
  const { lang } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const isFr = lang === "fr";

  const [tab, setTab] = useState<AdminTab>("overview");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [shopOrders, setShopOrders] = useState<ShopOrderRow[]>([]);
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [search, setSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [countryFilter, setCountryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedShop, setSelectedShop] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    const [ordersRes, shopsRes, shopOrdersRes, receiptsRes, profilesRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("shops").select("*").order("created_at", { ascending: false }),
      supabase.from("shop_orders").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("receipts").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (shopsRes.data) setShops(shopsRes.data as ShopRow[]);
    if (shopOrdersRes.data) setShopOrders(shopOrdersRes.data as ShopOrderRow[]);
    if (receiptsRes.data) setReceipts(receiptsRes.data as ReceiptRow[]);
    if (profilesRes.data) setProfiles(profilesRes.data);
  };

  // Date filter helper
  const filterByDate = <T extends { created_at: string }>(items: T[]) => {
    if (dateFilter === "all") return items;
    const now = new Date();
    const cutoff = new Date();
    if (dateFilter === "today") cutoff.setHours(0, 0, 0, 0);
    else if (dateFilter === "week") cutoff.setDate(now.getDate() - 7);
    else if (dateFilter === "month") cutoff.setMonth(now.getMonth() - 1);
    return items.filter(i => new Date(i.created_at) >= cutoff);
  };

  // Overview stats
  const stats = useMemo(() => {
    const filteredOrders = filterByDate(orders);
    const filteredShopOrders = filterByDate(shopOrders);
    const allFiltered = [...filteredOrders, ...filteredShopOrders];
    const filtered = countryFilter === "all" ? allFiltered : allFiltered.filter(o => ('country' in o ? (o as any).country : '') === countryFilter);

    const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
    const totalOrders = filtered.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const activeShops = shops.filter(s => s.status === "active").length;
    const pendingReceipts = receipts.filter(r => r.status === "pending").length;

    return { totalRevenue, totalOrders, avgOrderValue, activeShops, pendingReceipts };
  }, [orders, shopOrders, shops, receipts, countryFilter, dateFilter]);

  // Per-shop stats
  const shopStats = useMemo(() => {
    return shops.map(shop => {
      const sOrders = shopOrders.filter(o => o.shop_id === shop.id);
      const revenue = sOrders.reduce((s, o) => s + o.total, 0);
      const lastOrder = sOrders.length > 0 ? sOrders[0].created_at : null;
      return { ...shop, revenue, ordersCount: sOrders.length, aov: sOrders.length > 0 ? Math.round(revenue / sOrders.length) : 0, lastOrder };
    });
  }, [shops, shopOrders]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const toggleOrderItems = async (orderId: string) => {
    if (expandedOrder === orderId) { setExpandedOrder(null); return; }
    if (!orderItems[orderId]) {
      const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
      if (data) setOrderItems(prev => ({ ...prev, [orderId]: data }));
    }
    setExpandedOrder(orderId);
  };

  const updateShopStatus = async (shopId: string, status: string) => {
    const updates: any = { status, is_active: status === "active" };
    if (status === "active") updates.activated_at = new Date().toISOString();
    await supabase.from("shops").update(updates).eq("id", shopId);
    setShops(prev => prev.map(s => s.id === shopId ? { ...s, ...updates } : s));
  };

  const handleReceiptAction = async (receipt: ReceiptRow, action: "approved" | "rejected") => {
    const otp = action === "approved" ? Math.random().toString(36).substring(2, 8).toUpperCase() : null;
    await supabase.from("receipts").update({
      status: action,
      otp_code: otp,
      reviewed_at: new Date().toISOString(),
    }).eq("id", receipt.id);

    if (action === "approved" && receipt.shop_id) {
      await supabase.from("shops").update({
        status: "active",
        is_active: true,
        plan_status: "active",
        plan_type: receipt.plan_type,
        activated_at: new Date().toISOString(),
      }).eq("id", receipt.shop_id);
    }

    fetchAll();
  };

  // CSV export
  const exportCSV = () => {
    const filteredOrders = filterByDate(orders);
    const rows = [["Ref", "Client", "Email", "Country", "Total", "Currency", "Status", "Date"].join(",")];
    filteredOrders.forEach(o => {
      rows.push([o.order_ref, `"${o.customer_name}"`, o.customer_email, o.country, o.total, o.currency_label, o.status, o.created_at].join(","));
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (authLoading || adminLoading) return <div className="section-padding text-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to={`/${lang}/auth`} replace />;
  if (!isAdmin) return <Navigate to={`/${lang}/dashboard`} replace />;

  const filteredOrders = filterByDate(orders).filter(o =>
    (countryFilter === "all" || o.country === countryFilter) &&
    (o.order_ref.toLowerCase().includes(search.toLowerCase()) ||
     o.customer_name.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredProfiles = profiles.filter(p =>
    (p.full_name ?? "").toLowerCase().includes(search.toLowerCase()) || p.user_id.includes(search)
  );

  const tabs: { key: AdminTab; icon: any; label: string; count?: number }[] = [
    { key: "overview", icon: BarChart3, label: isFr ? "Vue globale" : "Overview" },
    { key: "orders", icon: Package, label: isFr ? "Commandes" : "Orders", count: orders.length },
    { key: "shops", icon: Store, label: isFr ? "Boutiques" : "Shops", count: shops.length },
    { key: "stock", icon: Boxes, label: "Stock" },
    { key: "receipts", icon: Receipt, label: isFr ? "Reçus" : "Receipts", count: receipts.filter(r => r.status === "pending").length },
    { key: "users", icon: Users, label: isFr ? "Utilisateurs" : "Users", count: profiles.length },
  ];

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {isFr ? "Administration" : "Admin Panel"}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(t => (
            <Button key={t.key} variant={tab === t.key ? "default" : "outline"} onClick={() => { setTab(t.key); setSearch(""); }}>
              <t.icon className="w-4 h-4 mr-2" />
              {t.label} {t.count !== undefined && `(${t.count})`}
            </Button>
          ))}
        </div>

        {/* Filters */}
        {tab !== "overview" && (
          <div className="flex flex-wrap gap-3 mb-6">
            <Input placeholder={isFr ? "Rechercher..." : "Search..."} value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
            {(tab === "orders" || tab === "shops") && (
              <>
                <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                  <option value="all">{isFr ? "Tous pays" : "All countries"}</option>
                  <option value="NG">Nigeria</option>
                  <option value="CIV">Côte d'Ivoire</option>
                  <option value="OTHER">{isFr ? "Autre" : "Other"}</option>
                </select>
                <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                  <option value="all">{isFr ? "Toute période" : "All time"}</option>
                  <option value="today">{isFr ? "Aujourd'hui" : "Today"}</option>
                  <option value="week">{isFr ? "7 derniers jours" : "Last 7 days"}</option>
                  <option value="month">{isFr ? "30 derniers jours" : "Last 30 days"}</option>
                </select>
              </>
            )}
            {tab === "orders" && (
              <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />{isFr ? "Export CSV" : "Export CSV"}</Button>
            )}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div className="space-y-8">
            {/* Filters for overview */}
            <div className="flex flex-wrap gap-3">
              <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="all">{isFr ? "Tous pays" : "All countries"}</option>
                <option value="NG">Nigeria</option>
                <option value="CIV">Côte d'Ivoire</option>
                <option value="OTHER">{isFr ? "Autre" : "Other"}</option>
              </select>
              <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="all">{isFr ? "Toute période" : "All time"}</option>
                <option value="today">{isFr ? "Aujourd'hui" : "Today"}</option>
                <option value="week">{isFr ? "7 derniers jours" : "Last 7 days"}</option>
                <option value="month">{isFr ? "30 derniers jours" : "Last 30 days"}</option>
              </select>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: DollarSign, label: isFr ? "Revenu total" : "Total Revenue", value: formatFCFA(stats.totalRevenue), color: "text-primary" },
                { icon: ShoppingCart, label: isFr ? "Commandes" : "Orders", value: stats.totalOrders.toString(), color: "text-foreground" },
                { icon: Store, label: isFr ? "Boutiques actives" : "Active Shops", value: stats.activeShops.toString(), color: "text-foreground" },
                { icon: Receipt, label: isFr ? "Reçus en attente" : "Pending Receipts", value: stats.pendingReceipts.toString(), color: "text-destructive" },
                { icon: BarChart3, label: isFr ? "Panier moyen" : "Avg Order", value: formatFCFA(stats.avgOrderValue), color: "text-primary" },
              ].map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border border-border bg-card">
                  <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Per-shop table */}
            <div>
              <h2 className="text-lg font-heading font-bold text-foreground mb-3">{isFr ? "Performance par boutique" : "Per-Shop Performance"}</h2>
              <div className="rounded-xl border border-border bg-card overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isFr ? "Boutique" : "Shop"}</TableHead>
                      <TableHead>{isFr ? "Propriétaire" : "Owner"}</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>{isFr ? "Revenu" : "Revenue"}</TableHead>
                      <TableHead>{isFr ? "Commandes" : "Orders"}</TableHead>
                      <TableHead>{isFr ? "Panier moyen" : "AOV"}</TableHead>
                      <TableHead>{isFr ? "Dernière cmd" : "Last Order"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shopStats.map(shop => {
                      const owner = profiles.find(p => p.user_id === shop.user_id);
                      return (
                        <TableRow key={shop.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedShop(shop.id); setTab("shops"); }}>
                          <TableCell className="font-medium">{shop.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{owner?.full_name || "—"}</TableCell>
                          <TableCell><span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{shop.plan_type || "—"}</span></TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              shop.status === "active" ? "bg-green-100 text-green-700" :
                              shop.status === "suspended" ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>{shop.status}</span>
                          </TableCell>
                          <TableCell className="font-semibold text-primary">{formatFCFA(shop.revenue)}</TableCell>
                          <TableCell>{shop.ordersCount}</TableCell>
                          <TableCell>{formatFCFA(shop.aov)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{shop.lastOrder ? new Date(shop.lastOrder).toLocaleDateString() : "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                    {shopStats.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">{isFr ? "Aucune boutique" : "No shops"}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isFr ? "Réf." : "Ref."}</TableHead>
                  <TableHead>{isFr ? "Client" : "Customer"}</TableHead>
                  <TableHead>{isFr ? "Pays" : "Country"}</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>{isFr ? "Statut" : "Status"}</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => (
                  <>
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.order_ref}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{order.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                      </TableCell>
                      <TableCell>{order.country}</TableCell>
                      <TableCell className="font-semibold text-primary">{order.total.toLocaleString("fr-FR")} {order.currency_label}</TableCell>
                      <TableCell>
                        <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)}
                          className="text-xs rounded-md border border-input bg-background px-2 py-1">
                          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => toggleOrderItems(order.id)}>
                          {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedOrder === order.id && orderItems[order.id] && (
                      <TableRow key={`${order.id}-items`}>
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          <div className="space-y-1">
                            {orderItems[order.id].map(item => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.item_name} <span className="text-xs text-muted-foreground">({item.item_type})</span></span>
                                <span className="font-medium">{item.total_price.toLocaleString("fr-FR")} {order.currency_label}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">{isFr ? "Aucune commande" : "No orders found"}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* SHOPS TAB */}
        {tab === "shops" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isFr ? "Boutique" : "Shop"}</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>{isFr ? "Renouvellement" : "Renewal"}</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase())).map(shop => (
                    <TableRow key={shop.id} className={selectedShop === shop.id ? "bg-accent/50" : ""}>
                      <TableCell className="font-medium">{shop.name}</TableCell>
                      <TableCell className="font-mono text-xs">{shop.slug}</TableCell>
                      <TableCell><span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{shop.plan_type || "—"}</span></TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          shop.status === "active" ? "bg-green-100 text-green-700" :
                          shop.status === "suspended" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>{shop.status}</span>
                      </TableCell>
                      <TableCell className="text-xs">{shop.whatsapp || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{shop.renewal_at ? new Date(shop.renewal_at).toLocaleDateString() : "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {shop.status !== "active" && (
                            <Button variant="ghost" size="sm" onClick={() => updateShopStatus(shop.id, "active")} title="Activate">
                              <Play className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          {shop.status === "active" && (
                            <Button variant="ghost" size="sm" onClick={() => updateShopStatus(shop.id, "suspended")} title="Suspend">
                              <Pause className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {shops.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">{isFr ? "Aucune boutique" : "No shops"}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Selected shop detail */}
            {selectedShop && (() => {
              const shop = shops.find(s => s.id === selectedShop);
              if (!shop) return null;
              const sOrders = shopOrders.filter(o => o.shop_id === selectedShop);
              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-heading font-bold text-foreground">{shop.name} — {isFr ? "Détail" : "Detail"}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedShop(null)}>✕</Button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">{isFr ? "Revenu" : "Revenue"}</p>
                      <p className="font-bold text-primary">{formatFCFA(sOrders.reduce((s, o) => s + o.total, 0))}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">{isFr ? "Commandes" : "Orders"}</p>
                      <p className="font-bold text-foreground">{sOrders.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">WhatsApp</p>
                      <p className="font-medium text-foreground">{shop.whatsapp || "—"}</p>
                    </div>
                  </div>
                  {sOrders.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ref</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sOrders.slice(0, 20).map(o => (
                          <TableRow key={o.id}>
                            <TableCell className="font-mono text-xs">{o.order_ref}</TableCell>
                            <TableCell>{o.customer_name}</TableCell>
                            <TableCell className="font-semibold text-primary">{o.total.toLocaleString("fr-FR")} {o.currency_label}</TableCell>
                            <TableCell><span className={`text-xs px-2 py-0.5 rounded-full ${o.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{o.status}</span></TableCell>
                            <TableCell className="text-xs">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </motion.div>
              );
            })()}
          </div>
        )}

        {/* RECEIPTS TAB */}
        {tab === "receipts" && (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isFr ? "Type" : "Type"}</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>{isFr ? "Utilisateur" : "User"}</TableHead>
                  <TableHead>{isFr ? "Statut" : "Status"}</TableHead>
                  <TableHead>OTP</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map(r => {
                  const owner = profiles.find(p => p.user_id === r.user_id);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm">{r.receipt_type}</TableCell>
                      <TableCell><span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{r.plan_type || "—"}</span></TableCell>
                      <TableCell className="text-sm">{owner?.full_name || r.user_id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          r.status === "approved" ? "bg-green-100 text-green-700" :
                          r.status === "rejected" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>{r.status}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-primary">{r.otp_code || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {r.status === "pending" && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleReceiptAction(r, "approved")} title="Approve">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleReceiptAction(r, "rejected")} title="Reject">
                              <XCircle className="w-4 h-4 text-destructive" />
                            </Button>
                            <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" title="View"><Eye className="w-4 h-4" /></Button>
                            </a>
                          </div>
                        )}
                        {r.status !== "pending" && (
                          <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {receipts.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">{isFr ? "Aucun reçu" : "No receipts"}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* USERS TAB */}
        {tab === "users" && (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
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
                {filteredProfiles.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                    <TableCell>{p.phone || "—"}</TableCell>
                    <TableCell>{p.city || "—"}</TableCell>
                    <TableCell>{p.country || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {filteredProfiles.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{isFr ? "Aucun utilisateur" : "No users found"}</TableCell></TableRow>
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
