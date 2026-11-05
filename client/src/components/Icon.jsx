import {
  Building2,
  Droplets,
  Flame,
  Gem,
  Gift,
  HandHeart,
  Package,
  PartyPopper,
  ShieldCheck,
  Truck,
} from "lucide-react";

const MAP = {
  Building2,
  Droplets,
  Flame,
  Gem,
  Gift,
  HandHeart,
  Package,
  PartyPopper,
  ShieldCheck,
  Truck,
};

export default function Icon({ name, size = 26, className = "" }) {
  const C = MAP[name] || Gem;
  return <C size={size} className={className} />;
}
