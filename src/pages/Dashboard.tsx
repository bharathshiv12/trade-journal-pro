import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import ParticleBackground from "@/components/ParticleBackground";
import CursorTrail from "@/components/CursorTrail";
import AccountStats from "@/components/AccountStats";
import TradeForm from "@/components/TradeForm";
import TradeHistory from "@/components/TradeHistory";
import { Button } from "@/components/ui/button";
import { TrendingUp, LogOut, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [trades, setTrades] = useState<Tables<"trades">[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [newBalance, setNewBalance] = useState("");

  const fetchData = useCallback(async () => {
    if (!user) return;

    const [profileRes, tradesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("trades").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (tradesRes.data) setTrades(tradesRes.data);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateBalance = async () => {
    if (!user || !newBalance) return;
    const { error } = await supabase
      .from("profiles")
      .update({ account_balance: parseFloat(newBalance) })
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Balance updated!" });
      setShowSettings(false);
      setNewBalance("");
      fetchData();
    }
  };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <CursorTrail />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass-strong border-b border-border/30"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-lg font-bold tracking-wider text-foreground">
              TRADE<span className="text-primary">SMART</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.display_name || user?.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="text-muted-foreground hover:text-primary"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8 space-y-6 max-w-5xl">
        {/* Settings panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="glass rounded-xl p-6"
          >
            <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-4">Account Settings</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-xs text-muted-foreground">Set Account Balance</label>
                <Input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder={profile?.account_balance?.toString() || "10000"}
                  className="bg-secondary/50 border-border/50 font-mono"
                />
              </div>
              <Button onClick={updateBalance} className="bg-primary text-primary-foreground font-display text-xs tracking-wider">
                Update
              </Button>
            </div>
          </motion.div>
        )}

        <AccountStats profile={profile} trades={trades} />
        <TradeForm onTradeAdded={fetchData} />
        <TradeHistory trades={trades} />
      </main>
    </div>
  );
};

export default Dashboard;
