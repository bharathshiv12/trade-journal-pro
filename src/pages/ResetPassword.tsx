import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ParticleBackground from "@/components/ParticleBackground";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!", description: "You can now sign in with your new password." });
      navigate("/");
    }
    setLoading(false);
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ParticleBackground />
        <div className="glass-strong rounded-2xl p-8 text-center relative z-10">
          <p className="text-muted-foreground">Invalid or expired reset link.</p>
          <Button onClick={() => navigate("/auth")} className="mt-4 bg-primary text-primary-foreground">Back to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <ParticleBackground />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl p-8 w-full max-w-md mx-4 relative z-10">
        <h2 className="text-xl font-display font-semibold mb-6 text-foreground">Set New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="pl-10 bg-secondary/50 border-border/50" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground font-display">
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
