import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";

interface TradeFormProps {
  onTradeAdded: () => void;
}

const ASSETS = ["BTC/USD", "ETH/USD", "SOL/USD", "BNB/USD", "XRP/USD", "ADA/USD", "DOGE/USD", "AVAX/USD", "DOT/USD", "MATIC/USD", "EUR/USD", "GBP/USD", "USD/JPY", "AAPL", "TSLA", "GOOGL", "AMZN", "MSFT", "NVDA", "META"];

const TradeForm = ({ onTradeAdded }: TradeFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [asset, setAsset] = useState("");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [leverage, setLeverage] = useState("1");
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");

  const calculatePnL = () => {
    if (!entryPrice || !exitPrice || !positionSize) return null;
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const size = parseFloat(positionSize);
    const lev = parseFloat(leverage) || 1;

    const priceDiff = direction === "long" ? exit - entry : entry - exit;
    const pnl = (priceDiff / entry) * size * lev;
    return pnl;
  };

  const pnl = calculatePnL();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const entry = parseFloat(entryPrice);
    const exit = exitPrice ? parseFloat(exitPrice) : null;
    const size = parseFloat(positionSize);
    const lev = parseFloat(leverage) || 1;

    let profitLoss: number | null = null;
    let status = "open";

    if (exit !== null) {
      const priceDiff = direction === "long" ? exit - entry : entry - exit;
      profitLoss = (priceDiff / entry) * size * lev;
      status = "closed";
    }

    const { error } = await supabase.from("trades").insert({
      user_id: user.id,
      asset,
      direction,
      entry_price: entry,
      exit_price: exit,
      position_size: size,
      leverage: lev,
      take_profit: takeProfit ? parseFloat(takeProfit) : null,
      stop_loss: stopLoss ? parseFloat(stopLoss) : null,
      status,
      profit_loss: profitLoss,
      closed_at: status === "closed" ? new Date().toISOString() : null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Update account balance if trade is closed
      if (profitLoss !== null) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("account_balance")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({ account_balance: profile.account_balance + profitLoss })
            .eq("user_id", user.id);
        }
      }

      toast({ title: "Trade logged!", description: profitLoss !== null ? `P&L: $${profitLoss.toFixed(2)}` : "Open position recorded" });
      // Reset form
      setAsset(""); setEntryPrice(""); setExitPrice(""); setPositionSize("");
      setLeverage("1"); setTakeProfit(""); setStopLoss("");
      setIsOpen(false);
      onTradeAdded();
    }
    setLoading(false);
  };

  return (
    <div>
      {!isOpen ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="w-full glass rounded-xl p-6 flex items-center justify-center gap-3 text-primary hover:border-primary/40 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span className="font-display tracking-wider text-sm">NEW TRADE</span>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="font-display text-lg font-semibold mb-4 text-foreground">Log Trade</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Asset</Label>
                <Select value={asset} onValueChange={setAsset} required>
                  <SelectTrigger className="bg-secondary/50 border-border/50">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSETS.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Direction</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDirection("long")}
                    className={`flex-1 py-2 rounded-lg text-sm font-display flex items-center justify-center gap-1 transition-all ${
                      direction === "long" ? "bg-profit/20 text-profit border border-profit/40" : "bg-secondary/50 text-muted-foreground border border-border/50"
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" /> LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("short")}
                    className={`flex-1 py-2 rounded-lg text-sm font-display flex items-center justify-center gap-1 transition-all ${
                      direction === "short" ? "bg-loss/20 text-loss border border-loss/40" : "bg-secondary/50 text-muted-foreground border border-border/50"
                    }`}
                  >
                    <TrendingDown className="w-3 h-3" /> SHORT
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Entry Price</Label>
                <Input type="number" step="any" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} required className="bg-secondary/50 border-border/50 font-mono" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Exit Price (optional)</Label>
                <Input type="number" step="any" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} className="bg-secondary/50 border-border/50 font-mono" placeholder="0.00" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Position Size ($)</Label>
                <Input type="number" step="any" value={positionSize} onChange={(e) => setPositionSize(e.target.value)} required className="bg-secondary/50 border-border/50 font-mono" placeholder="1000" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Leverage</Label>
                <Input type="number" step="1" min="1" value={leverage} onChange={(e) => setLeverage(e.target.value)} className="bg-secondary/50 border-border/50 font-mono" placeholder="1" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Take Profit</Label>
                <Input type="number" step="any" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} className="bg-secondary/50 border-border/50 font-mono" placeholder="0.00" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Stop Loss</Label>
                <Input type="number" step="any" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="bg-secondary/50 border-border/50 font-mono" placeholder="0.00" />
              </div>
              <div className="col-span-2 flex items-end">
                {pnl !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-2xl font-mono font-bold ${pnl >= 0 ? "text-profit" : "text-loss"}`}
                  >
                    {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1 border-border/50 text-muted-foreground">
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !asset} className="flex-1 bg-primary text-primary-foreground font-display tracking-wider glow-primary">
                {loading ? "Saving..." : "Log Trade"}
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default TradeForm;
