import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserSettings {
  backgroundStyle: "particles" | "matrix" | "stars" | "none";
  trailStyle: "dots" | "line" | "glow" | "none";
  trailColor: string;
  trailWidth: number;
  particleColor: string;
}

const defaultSettings: UserSettings = {
  backgroundStyle: "particles",
  trailStyle: "dots",
  trailColor: "0, 255, 136",
  trailWidth: 6,
  particleColor: "0, 255, 136",
};

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem("tradesmart-settings");
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("tradesmart-settings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const resetSettings = () => setSettings(defaultSettings);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
