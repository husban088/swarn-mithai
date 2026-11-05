// Input ke neeche red error text. msg khali ho to kuch show nahi hota.
export default function FieldError({ id, msg }) {
  if (!msg) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
      {msg}
    </p>
  );
}

// Input par red border lagane ke liye
export const errCls = (msg) =>
  msg ? "!border-red-500 focus:!border-red-500 focus:!ring-red-100" : "";
