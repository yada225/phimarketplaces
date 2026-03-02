import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Package, AlertTriangle, Plus, History } from "lucide-react";
import { PRICING } from "@/lib/pricing";
import { useAuth } from "@/hooks/use-auth";

interface StockRow { product_key: string; current_stock: number; reorder_level: number; }
interface MovementRow {
  id: string; product_key: string; movement_type: string;
  quantity: number; reference: string | null; created_at: string;
}

const PRODUCT_KEYS = Object.keys(PRICING);
const productLabel = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());

export default function OwnerStockTab({ isFr, shopId }: { isFr: boolean; shopId: string }) {
  const { user } = useAuth();
  const [stock, setStock] = useState<StockRow[]>([]);
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [view, setView] = useState<"stock" | "movements" | "restock">("stock");
  const [loading, setLoading] = useState(false);
  const [restockItems, setRestockItems] = useState<Record<string, number>>({});

  useEffect(() => { fetchStock(); }, [shopId]);

  const fetchStock = async () => {
    setLoading(true);
    const { data } = await supabase.rpc("get_shop_stock", { p_shop_id: shopId });
    if (data) setStock(data as StockRow[]);

    const { data: mvts } = await supabase
      .from("inventory_movements")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (mvts) setMovements(mvts as MovementRow[]);
    setLoading(false);
  };

  const initializeStock = async () => {
    for (const key of PRODUCT_KEYS) {
      await supabase.from("inventory_items").upsert(
        { shop_id: shopId, product_key: key, reorder_level: 5 },
        { onConflict: "shop_id,product_key" }
      );
    }
    fetchStock();
  };

  const handleRestock = async () => {
    const items = Object.entries(restockItems).filter(([, qty]) => qty > 0);
    if (items.length === 0) return;

    const { data: replenishment } = await supabase
      .from("stock_replenishments")
      .insert({ shop_id: shopId, supplier_name: null, status: "DRAFT", total_cost: 0, created_by: user?.id })
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
    setView("stock");
    fetchStock();
  };

  const addMovement = async (productKey: string, qty: number, note: string) => {
    await supabase.from("inventory_movements").insert({
      shop_id: shopId, product_key: productKey,
      movement_type: "ADJUSTMENT", quantity: qty, reference: note, created_by: user?.id,
    });
    fetchStock();
  };

  const getStatus = (row: StockRow) => {
    if (row.current_stock <= 0) return { label: isFr ? "Rupture" : "Out", color: "bg-red-100 text-red-700" };
    if (row.current_stock <= row.reorder_level) return { label: isFr ? "Faible" : "Low", color: "bg-yellow-100 text-yellow-700" };
    return { label: "OK", color: "bg-green-100 text-green-700" };
  };

  const lowStockCount = stock.filter(s => Number(s.current_stock) <= s.reorder_level).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Button variant={view === "stock" ? "default" : "outline"} size="sm" onClick={() => setView("stock")}>
          <Package className="w-4 h-4 mr-1" />{isFr ? "Stock" : "Stock"}
          {lowStockCount > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-destructive text-destructive-foreground">{lowStockCount}</span>}
        </Button>
        <Button variant={view === "movements" ? "default" : "outline"} size="sm" onClick={() => setView("movements")}>
          <History className="w-4 h-4 mr-1" />{isFr ? "Historique" : "History"}
        </Button>
        <Button variant={view === "restock" ? "default" : "outline"} size="sm" onClick={() => setView("restock")}>
          <Plus className="w-4 h-4 mr-1" />{isFr ? "Entrée stock" : "Add Stock"}
        </Button>
        <Button variant="outline" size="sm" onClick={initializeStock}>
          {isFr ? "Initialiser" : "Init"}
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">{isFr ? "Chargement..." : "Loading..."}</p>}

      {view === "stock" && !loading && (
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isFr ? "Produit" : "Product"}</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>{isFr ? "Seuil" : "Threshold"}</TableHead>
                <TableHead>{isFr ? "Statut" : "Status"}</TableHead>
                <TableHead>+/-</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stock.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">{isFr ? "Cliquez 'Initialiser'" : "Click 'Init'"}</TableCell></TableRow>
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
                        <Button variant="outline" size="sm" onClick={() => addMovement(row.product_key, 1, "Owner +1")}>+1</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          if (Number(row.current_stock) > 0) addMovement(row.product_key, -1, "Owner -1");
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

      {view === "movements" && !loading && (
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>{isFr ? "Produit" : "Product"}</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>{isFr ? "Qté" : "Qty"}</TableHead>
                <TableHead>Ref</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</TableCell>
                  <TableCell>{productLabel(m.product_key)}</TableCell>
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
                  <TableCell className="text-xs">{m.reference || "—"}</TableCell>
                </TableRow>
              ))}
              {movements.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">{isFr ? "Aucun mouvement" : "No movements"}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {view === "restock" && !loading && (
        <div className="p-4 rounded-xl border border-border bg-card space-y-3">
          <h3 className="font-heading font-semibold text-foreground">{isFr ? "Entrée de stock" : "Stock Entry"}</h3>
          <div className="grid grid-cols-2 gap-2">
            {PRODUCT_KEYS.map(key => (
              <div key={key} className="flex items-center gap-2">
                <label className="text-sm min-w-[90px]">{productLabel(key)}</label>
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
            <Plus className="w-4 h-4 mr-2" />{isFr ? "Valider" : "Submit"}
          </Button>
        </div>
      )}
    </div>
  );
}
