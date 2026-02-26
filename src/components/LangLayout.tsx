import { Outlet, useParams, Navigate } from "react-router-dom";
import { I18nContext, getTranslations, type Lang } from "@/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const LangLayout = () => {
  const { lang } = useParams<{ lang: string }>();

  if (lang !== "fr" && lang !== "en") {
    return <Navigate to="/fr" replace />;
  }

  const validLang = lang as Lang;
  const t = getTranslations(validLang);

  return (
    <I18nContext.Provider value={{ lang: validLang, t }}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </I18nContext.Provider>
  );
};

export default LangLayout;
