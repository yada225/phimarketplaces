import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">{t.contact.title}</h1>
          <p className="mt-3 text-muted-foreground">{t.contact.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-6">
            {[
              { icon: Mail, label: t.contact.info.email },
              { icon: Phone, label: t.contact.info.phone },
              { icon: MapPin, label: t.contact.info.address },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg orange-gradient flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-sm text-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="md:col-span-2 space-y-4"
          >
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full orange-gradient flex items-center justify-center mx-auto mb-4">
                  <Send className="w-7 h-7 text-primary-foreground" />
                </div>
                <p className="text-lg font-heading font-semibold text-foreground">
                  {t.contact.submit} ✓
                </p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">{t.contact.nameLabel}</label>
                    <input
                      required
                      className="mt-1 w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">{t.contact.emailLabel}</label>
                    <input
                      type="email"
                      required
                      className="mt-1 w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">{t.contact.phoneLabel}</label>
                    <input
                      className="mt-1 w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">{t.contact.subjectLabel}</label>
                    <select className="mt-1 w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      {t.contact.subjects.map((s, i) => (
                        <option key={i}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">{t.contact.messageLabel}</label>
                  <textarea
                    required
                    rows={5}
                    className="mt-1 w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg orange-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                  {t.contact.submit}
                </button>
              </>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
