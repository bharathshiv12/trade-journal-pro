import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ParticleBackground from "@/components/ParticleBackground";
import { TrendingUp, Mail, Lock, User, ArrowRight } from "lucide-react";

type AuthMode = "login" | "signup" | "forgot";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/");
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast({ title: "Account created!", description: "Check your email to verify your account." });
      } else {
        const { error } = await resetPassword(email);
        if (error) throw error;
        toast({ title: "Reset link sent!", description: "Check your email for the password reset link." });
      }
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticleBackground />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 glow-primary">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold tracking-wider text-foreground">
              TRADE<span className="text-primary">SMART</span>
            </h1>
          </motion.div>
          <p className="text-muted-foreground text-sm">Your intelligent trading journal</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-display font-semibold mb-6 text-foreground">
                {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Reset Password"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-muted-foreground text-sm">Display Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trader@example.com"
                      required
                      className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-muted-foreground text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider glow-primary"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 space-y-2 text-center text-sm">
                {mode === "login" && (
                  <>
                    <button onClick={() => setMode("forgot")} className="text-primary hover:text-primary/80 transition-colors block w-full">
                      Forgot password?
                    </button>
                    <p className="text-muted-foreground">
                      Don't have an account?{" "}
                      <button onClick={() => setMode("signup")} className="text-primary hover:text-primary/80 transition-colors">
                        Sign up
                      </button>
                    </p>
                  </>
                )}
                {mode === "signup" && (
                  <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <button onClick={() => setMode("login")} className="text-primary hover:text-primary/80 transition-colors">
                      Sign in
                    </button>
                  </p>
                )}
                {mode === "forgot" && (
                  <button onClick={() => setMode("login")} className="text-primary hover:text-primary/80 transition-colors">
                    Back to sign in
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
