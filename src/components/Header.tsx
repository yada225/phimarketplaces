import { Link, useLocation } from "react-router-dom";
import { useI18n, type Lang } from "@/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Menu, X, Globe, User } from "lucide-react";
import CartIcon from "@/components/CartIcon";

const Header = () => {
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const otherLang: Lang = lang === "fr" ? "en" : "fr";

  const navItems = [
    { label: t.nav.home, path: `/${lang}` },
    { label: t.nav.products, path: `/${lang}/products` },
    { label: t.nav.compensation, path: `/${lang}/compensation` },
    { label: t.nav.kits, path: `/${lang}/kits` },
    { label: t.nav.shops, path: `/${lang}/shops` },
    { label: t.nav.testimonials, path: `/${lang}/testimonials` },
    { label: t.nav.contact, path: `/${lang}/contact` },
  ];

  const switchPath = location.pathname.replace(`/${lang}`, `/${otherLang}`);

  return (
    <header className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-md border-b border-border/30">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to={`/${lang}`} className="flex items-center gap-2">
          <span className="text-xl font-heading font-bold text-primary-foreground">
            PHI<span className="text-primary"> & Marketplaces</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                location.pathname === item.path
                  ? "text-primary bg-primary/10"
                  : "text-secondary-foreground/80 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CartIcon />

          {user ? (
            <Link
              to={`/${lang}/dashboard`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <User className="w-4 h-4" />
              {lang === "fr" ? "Mon espace" : "Dashboard"}
            </Link>
          ) : (
            <Link
              to={`/${lang}/auth`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <User className="w-4 h-4" />
              {lang === "fr" ? "Connexion" : "Sign In"}
            </Link>
          )}

          <Link
            to={switchPath}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Globe className="w-4 h-4" />
            {otherLang.toUpperCase()}
          </Link>

          <button
            className="lg:hidden p-2 text-secondary-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="lg:hidden bg-secondary border-t border-border/30 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                location.pathname === item.path
                  ? "text-primary bg-primary/10"
                  : "text-secondary-foreground/80 hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
