import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AccountSetupProps {
  onComplete: () => void;
}

const presets = [1000, 5000, 10000, 25000, 50000, 100000];

const AccountSetup = ({ onComplete }: AccountSetupProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !balance) return;
    const amount = parseFloat(balance);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid account size.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ account_balance: amount })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      onComplete();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-strong rounded-2xl p-8 w-full max-w-md mx-4 space-y-6"
      >
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
          >
            <Wallet className="w-8 h-8 text-primary" />
          </motion.div>
          <h2 className="font-display text-xl font-bold text-foreground tracking-wider">
            SET YOUR ACCOUNT SIZE
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your starting capital to begin tracking your trades.
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="Enter account size"
              className="pl-9 bg-secondary/50 border-border/50 font-mono text-lg h-12"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBalance(p.toString())}
                className={`py-2 rounded-lg text-xs font-mono border transition-all ${
                  balance === p.toString()
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-secondary/30 border-border/50 text-muted-foreground hover:border-primary/30"
                }`}
              >
                ${p.toLocaleString()}
              </motion.button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !balance}
          className="w-full bg-primary text-primary-foreground font-display tracking-wider h-12 glow-primary"
        >
          {loading ? "Setting up..." : "START TRADING"}
        </Button>
      </motion.div>
    </div>
  );
};

export default AccountSetup;
