import { useAuth } from "../store";

// Har admin sirf apni brand ka data dekhta hai (server user.adminScope bhejta hai):
//   wjahattahir@gmail.com           -> Pakistan, Apna Pani (aqua), PKR
//   shahidmahmood73@hotmail.com     -> USA, Mithai House (sweets), USD
export function useAdminScope() {
  const { user } = useAuth();
  const sc = user?.adminScope || null;
  if (!sc) return { ready: false };
  const pk = sc.country === "PK";
  return {
    ready: true,
    country: sc.country,
    category: sc.category,
    isPK: pk,
    cur: pk ? "PKR" : "USD",
    brand: pk ? "Apna Pani" : "Mithai House",
    logo: pk ? "/brand/apna-pani.png" : "/brand/mithai-house.png",
    market: pk ? "Pakistan" : "USA",
  };
}
