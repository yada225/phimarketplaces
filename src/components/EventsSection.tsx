import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Video, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const MEET_LINK = "https://meet.google.com/ogo-xuwe-soy";

const EventsSection = () => {
  const { lang, t } = useI18n();
  const events = t.events;

  return (
    <section className="section-padding bg-secondary text-secondary-foreground">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase orange-gradient text-primary-foreground mb-4">
            <CalendarDays className="w-3.5 h-3.5" />
            {events?.badge ?? "Upcoming"}
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold">{events?.title ?? "PHI Events"}</h2>
          <p className="mt-4 text-secondary-foreground/70">{events?.subtitle ?? "Don't miss our upcoming events and presentations"}</p>
        </motion.div>

        {/* Events grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {(events?.items ?? defaultEvents).map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl overflow-hidden border border-border/20 bg-secondary-foreground/5 hover:bg-secondary-foreground/10 transition-colors group"
            >
              {/* Image placeholder — user will upload real images */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                {ev.image ? (
                  <img src={ev.image} alt={ev.name} className="w-full h-full object-cover" />
                ) : (
                  <CalendarDays className="w-16 h-16 text-primary/30" />
                )}
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-bold orange-gradient text-primary-foreground">
                  {ev.date}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-semibold text-lg">{ev.name}</h3>
                <p className="text-sm text-secondary-foreground/60 mt-1">{ev.desc}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-secondary-foreground/50">
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Meet CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl border border-primary/30 bg-primary/10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left"
        >
          <div className="w-14 h-14 rounded-full orange-gradient flex items-center justify-center shrink-0">
            <Video className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-bold text-xl">{events?.meetTitle ?? "Live Presentation – PHI Business Plan"}</h3>
            <p className="text-sm text-secondary-foreground/60 mt-1">
              {events?.meetDesc ?? "Join us online to discover PHI products, the compensation plan and how to get started."}
            </p>
          </div>
          <a
            href={MEET_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg orange-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity shrink-0"
          >
            {events?.meetCta ?? "Join the meeting"}
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

const defaultEvents = [
  { name: "PHI Grand Launch Abidjan", date: "25 Avr 2026", desc: "Lancement officiel de PHI en Côte d'Ivoire avec présentation des produits et du plan d'affaire.", location: "Abidjan, CI", image: "" },
  { name: "PHI Health Webinar", date: "10 Mai 2026", desc: "Webinaire sur la santé digestive et les bienfaits de nos compléments alimentaires.", location: "En ligne", image: "" },
  { name: "PHI Business Bootcamp", date: "22 Mai 2026", desc: "Formation intensive pour les nouveaux partenaires sur le plan de compensation.", location: "Lagos, Nigeria", image: "" },
];

export default EventsSection;
