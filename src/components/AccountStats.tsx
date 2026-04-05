import { motion } from "framer-motion";
import { Tables } from "@/integrations/supabase/types";
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Trophy, Skull, Hash } from "lucide-react";

interface AccountStatsProps {
  profile: Tables<"profiles"> | null;
  trades: Tables<"trades">[];
}

const AccountStats = ({ profile, trades }: AccountStatsProps) => {
  const closedTrades = trades.filter((t) => t.status === "closed");
  const totalPnL = closedTrades.reduce((sum, t) => sum + (Number(t.profit_loss) || 0), 0);
  const winRate = closedTrades.length > 0
    ? (closedTrades.filter((t) => Number(t.profit_loss) > 0).length / closedTrades.length) * 100
    : 0;
  const openTrades = trades.filter((t) => t.status === "open").length;
  const bestTrade = closedTrades.length > 0
    ? Math.max(...closedTrades.map((t) => Number(t.profit_loss) || 0))
    : 0;
  const worstTrade = closedTrades.length > 0
    ? Math.min(...closedTrades.map((t) => Number(t.profit_loss) || 0))
    : 0;

  const stats = [
    {
      label: "Account Balance",
      value: `$${Number(profile?.account_balance ?? 10000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total P&L",
      value: `${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}`,
      icon: totalPnL >= 0 ? TrendingUp : TrendingDown,
      color: totalPnL >= 0 ? "text-profit" : "text-loss",
      bg: totalPnL >= 0 ? "bg-profit/10" : "bg-loss/10",
    },
    {
      label: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      icon: BarChart3,
      color: winRate >= 50 ? "text-profit" : "text-loss",
      bg: winRate >= 50 ? "bg-profit/10" : "bg-loss/10",
    },
    {
      label: "Total Trades",
      value: trades.length.toString(),
      icon: Hash,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Open Trades",
      value: openTrades.toString(),
      icon: BarChart3,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Best Trade",
      value: bestTrade > 0 ? `+$${bestTrade.toFixed(2)}` : "$0.00",
      icon: Trophy,
      color: "text-profit",
      bg: "bg-profit/10",
    },
    {
      label: "Worst Trade",
      value: worstTrade < 0 ? `-$${Math.abs(worstTrade).toFixed(2)}` : "$0.00",
      icon: Skull,
      color: "text-loss",
      bg: "bg-loss/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className="glass rounded-xl p-5 hover:border-primary/20 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-display">{stat.label}</span>
          </div>
          <div className={`text-xl font-mono font-bold ${stat.color}`}>
            {stat.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AccountStats;
