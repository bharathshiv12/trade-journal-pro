import { useMemo } from "react";
import { motion } from "framer-motion";
import { Tables } from "@/integrations/supabase/types";
import { format, parseISO, startOfDay } from "date-fns";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface DashboardChartsProps {
  trades: Tables<"trades">[];
  accountBalance: number;
}

const COLORS = {
  profit: "hsl(142, 76%, 36%)",
  loss: "hsl(0, 84%, 60%)",
  primary: "hsl(217, 91%, 60%)",
  muted: "hsl(215, 20%, 65%)",
};

const ASSET_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 76%, 36%)",
  "hsl(45, 93%, 47%)",
  "hsl(0, 84%, 60%)",
  "hsl(280, 67%, 55%)",
  "hsl(190, 80%, 45%)",
  "hsl(340, 75%, 55%)",
  "hsl(30, 90%, 50%)",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-background/95 backdrop-blur px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-mono">
          {p.name}: {typeof p.value === "number" ? `$${p.value.toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  );
};

const DashboardCharts = ({ trades, accountBalance }: DashboardChartsProps) => {
  const closedTrades = useMemo(
    () => trades.filter((t) => t.status === "closed" && t.profit_loss !== null),
    [trades]
  );

  // Equity curve data
  const equityCurve = useMemo(() => {
    if (closedTrades.length === 0) return [];
    const sorted = [...closedTrades].sort(
      (a, b) => new Date(a.closed_at || a.created_at).getTime() - new Date(b.closed_at || b.created_at).getTime()
    );
    const startingBalance = accountBalance - sorted.reduce((s, t) => s + (Number(t.profit_loss) || 0), 0);
    let running = startingBalance;
    return sorted.map((t, i) => {
      running += Number(t.profit_loss) || 0;
      return {
        trade: `#${i + 1}`,
        balance: parseFloat(running.toFixed(2)),
        date: format(new Date(t.closed_at || t.created_at), "MMM dd"),
      };
    });
  }, [closedTrades, accountBalance]);

  // Daily P&L
  const dailyPnL = useMemo(() => {
    if (closedTrades.length === 0) return [];
    const byDay: Record<string, number> = {};
    closedTrades.forEach((t) => {
      const day = format(startOfDay(new Date(t.closed_at || t.created_at)), "MMM dd");
      byDay[day] = (byDay[day] || 0) + (Number(t.profit_loss) || 0);
    });
    return Object.entries(byDay).map(([day, pnl]) => ({
      day,
      pnl: parseFloat(pnl.toFixed(2)),
      fill: pnl >= 0 ? COLORS.profit : COLORS.loss,
    }));
  }, [closedTrades]);

  // Win/Loss distribution
  const winLoss = useMemo(() => {
    const wins = closedTrades.filter((t) => Number(t.profit_loss) > 0).length;
    const losses = closedTrades.filter((t) => Number(t.profit_loss) <= 0).length;
    if (wins === 0 && losses === 0) return [];
    return [
      { name: "Wins", value: wins, color: COLORS.profit },
      { name: "Losses", value: losses, color: COLORS.loss },
    ];
  }, [closedTrades]);

  // Performance by asset category
  const assetPerformance = useMemo(() => {
    if (closedTrades.length === 0) return [];
    const byAsset: Record<string, { pnl: number; count: number }> = {};
    closedTrades.forEach((t) => {
      const asset = t.asset;
      if (!byAsset[asset]) byAsset[asset] = { pnl: 0, count: 0 };
      byAsset[asset].pnl += Number(t.profit_loss) || 0;
      byAsset[asset].count++;
    });
    return Object.entries(byAsset)
      .map(([asset, data]) => ({
        asset,
        pnl: parseFloat(data.pnl.toFixed(2)),
        trades: data.count,
        fill: data.pnl >= 0 ? COLORS.profit : COLORS.loss,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [closedTrades]);

  if (closedTrades.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Close some trades to see your performance charts here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
        Performance Analytics
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Equity Curve */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-5"
        >
          <h4 className="text-sm font-display font-semibold text-foreground mb-4">Equity Curve</h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 20%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215, 20%, 65%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 65%)" }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name="Balance"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  dot={{ r: 3, fill: COLORS.primary }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Daily P&L */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-5"
        >
          <h4 className="text-sm font-display font-semibold text-foreground mb-4">Daily P&L</h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPnL}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 20%)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215, 20%, 65%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 65%)" }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pnl" name="P&L" radius={[4, 4, 0, 0]}>
                  {dailyPnL.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Win/Loss Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-5"
        >
          <h4 className="text-sm font-display font-semibold text-foreground mb-4">Win/Loss Distribution</h4>
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winLoss}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {winLoss.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} trades`, name]}
                  contentStyle={{
                    background: "hsl(222, 47%, 11%)",
                    border: "1px solid hsl(215, 20%, 20%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Performance by Asset */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-5"
        >
          <h4 className="text-sm font-display font-semibold text-foreground mb-4">P&L by Asset</h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 20%)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215, 20%, 65%)" }} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="asset" tick={{ fontSize: 10, fill: "hsl(215, 20%, 65%)" }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pnl" name="P&L" radius={[0, 4, 4, 0]}>
                  {assetPerformance.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardCharts;
