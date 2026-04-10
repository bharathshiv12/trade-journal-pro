import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import ParticleBackground from "@/components/ParticleBackground";
import CursorTrail from "@/components/CursorTrail";
import AccountStats from "@/components/AccountStats";
import AccountSetup from "@/components/AccountSetup";
import TradeForm from "@/components/TradeForm";
import TradeHistory from "@/components/TradeHistory";
import { Button } from "@/components/ui/button";
import { TrendingUp, LogOut, Settings } from "lucide-react";
import { useLivePrices } from "@/hooks/useLivePrices";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { prices: livePrices, loading: pricesLoading } = useLivePrices();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [trades, setTrades] = useState<Tables<"trades">[]>([]);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [profileRes, tradesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("trades").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    if (profileRes.data) {
      setProfile(profileRes.data);
      // Show setup if brand new account (default balance, no trades)
      if (profileRes.data.account_balance === 10000 && (!tradesRes.data || tradesRes.data.length === 0)) {
        setNeedsSetup(true);
      }
    }
    if (tradesRes.data) setTrades(tradesRes.data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (needsSetup) {
    return <AccountSetup onComplete={() => { setNeedsSetup(false); fetchData(); }} />;
  }

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <CursorTrail />

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
              onClick={() => navigate("/settings")}
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

      <main className="relative z-10 container mx-auto px-4 py-8 space-y-6 max-w-5xl">
        <AccountStats profile={profile} trades={trades} />
        <TradeForm onTradeAdded={fetchData} />
        <TradeHistory trades={trades} />
      </main>
    </div>
  );
};

export default Dashboard;
