import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ParticleBackground from "@/components/ParticleBackground";

interface AccountSetupProps {
  onComplete: () => void;
}

const AccountSetup = ({ onComplete }: AccountSetupProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);

  const parsedBalance = parseFloat(balance);
  const isValid = !isNaN(parsedBalance) && parsedBalance > 0;

  const handleSubmit = async () => {
    if (!user || !isValid) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ account_balance: parsedBalance })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      onComplete();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <ParticleBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-8 md:p-10 space-y-6">
          {/* Step badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-primary/40 text-primary text-xs font-display tracking-widest">
              STEP 2 OF 3
            </span>
          </motion.div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Set Your Account Balance
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter your total trading capital. All profits and losses will be tracked against this balance in real-time.
            </p>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label className="text-xs font-display tracking-widest text-primary">
              STARTING BALANCE (USD $)
            </label>
            <Input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0"
              className="bg-secondary/50 border-border/50 font-mono text-lg h-12"
            />
          </div>

          {/* Live preview */}
          <motion.div
            key={balance}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-1 py-2"
          >
            <p className="text-4xl md:text-5xl font-bold text-primary font-mono">
              ${isValid ? parsedBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
            </p>
            <p className="text-xs text-muted-foreground tracking-widest font-display">
              THIS WILL BE YOUR ACTIVE TRADING CAPITAL
            </p>
          </motion.div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className="w-full bg-primary text-primary-foreground font-display tracking-widest h-12 text-sm glow-primary"
          >
            {loading ? "INITIALIZING..." : "INITIALIZE ACCOUNT →"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountSetup;
