import { useCountry } from "@/hooks/use-country";
import type { CountryCode } from "@/lib/pricing";
import { MapPin } from "lucide-react";

const countries: { code: CountryCode; label: string; flag: string }[] = [
  { code: "NG", label: "Nigeria", flag: "🇳🇬" },
  { code: "CIV", label: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "OTHER", label: "Autre / Other", flag: "🌍" },
];

const CountrySelector = () => {
  const { country, setCountry } = useCountry();

  return (
    <div className="inline-flex items-center gap-2 bg-muted rounded-lg p-1">
      <MapPin className="w-4 h-4 text-muted-foreground ml-2" />
      {countries.map((c) => (
        <button
          key={c.code}
          onClick={() => setCountry(c.code)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            country === c.code
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="mr-1">{c.flag}</span>
          {c.label}
        </button>
      ))}
    </div>
  );
};

export default CountrySelector;
