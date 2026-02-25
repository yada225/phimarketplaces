import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { CountryCode } from "@/lib/pricing";

interface CountryContextType {
  country: CountryCode;
  setCountry: (c: CountryCode) => void;
}

const CountryContext = createContext<CountryContextType>({
  country: "CIV",
  setCountry: () => {},
});

export const useCountry = () => useContext(CountryContext);

export const CountryProvider = ({ children }: { children: ReactNode }) => {
  const [country, setCountryState] = useState<CountryCode>(() => {
    const saved = localStorage.getItem("phi-country");
    if (saved === "NG" || saved === "CIV" || saved === "OTHER") return saved;
    return "CIV";
  });
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("phi-country");
    if (saved) {
      setDetected(true);
      return;
    }
    // Auto-detect via timezone heuristic
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.startsWith("Africa/Lagos")) {
        setCountryState("NG");
      } else if (tz.startsWith("Africa/Abidjan")) {
        setCountryState("CIV");
      } else {
        setCountryState("OTHER");
      }
    } catch {
      // keep default
    }
    setDetected(true);
  }, []);

  const setCountry = (c: CountryCode) => {
    setCountryState(c);
    localStorage.setItem("phi-country", c);
  };

  if (!detected) return null;

  return (
    <CountryContext.Provider value={{ country, setCountry }}>
      {children}
    </CountryContext.Provider>
  );
};
