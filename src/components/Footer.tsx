import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  const { lang, t } = useI18n();

  const navItems = [
    { label: t.nav.home, path: `/${lang}` },
    { label: t.nav.products, path: `/${lang}/products` },
    { label: t.nav.compensation, path: `/${lang}/compensation` },
    { label: t.nav.kits, path: `/${lang}/kits` },
    { label: t.nav.contact, path: `/${lang}/contact` },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-heading font-bold mb-3">
              PHI<span className="text-primary"> & Marketplaces</span>
            </h3>
            <p className="text-secondary-foreground/70 text-sm max-w-md">{t.footer.description}</p>
            <div className="flex gap-3 mt-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-3">{t.footer.quickLinks}</h4>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-3">{t.footer.legal}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">{t.footer.privacy}</a></li>
              <li><a href="#" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">{t.footer.terms}</a></li>
            </ul>
            <div className="mt-6">
              <p className="text-sm text-secondary-foreground/70">{t.contact.info.email}</p>
              <p className="text-sm text-secondary-foreground/70">{t.contact.info.phone}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 mt-8 pt-6 text-center">
          <p className="text-xs text-secondary-foreground/50">
            © {new Date().getFullYear()} PHI & Marketplaces. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
