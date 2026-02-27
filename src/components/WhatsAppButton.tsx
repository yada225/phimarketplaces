import { MessageCircle } from "lucide-react";

const OFFICIAL_WHATSAPP = "2347031525681";

interface WhatsAppButtonProps {
  shopWhatsApp?: string | null;
}

const WhatsAppButton = ({ shopWhatsApp }: WhatsAppButtonProps) => {
  const number = shopWhatsApp || OFFICIAL_WHATSAPP;

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
};

export { OFFICIAL_WHATSAPP };
export default WhatsAppButton;
