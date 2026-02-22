import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { Quote, MapPin } from "lucide-react";

const Testimonials = () => {
  const { t } = useI18n();

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">{t.testimonials.title}</h1>
          <p className="mt-3 text-muted-foreground">{t.testimonials.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {t.testimonials.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-3" />
              <p className="text-foreground italic leading-relaxed">{item.text}</p>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <p className="font-heading font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-primary font-medium">{item.role}</p>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
