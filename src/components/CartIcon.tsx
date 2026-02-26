import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/use-cart";
import { useI18n } from "@/i18n";

const CartIcon = () => {
  const { itemCount } = useCart();
  const { lang } = useI18n();

  return (
    <Link
      to={`/${lang}/cart`}
      className="relative p-2 text-secondary-foreground hover:text-primary transition-colors"
      aria-label="Cart"
    >
      <ShoppingCart className="w-5 h-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full orange-gradient text-[10px] font-bold text-primary-foreground flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
