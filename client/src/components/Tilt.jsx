import { useRef } from "react";

// Mouse ke saath halka 3D tilt + shine (sirf hover wali devices par).
// Speed: rect sirf hover shuru hote hi liya jata hai aur transform requestAnimationFrame se lagta hai
// (pehle har mouse-move par layout padhna padta tha).
export default function Tilt({ children, className = "", max = 7 }) {
  const ref = useRef(null);
  const rect = useRef(null);
  const raf = useRef(0);
  const pos = useRef({ x: 0, y: 0 });

  const enter = () => {
    const el = ref.current;
    if (el) rect.current = el.getBoundingClientRect();
  };
  const paint = () => {
    raf.current = 0;
    const el = ref.current;
    if (!el) return;
    const { x, y } = pos.current;
    el.style.transform = `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateY(-4px)`;
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };
  const move = (e) => {
    const el = ref.current;
    if (!el) return;
    if (!rect.current) rect.current = el.getBoundingClientRect();
    const r = rect.current;
    pos.current = {
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
    };
    if (!raf.current) raf.current = requestAnimationFrame(paint);
  };
  const leave = () => {
    rect.current = null;
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    }
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <div
      ref={ref}
      onMouseEnter={enter}
      onMouseMove={move}
      onMouseLeave={leave}
      style={{ transition: "transform .35s cubic-bezier(.2,.7,.2,1)" }}
      className={`relative ${className}`}
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(260px circle at var(--mx,50%) var(--my,50%), rgba(122,185,243,.30), transparent 60%)",
        }}
      />
    </div>
  );
}
