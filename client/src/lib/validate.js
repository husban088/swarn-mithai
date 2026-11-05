// Shared form validation (Sign up, Sign in, Checkout).
// Har function error message (string) return karta hai. Khali string = sab theek.

export const EMAIL_RE =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const NAME_RE = /^\p{L}[\p{L}\s.'’-]*$/u;
const CITY_RE = /^\p{L}[\p{L}\s.,'’-]*$/u;

export function vName(v) {
  const s = String(v || "").trim();
  if (!s) return "Please enter your full name.";
  if (s.length < 2) return "Name must be at least 2 letters.";
  if (!NAME_RE.test(s)) return "Name can only contain letters and spaces.";
  return "";
}

export function vEmail(v) {
  const s = String(v || "").trim();
  if (!s) return "Please enter your email address.";
  if (!EMAIL_RE.test(s))
    return "Enter a valid email address, like name@gmail.com.";
  return "";
}

export function vPassword(v) {
  if (!v) return "Please enter a password.";
  if (v.length < 6) return "Password must be at least 6 characters.";
  return "";
}

export function vConfirm(p, c) {
  if (!c) return "Please confirm your password.";
  if (p !== c) return "Passwords do not match.";
  return "";
}

export function vPhone(v, required = true) {
  const s = String(v || "").trim();
  if (!s) return required ? "Please enter your phone number." : "";
  if (!/^\+?[0-9\s\-()]+$/.test(s))
    return "Phone can only contain numbers, spaces, + and -.";
  const digits = s.replace(/\D/g, "").length;
  if (digits < 7 || digits > 15)
    return "Enter a valid phone number (7 to 15 digits).";
  return "";
}

export function vAddress(v) {
  const s = String(v || "").trim();
  if (!s) return "Please enter your delivery address.";
  if (s.length < 5) return "Address is too short. Add house / street details.";
  return "";
}

export function vCity(v) {
  const s = String(v || "").trim();
  if (!s) return "Please enter your city.";
  if (s.length < 2 || !CITY_RE.test(s)) return "Enter a valid city name.";
  return "";
}

export function vPostal(v) {
  const s = String(v || "").trim();
  if (!s) return "Please enter your postal code.";
  if (!/^[A-Za-z0-9][A-Za-z0-9\s-]{1,8}[A-Za-z0-9]$/.test(s))
    return "Enter a valid postal code (3 to 10 letters or numbers).";
  return "";
}
