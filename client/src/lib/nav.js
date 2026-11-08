// Pichla aur maujooda page yaad rakhta hai (module-level, React state nahi).
// App.jsx har render par track() chalata hai; ProductDetail isse janta hai ke
// user Shop se aya tha ya nahi, taake "Back to shop" sahi pagination page par le jaye.
export const navTrack = { prev: "", cur: "" };

export function track(pathname) {
  if (navTrack.cur !== pathname) {
    navTrack.prev = navTrack.cur;
    navTrack.cur = pathname;
  }
}

export const SHOP_URL_KEY = "swarn:shopUrl";

export function lastShopUrl() {
  try {
    return sessionStorage.getItem(SHOP_URL_KEY) || "/shop";
  } catch {
    return "/shop";
  }
}
