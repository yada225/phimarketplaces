import { useState } from "react";
import { X, Zap, Video } from "lucide-react";
import { useI18n } from "@/i18n";
import { motion, AnimatePresence } from "framer-motion";

const MEET_LINK = "https://meet.google.com/ogo-xuwe-soy";

const FlashBanner = () => {
  const [visible, setVisible] = useState(true);
  const { t } = useI18n();

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative bg-gradient-to-r from-primary via-[hsl(25,100%,58%)] to-primary overflow-hidden"
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-2 gap-3 min-h-[40px]">
          {/* Scrolling ticker */}
          <div className="flex-1 overflow-hidden relative">
            <div className="flex items-center gap-6 animate-marquee whitespace-nowrap">
              {[0, 1].map((dup) => (
                <span key={dup} className="inline-flex items-center gap-6 text-sm font-medium text-primary-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    {t.flash?.headline ?? "🔥 Discover PHI events & upcoming presentations!"}
                  </span>
                  <span className="text-primary-foreground/70">|</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 shrink-0" />
                    <a
                      href={MEET_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-primary-foreground/90 transition-colors"
                    >
                      {t.flash?.meetCta ?? "Join our live presentation →"}
                    </a>
                  </span>
                  <span className="text-primary-foreground/70">|</span>
                  <span>{t.flash?.nextEvent ?? "📅 Next event coming soon — Stay tuned!"}</span>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setVisible(false)}
            className="shrink-0 p-1 rounded hover:bg-primary-foreground/20 transition-colors text-primary-foreground"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FlashBanner;
