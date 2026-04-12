import { validatePassword, getPasswordStrength } from "@/lib/passwordValidation";
import { Check, X } from "lucide-react";

interface Props {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: Props) => {
  if (!password) return null;

  const checks = validatePassword(password);
  const strength = getPasswordStrength(password);

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground uppercase tracking-wider">Strength</span>
          <span className="text-foreground font-medium">{strength.label}</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
            style={{ width: `${strength.percent}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 gap-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2 text-xs">
            {check.passed ? (
              <Check className="w-3 h-3 text-green-500 shrink-0" />
            ) : (
              <X className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            )}
            <span className={check.passed ? "text-green-500" : "text-muted-foreground/60"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
