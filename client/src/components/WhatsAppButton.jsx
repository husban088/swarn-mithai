import { useGeo } from "../store";
import { COUNTRIES } from "../config";

// Har page ke bottom-right par floating WhatsApp button.
// Pakistan = +92 304 5157004, USA = +1 (927) 937-8117 (numbers config.js ke COUNTRIES se aate hain).
const digits = (s) => String(s || "").replace(/\D/g, "");

const CSS = `
.wa-wrap{position:fixed;z-index:90;right:max(18px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));display:flex;align-items:center;flex-direction:row-reverse;gap:0;animation:waIn .9s cubic-bezier(.2,.9,.25,1.2) .6s both}
.wa-btn{position:relative;display:grid;place-items:center;width:62px;height:62px;border-radius:9999px;color:#fff;text-decoration:none;isolation:isolate;
  background:radial-gradient(circle at 30% 25%,#5CF28F 0%,#25D366 45%,#128C7E 100%);
  box-shadow:0 12px 30px -8px rgba(18,140,126,.65),0 0 0 3px rgba(255,255,255,.9),0 0 0 4px rgba(212,175,55,.55);
  animation:waFloat 4.5s ease-in-out infinite;transition:transform .45s cubic-bezier(.2,.9,.25,1.3),box-shadow .45s ease}
.wa-btn::before,.wa-btn::after{content:"";position:absolute;inset:0;border-radius:inherit;background:rgba(37,211,102,.45);z-index:-1;animation:waPulse 2.6s ease-out infinite}
.wa-btn::after{animation-delay:1.3s}
.wa-btn svg{width:32px;height:32px;fill:currentColor;filter:drop-shadow(0 2px 3px rgba(0,0,0,.25));transition:transform .5s cubic-bezier(.2,.9,.25,1.4)}
.wa-shine{position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none}
.wa-shine::after{content:"";position:absolute;top:-20%;bottom:-20%;width:38%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.65),transparent);transform:skewX(-18deg);animation:waSheen 5s ease-in-out 1.5s infinite}
.wa-tip{display:flex;align-items:center;max-width:0;opacity:0;overflow:hidden;white-space:nowrap;margin-right:0;padding:0;height:46px;border-radius:9999px 0 0 9999px;
  background:linear-gradient(135deg,#0B0B0D,#1C1C21);color:#F5E6B8;font:700 12.5px/1 Manrope,system-ui,sans-serif;letter-spacing:.06em;
  border:1px solid rgba(212,175,55,.55);border-right:0;box-shadow:0 12px 26px -10px rgba(0,0,0,.55);
  transition:max-width .5s cubic-bezier(.2,.9,.25,1),opacity .35s ease,padding .5s ease,margin .5s ease}
.wa-tip small{display:block;font-weight:600;font-size:10px;letter-spacing:.12em;color:#9fdcb4;margin-top:3px}
.wa-wrap:hover .wa-tip,.wa-wrap:focus-within .wa-tip{max-width:230px;opacity:1;padding:0 26px 0 18px;margin-right:-22px}
.wa-wrap:hover .wa-btn,.wa-btn:focus-visible{transform:scale(1.12) rotate(-8deg);box-shadow:0 18px 38px -8px rgba(18,140,126,.8),0 0 0 3px #fff,0 0 0 5px rgba(212,175,55,.9)}
.wa-wrap:hover .wa-btn svg{transform:scale(1.1) rotate(8deg)}
.wa-btn:active{transform:scale(.92)}
.wa-dot{position:absolute;top:2px;right:2px;width:13px;height:13px;border-radius:9999px;background:#ff3b30;border:2px solid #fff;animation:waBlink 1.8s ease-in-out infinite}
@keyframes waIn{from{opacity:0;transform:translateY(40px) scale(.4)}to{opacity:1;transform:none}}
@keyframes waFloat{0%,100%{translate:0 0}50%{translate:0 -7px}}
@keyframes waPulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.9);opacity:0}}
@keyframes waSheen{0%{left:-60%}30%,100%{left:170%}}
@keyframes waBlink{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
@media (max-width:640px){.wa-btn{width:56px;height:56px}.wa-btn svg{width:29px;height:29px}.wa-tip{display:none}.wa-wrap{right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom))}}
@media print{.wa-wrap{display:none}}
@media (prefers-reduced-motion:reduce){.wa-wrap,.wa-btn,.wa-btn::before,.wa-btn::after,.wa-shine::after,.wa-dot{animation:none!important}}
`;

export default function WhatsAppButton() {
  const { country } = useGeo();
  const c = COUNTRIES[country?.code] || COUNTRIES.US;
  const num = digits(c.phone);
  const text = encodeURIComponent(
    country?.code === "PK"
      ? "Assalam o Alaikum! I would like to know more about your products."
      : "Hello! I would like to know more about your mithai.",
  );
  return (
    <div className="wa-wrap">
      <style>{CSS}</style>
      <a
        className="wa-btn"
        href={`https://wa.me/${num}?text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat on WhatsApp ${c.phone}`}
        title="Chat on WhatsApp"
      >
        <span className="wa-shine" />
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="wa-dot" />
      </a>
      <div className="wa-tip" aria-hidden="true">
        <span>
          Chat on WhatsApp
          <small>{c.phone}</small>
        </span>
      </div>
    </div>
  );
}
