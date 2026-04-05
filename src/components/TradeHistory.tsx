import { motion } from "framer-motion";
import { Tables } from "@/integrations/supabase/types";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { format } from "date-fns";

interface TradeHistoryProps {
  trades: Tables<"trades">[];
}

const TradeHistory = ({ trades }: TradeHistoryProps) => {
  if (trades.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No trades yet. Start logging your trades!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">Trade History</h3>
      {trades.map((trade, index) => (
        <motion.div
          key={trade.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="glass rounded-xl p-4 hover:border-primary/20 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${trade.direction === "long" ? "bg-profit/10" : "bg-loss/10"}`}>
                {trade.direction === "long" ? (
                  <TrendingUp className="w-4 h-4 text-profit" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-loss" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-semibold text-foreground">{trade.asset}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-display ${
                    trade.direction === "long" ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                  }`}>
                    {trade.direction.toUpperCase()}
                  </span>
                  {trade.leverage > 1 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
                      {trade.leverage}x
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-mono">
                  <span>Entry: ${Number(trade.entry_price).toFixed(2)}</span>
                  {trade.exit_price && <span>Exit: ${Number(trade.exit_price).toFixed(2)}</span>}
                  <span>Size: ${Number(trade.position_size).toFixed(0)}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              {trade.status === "closed" && trade.profit_loss !== null ? (
                <div className={`font-mono font-bold text-lg ${Number(trade.profit_loss) >= 0 ? "text-profit" : "text-loss"}`}>
                  {Number(trade.profit_loss) >= 0 ? "+" : ""}${Number(trade.profit_loss).toFixed(2)}
                </div>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-display">OPEN</span>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                {format(new Date(trade.created_at), "MMM dd, HH:mm")}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TradeHistory;
