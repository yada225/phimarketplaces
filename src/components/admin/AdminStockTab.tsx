import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Package, AlertTriangle, Plus, ArrowUpDown, History,
} from "lucide-react";
import { PRICING } from "@/lib/pricing";

interface ShopOption { id: string; name: string; }
interface StockRow { product_key: string; current_stock: number; reorder_level: number; }
interface MovementRow {
  id: string; shop_id: string; product_key: string; movement_type: string;
  quantity: number; reference: string | null; created_at: string;
}

const PRODUCT_KEYS = Object.keys(PRICING);
const productLabel = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());

export default function AdminStockTab({ isFr, shops }: { isFr: boolean; shops: ShopOption[] }) {
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [stock, setStock] = useState<StockRow[]>([]);
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [view, setView] = useState<"stock" | "movements" | "restock">("stock");
  const [loading, setLoading] = useState(false);

  // Restock form
  const [restockItems, setRestockItems] = useState<Record<string, number>>({});
  const [supplierName, setSupplierName] = useState("");

  useEffect(() => {
    if (selectedShop) fetchStock();
  }, [selectedShop]);

  const fetchStock = async () => {
    if (!selectedShop) return;
    setLoading(true);
    const { data } = await supabase.rpc("get_shop_stock", { p_shop_id: selectedShop });
    if (data) setStock(data as StockRow[]);

    const { data: mvts } = await supabase
      .from("inventory_movements")
      .select("*")
      .eq("shop_id", selectedShop)
      .order("created_at", { ascending: false })
      .limit(100);
    if (mvts) setMovements(mvts as MovementRow[]);
    setLoading(false);
  };

  const initializeStock = async () => {
    if (!selectedShop) return;
    for (const key of PRODUCT_KEYS) {
      await supabase.from("inventory_items").upsert(
        { shop_id: selectedShop, product_key: key, reorder_level: 5 },
        { onConflict: "shop_id,product_key" }
      );
    }
    fetchStock();
  };

  const handleRestock = async () => {
    if (!selectedShop) return;
    const items = Object.entries(restockItems).filter(([, qty]) => qty > 0);
    if (items.length === 0) return;

    const { data: replenishment } = await supabase
      .from("stock_replenishments")
      .insert({ shop_id: selectedShop, supplier_name: supplierName || null, status: "DRAFT", total_cost: 0 })
      .select("id")
      .single();

    if (!replenishment) return;

    for (const [key, qty] of items) {
      await supabase.from("stock_replenishment_items").insert({
        replenishment_id: replenishment.id, product_key: key, quantity: qty, unit_cost: 0,
      });
    }

    await supabase.rpc("receive_replenishment", { p_replenishment_id: replenishment.id });
    setRestockItems({});
    setSupplierName("");
    setView("stock");
    fetchStock();
  };

  const addAdjustment = async (productKey: string, qty: number, note: string) => {
    if (!selectedShop) return;
    await supabase.from("inventory_movements").insert({
      shop_id: selectedShop, product_key: productKey,
      movement_type: "ADJUSTMENT", quantity: qty, reference: note,
    });
    fetchStock();
  };

  const getStatus = (row: StockRow) => {
    if (row.current_stock <= 0) return { label: isFr ? "Rupture" : "Out", color: "bg-red-100 text-red-700" };
    if (row.current_stock <= row.reorder_level) return { label: isFr ? "Faible" : "Low", color: "bg-yellow-100 text-yellow-700" };
    return { label: "OK", color: "bg-green-100 text-green-700" };
  };

  return (
    <div className="space-y-6">
      {/* Shop selector */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedShop}
          onChange={e => setSelectedShop(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
        >
          <option value="">{isFr ? "Choisir une boutique" : "Select a shop"}</option>
          {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        {selectedShop && (
          <>
            <Button variant={view === "stock" ? "default" : "outline"} size="sm" onClick={() => setView("stock")}>
              <Package className="w-4 h-4 mr-1" />{isFr ? "Stock" : "Stock"}
            </Button>
            <Button variant={view === "movements" ? "default" : "outline"} size="sm" onClick={() => setView("movements")}>
              <History className="w-4 h-4 mr-1" />{isFr ? "Mouvements" : "Movements"}
            </Button>
            <Button variant={view === "restock" ? "default" : "outline"} size="sm" onClick={() => setView("restock")}>
              <Plus className="w-4 h-4 mr-1" />{isFr ? "Approvisionner" : "Restock"}
            </Button>
            <Button variant="outline" size="sm" onClick={initializeStock}>
              {isFr ? "Initialiser produits" : "Init products"}
            </Button>
          </>
        )}
      </div>

      {loading && <p className="text-muted-foreground text-sm">{isFr ? "Chargement..." : "Loading..."}</p>}

      {/* STOCK VIEW */}
      {selectedShop && view === "stock" && !loading && (
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isFr ? "Produit" : "Product"}</TableHead>
                <TableHead>{isFr ? "Stock actuel" : "Current Stock"}</TableHead>
                <TableHead>{isFr ? "Seuil" : "Reorder Level"}</TableHead>
                <TableHead>{isFr ? "Statut" : "Status"}</TableHead>
                <TableHead>{isFr ? "Ajustement" : "Adjustment"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {isFr ? "Aucun produit initialisé. Cliquez 'Initialiser produits'." : "No products initialized. Click 'Init products'."}
                  </TableCell>
                </TableRow>
              ) : stock.map(row => {
                const st = getStatus(row);
                return (
                  <TableRow key={row.product_key}>
                    <TableCell className="font-medium">{productLabel(row.product_key)}</TableCell>
                    <TableCell className="font-bold">{Number(row.current_stock)}</TableCell>
                    <TableCell>{row.reorder_level}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                      {Number(row.current_stock) <= row.reorder_level && <AlertTriangle className="w-4 h-4 text-yellow-500 inline ml-1" />}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => addAdjustment(row.product_key, 1, "Admin +1")}>+1</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          if (Number(row.current_stock) > 0) addAdjustment(row.product_key, -1, "Admin -1");
                        }}>-1</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* MOVEMENTS VIEW */}
      {selectedShop && view === "movements" && !loading && (
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>{isFr ? "Produit" : "Product"}</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>{isFr ? "Quantité" : "Qty"}</TableHead>
                <TableHead>{isFr ? "Référence" : "Reference"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{productLabel(m.product_key)}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      m.movement_type === "SALE" ? "bg-red-100 text-red-700" :
                      m.movement_type === "RESTOCK" ? "bg-green-100 text-green-700" :
                      "bg-accent text-accent-foreground"
                    }`}>{m.movement_type}</span>
                  </TableCell>
                  <TableCell className={`font-bold ${m.quantity >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {m.quantity > 0 ? "+" : ""}{m.quantity}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.reference || "—"}</TableCell>
                </TableRow>
              ))}
              {movements.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{isFr ? "Aucun mouvement" : "No movements"}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* RESTOCK VIEW */}
      {selectedShop && view === "restock" && !loading && (
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <h3 className="font-heading font-bold text-foreground">{isFr ? "Nouvel approvisionnement" : "New Replenishment"}</h3>
          <Input placeholder={isFr ? "Fournisseur (optionnel)" : "Supplier (optional)"} value={supplierName} onChange={e => setSupplierName(e.target.value)} className="max-w-xs" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PRODUCT_KEYS.map(key => (
              <div key={key} className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground min-w-[100px]">{productLabel(key)}</label>
                <Input
                  type="number" min={0} placeholder="0"
                  value={restockItems[key] || ""}
                  onChange={e => setRestockItems(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                  className="w-20"
                />
              </div>
            ))}
          </div>
          <Button onClick={handleRestock}>
            <Plus className="w-4 h-4 mr-2" />{isFr ? "Valider l'approvisionnement" : "Submit Replenishment"}
          </Button>
        </div>
      )}
    </div>
  );
}
