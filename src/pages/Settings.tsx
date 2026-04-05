import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ParticleBackground from "@/components/ParticleBackground";
import CursorTrail from "@/components/CursorTrail";
import {
  ArrowLeft, Palette, MousePointer2, Lock, RotateCcw, DollarSign, User, Monitor,
} from "lucide-react";

const TRAIL_COLORS = [
  { label: "Neon Green", value: "0, 255, 136" },
  { label: "Cyan", value: "0, 200, 255" },
  { label: "Purple", value: "160, 80, 255" },
  { label: "Gold", value: "255, 200, 0" },
  { label: "Red", value: "255, 80, 80" },
  { label: "White", value: "255, 255, 255" },
  { label: "Pink", value: "255, 100, 200" },
];

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
  };

  const handleUpdateBalance = async () => {
    if (!user || !newBalance) return;
    const amount = parseFloat(newBalance);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ account_balance: amount })
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account balance updated!" });
      setNewBalance("");
    }
  };

  const handleUpdateName = async () => {
    if (!user || !displayName.trim()) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Display name updated!" });
      setDisplayName("");
    }
  };

  const handleResetAccount = async () => {
    if (!user) return;
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    // Delete all trades and reset balance
    await supabase.from("trades").delete().eq("user_id", user.id);
    await supabase.from("profiles").update({ account_balance: 10000 }).eq("user_id", user.id);
    toast({ title: "Account reset!", description: "All trades cleared and balance reset to $10,000." });
    setResetConfirm(false);
  };

  const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 space-y-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-display text-sm uppercase tracking-wider text-foreground">{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <CursorTrail />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass-strong border-b border-border/30"
      >
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-lg font-bold tracking-wider text-foreground">SETTINGS</h1>
        </div>
      </motion.header>

      <main className="relative z-10 container mx-auto px-4 py-8 space-y-6 max-w-2xl">
        {/* Display Name */}
        <Section icon={User} title="Profile">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Display Name</Label>
            <div className="flex gap-3">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter new display name"
                className="bg-secondary/50 border-border/50"
              />
              <Button onClick={handleUpdateName} disabled={!displayName.trim()} className="bg-primary text-primary-foreground font-display text-xs tracking-wider">
                Update
              </Button>
            </div>
          </div>
        </Section>

        {/* Account Balance */}
        <Section icon={DollarSign} title="Account Balance">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Set New Balance</Label>
            <div className="flex gap-3">
              <Input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder="Enter new balance"
                className="bg-secondary/50 border-border/50 font-mono"
              />
              <Button onClick={handleUpdateBalance} disabled={!newBalance} className="bg-primary text-primary-foreground font-display text-xs tracking-wider">
                Update
              </Button>
            </div>
          </div>
        </Section>

        {/* Background */}
        <Section icon={Monitor} title="Background Style">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["particles", "matrix", "stars", "none"] as const).map((style) => (
              <button
                key={style}
                onClick={() => updateSettings({ backgroundStyle: style })}
                className={`py-3 rounded-lg text-xs font-display uppercase tracking-wider border transition-all ${
                  settings.backgroundStyle === style
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-secondary/30 border-border/50 text-muted-foreground hover:border-primary/30"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </Section>

        {/* Cursor Trail */}
        <Section icon={MousePointer2} title="Cursor Trail">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Trail Style</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["dots", "line", "glow", "none"] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateSettings({ trailStyle: style })}
                    className={`py-2 rounded-lg text-xs font-display uppercase tracking-wider border transition-all ${
                      settings.trailStyle === style
                        ? "bg-primary/20 border-primary/40 text-primary"
                        : "bg-secondary/30 border-border/50 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Trail Color</Label>
              <Select value={settings.trailColor} onValueChange={(v) => updateSettings({ trailColor: v })}>
                <SelectTrigger className="bg-secondary/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRAIL_COLORS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `rgb(${c.value})` }} />
                        {c.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Trail Width: {settings.trailWidth}px</Label>
              <Slider
                value={[settings.trailWidth]}
                onValueChange={([v]) => updateSettings({ trailWidth: v })}
                min={2}
                max={15}
                step={1}
                className="py-2"
              />
            </div>
          </div>
        </Section>

        {/* Background Color */}
        <Section icon={Palette} title="Particle Color">
          <Select value={settings.particleColor} onValueChange={(v) => updateSettings({ particleColor: v })}>
            <SelectTrigger className="bg-secondary/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRAIL_COLORS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `rgb(${c.value})` }} />
                    {c.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Section>

        {/* Change Password */}
        <Section icon={Lock} title="Change Password">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <Button onClick={handleChangePassword} disabled={passwordLoading || !newPassword} className="bg-primary text-primary-foreground font-display text-xs tracking-wider">
              {passwordLoading ? "Updating..." : "Change Password"}
            </Button>
          </div>
        </Section>

        {/* Reset Account */}
        <Section icon={RotateCcw} title="Reset Account">
          <p className="text-sm text-muted-foreground">
            This will delete all your trades and reset your balance to $10,000. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={handleResetAccount}
            className="font-display text-xs tracking-wider"
          >
            {resetConfirm ? "CONFIRM RESET — ARE YOU SURE?" : "RESET ACCOUNT"}
          </Button>
        </Section>

        {/* Reset Visual Settings */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
          <Button
            variant="outline"
            onClick={resetSettings}
            className="w-full border-border/50 text-muted-foreground font-display text-xs tracking-wider"
          >
            RESET ALL VISUAL SETTINGS TO DEFAULT
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;
