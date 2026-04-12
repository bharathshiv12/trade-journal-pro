export interface PasswordCheck {
  label: string;
  passed: boolean;
}

export const validatePassword = (password: string): PasswordCheck[] => [
  { label: "At least 8 characters", passed: password.length >= 8 },
  { label: "One uppercase letter (A-Z)", passed: /[A-Z]/.test(password) },
  { label: "One lowercase letter (a-z)", passed: /[a-z]/.test(password) },
  { label: "One number (0-9)", passed: /\d/.test(password) },
  { label: "One special character (!@#$%^&*)", passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password) },
];

export const isPasswordValid = (password: string): boolean =>
  validatePassword(password).every((c) => c.passed);

export const getPasswordStrength = (password: string): { label: string; percent: number; color: string } => {
  const passed = validatePassword(password).filter((c) => c.passed).length;
  if (passed <= 1) return { label: "Very Weak", percent: 20, color: "bg-red-500" };
  if (passed === 2) return { label: "Weak", percent: 40, color: "bg-orange-500" };
  if (passed === 3) return { label: "Fair", percent: 60, color: "bg-yellow-500" };
  if (passed === 4) return { label: "Strong", percent: 80, color: "bg-blue-500" };
  return { label: "Very Strong", percent: 100, color: "bg-green-500" };
};
