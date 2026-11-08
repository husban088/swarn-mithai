import { useEffect, useState } from "react";

// Super admin (wjahattahir@gmail.com) Admin page par Pakistan / USA dropdown se region badalta hai.
// Region badalne par us region ke admin ki login details poochi jati hain; verify hone ke baad
// us admin ka session yahan (sessionStorage, sirf is tab me) rakha jata hai.
// Sirf "/admin..." API calls is session se jati hain, baqi website apne asli login par chalti hai.
const KEY = "swarn_admin_view";
const EV = "admin-view-change";

export const getAdminView = () => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY));
  } catch {
    return null;
  }
};
export const setAdminView = (v) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EV));
};
export const clearAdminView = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EV));
};

export function useAdminView() {
  const [v, setV] = useState(getAdminView);
  useEffect(() => {
    const f = () => setV(getAdminView());
    window.addEventListener(EV, f);
    return () => window.removeEventListener(EV, f);
  }, []);
  return v;
}
