import { useAuth } from "../store";
import { COUNTRY_SWITCH_EMAILS, SITE_COUNTRY } from "../config";
import { useAdminView } from "./adminView";

// Har admin sirf apni brand ka data dekhta hai (server user.adminScope bhejta hai):
//   wjahattahir@gmail.com           -> Pakistan, Evelyn One (aqua), PKR
//                                      + Admin page par Pakistan / USA dropdown (USA ke liye USA admin ka login)
//   shahidmahmood73@hotmail.com     -> USA, Mithai House (sweets), USD  (koi dropdown nahi)
export function useAdminScope() {
  const { user } = useAuth();
  const view = useAdminView();
  // Alag link (VITE_SITE_COUNTRY) par region dropdown nahi hota
  const isSuper =
    !SITE_COUNTRY &&
    COUNTRY_SWITCH_EMAILS.includes(String(user?.email || "").toLowerCase());
  // Super admin ne dusre region ka login kiya ho to us admin ka scope, warna apna
  const active = isSuper && view?.user ? view.user : user;
  const sc = active?.adminScope || null;
  if (!sc) return { ready: false };
  const pk = sc.country === "PK";
  return {
    ready: true,
    country: sc.country,
    category: sc.category,
    isPK: pk,
    isSuper,
    email: active.email,
    cur: pk ? "PKR" : "USD",
    brand: pk ? "Evelyn One" : "Mithai House",
    logo: pk ? "/brand/evelyn-one.svg" : "/brand/mithai-house.png",
    mark: pk ? "/brand/evelyn-one-mark.svg" : null,
    market: pk ? "Pakistan" : "USA",
  };
}
