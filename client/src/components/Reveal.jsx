import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Content hamesha visible rehta hai. Sirf wo sections jo screen ke neeche hain, scroll par
// halka sa animate hote hain. Observer na chale to 2.5 sec baad khud dikh jate hain.
//
// Speed: pehle har Reveal ka apna IntersectionObserver tha (page par 50+). Ab poore page ke liye
// ek hi shared observer hai, aur element dikhte hi observe karna band ho jata hai.
const callbacks = new WeakMap();
let sharedIO = null;
function getIO() {
  if (!sharedIO) {
    sharedIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const cb = callbacks.get(e.target);
          if (cb) cb();
        });
      },
      { threshold: 0.05 },
    );
  }
  return sharedIO;
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}) {
  const ref = useRef(null);
  const [state, setState] = useState("show"); // show | hide

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top > window.innerHeight) setState("hide");
  }, []);

  useEffect(() => {
    if (state !== "hide") return;
    const el = ref.current;
    if (!el) return;
    const io = getIO();
    const show = () => {
      io.unobserve(el);
      callbacks.delete(el);
      setState("show");
    };
    callbacks.set(el, show);
    const t = setTimeout(show, 2500);
    io.observe(el);
    return () => {
      clearTimeout(t);
      io.unobserve(el);
      callbacks.delete(el);
    };
  }, [state]);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: state === "show" ? `${delay}ms` : "0ms" }}
      className={`transition duration-700 ease-out ${state === "hide" ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"} ${className}`}
    >
      {children}
    </Tag>
  );
}
