import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* ── Font Awesome CDN injected once ── */
if (!document.getElementById("fa-cdn")) {
  const link = document.createElement("link");
  link.id = "fa-cdn";
  link.rel = "stylesheet";
  link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
  document.head.appendChild(link);
}

/* ── Keyframe animations injected once ── */
if (!document.getElementById("bts-animations")) {
  const style = document.createElement("style");
  style.id = "bts-animations";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-40px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideLeft {
      from { opacity: 0; transform: translateX(40px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.88); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes blobFloat {
      0%,100% { transform: translateY(0) scale(1); }
      50%      { transform: translateY(-18px) scale(1.04); }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(76,175,80,0.4); }
      70%  { box-shadow: 0 0 0 14px rgba(76,175,80,0); }
      100% { box-shadow: 0 0 0 0 rgba(76,175,80,0); }
    }
    @keyframes spin-slow {
      to { transform: rotate(360deg); }
    }
    @keyframes dash {
      from { stroke-dashoffset: 200; }
      to   { stroke-dashoffset: 0; }
    }

    .animate-fadeUp   { animation: fadeUp 0.7s ease both; }
    .animate-fadeIn   { animation: fadeIn 0.6s ease both; }
    .animate-slideR   { animation: slideRight 0.7s ease both; }
    .animate-slideL   { animation: slideLeft 0.7s ease both; }
    .animate-scaleIn  { animation: scaleIn 0.6s ease both; }
    .animate-blob     { animation: blobFloat 6s ease-in-out infinite; }
    .animate-pulse-ring { animation: pulse-ring 2s ease-out infinite; }

    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; }
    .delay-400 { animation-delay: 0.4s; }
    .delay-500 { animation-delay: 0.5s; }
    .delay-600 { animation-delay: 0.6s; }

    .hover-lift { transition: transform 0.25s ease, box-shadow 0.25s ease; }
    .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(76,175,80,0.18) !important; }

    .nav-link { position: relative; }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px; left: 0;
      width: 0; height: 2px;
      background: #4CAF50;
      transition: width 0.25s ease;
      border-radius: 2px;
    }
    .nav-link:hover::after { width: 100%; }
    .nav-link:hover { color: #4CAF50 !important; }

    .feature-icon-wrap {
      transition: transform 0.3s ease, background 0.3s ease;
    }
    .hover-lift:hover .feature-icon-wrap {
      transform: scale(1.12) rotate(-4deg);
      background: #4CAF50 !important;
      color: #fff !important;
    }
    .hover-lift:hover .feature-icon-wrap i {
      color: #fff !important;
    }

    .step-line {
      position: absolute;
      top: 44px; left: 60%; right: -40%;
      height: 2px;
      background: linear-gradient(to right, #4CAF50, #a5d6a7);
    }

    .scroll-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
    .scroll-reveal.visible { opacity: 1; transform: translateY(0); }

    .role-card:hover { border-color: #4CAF50 !important; }
    .role-card:hover .role-icon { background: #4CAF50 !important; }
    .role-card:hover .role-icon i { color: #fff !important; }
    .role-card { transition: border-color 0.25s; cursor: default; }

    /* Ticker */
    @keyframes ticker {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    .ticker-track { animation: ticker 22s linear infinite; }
    .ticker-track:hover { animation-play-state: paused; }
  `;
  document.head.appendChild(style);
}

/* ── Scroll-reveal hook ── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── Data ── */
const navigation = [
  { name: "Accueil",     href: "/",           icon: "fa-house" },
  { name: "Cours",       href: "/cours",       icon: "fa-book-open" },
  { name: "Événements",  href: "/evenements",  icon: "fa-calendar-days" },
  { name: "Contact",     href: "/contact",     icon: "fa-envelope" },
];

const filieres = [
  {
    code: "DWFS",
    nom: "Développement Web & Full Stack",
    description: "Formation complète aux technologies web modernes pour devenir développeur full stack opérationnel.",
    icon: "fa-code",
    color: "#4CAF50",
    modules: ["HTML5 & CSS3","JavaScript / TypeScript","React.js / Vue.js","Node.js & Express","PHP & Laravel","MySQL / MongoDB","Git & GitHub","Méthodes Agile"],
  },
  {
    code: "PME",
    nom: "Gestion des PME",
    description: "Formation aux compétences management et gestion administrative des petites et moyennes entreprises.",
    icon: "fa-briefcase",
    color: "#388e3c",
    modules: ["Comptabilité générale","Gestion financière","Marketing digital","Management","Droit des affaires","Logiciels de gestion","Communication pro","Suivi clientèle"],
  },
];

const features = [
  { icon: "fa-graduation-cap", title: "Formation de Qualité",      desc: "Enseignement professionnel de haut niveau, adapté aux besoins du marché marocain.",  color: "#e8f5e9", iconColor: "#2e7d32" },
  { icon: "fa-chart-line",     title: "Suivi des Absences",        desc: "Système intelligent de gestion des absences en temps réel pour étudiants et familles.", color: "#e8f5e9", iconColor: "#2e7d32" },
  { icon: "fa-calendar-check", title: "Gestion des Événements",    desc: "Planning des événements pédagogiques, conférences et sorties géré directement en ligne.", color: "#e8f5e9", iconColor: "#2e7d32" },
  { icon: "fa-chalkboard-user",title: "Espace Professeur",         desc: "Les enseignants gèrent leurs cours, notes de présence et ressources pédagogiques.",     color: "#e8f5e9", iconColor: "#2e7d32" },
  { icon: "fa-user-shield",    title: "Espace Directeur",          desc: "Le directeur valide les comptes, supervise les absences et pilote l'établissement.",     color: "#e8f5e9", iconColor: "#2e7d32" },
  { icon: "fa-mobile-screen",  title: "Accessible Partout",        desc: "Plateforme responsive accessible depuis ordinateur, tablette ou smartphone.",             color: "#e8f5e9", iconColor: "#2e7d32" },
];

const roles = [
  {
    role: "Directeur",
    icon: "fa-user-tie",
    color: "#1b5e20",
    bg: "#e8f5e9",
    actions: ["Valider les comptes étudiants & professeurs","Superviser toutes les absences","Gérer les événements de l'établissement","Consulter les tableaux de bord","Paramétrer les filières et niveaux"],
  },
  {
    role: "Professeur",
    icon: "fa-chalkboard-user",
    color: "#2e7d32",
    bg: "#f1f8e9",
    actions: ["Saisir les absences par séance","Publier et gérer les cours","Partager des ressources pédagogiques","Consulter son emploi du temps","Communiquer avec les étudiants"],
  },
  {
    role: "Étudiant",
    icon: "fa-user-graduate",
    color: "#388e3c",
    bg: "#f9fbe7",
    actions: ["Consulter ses absences en temps réel","Accéder aux cours et supports","Voir les événements à venir","Suivre son profil académique","Recevoir des notifications"],
  },
];

const steps = [
  { num: 1, icon: "fa-user-plus",      title: "Inscription",  desc: "Créez votre compte étudiant en ligne en quelques minutes." },
  { num: 2, icon: "fa-user-check",     title: "Validation",   desc: "Le directeur examine et valide votre dossier d'inscription." },
  { num: 3, icon: "fa-door-open",      title: "Accès",        desc: "Accédez immédiatement aux cours et à l'agenda des événements." },
  { num: 4, icon: "fa-chart-bar",      title: "Suivi",        desc: "Consultez vos absences et votre progression en temps réel." },
];

const stats = [
  { val: "2",    label: "Filières BTS",       icon: "fa-layer-group" },
  { val: "200+", label: "Étudiants formés",   icon: "fa-users" },
  { val: "95%",  label: "Taux d'insertion",   icon: "fa-briefcase" },
  { val: "15+",  label: "Formateurs experts", icon: "fa-chalkboard-user" },
];

const tickerItems = [
  "Développement Web Full Stack",
  "Gestion des Absences en Temps Réel",
  "Gestion des PME",
  "Espace Professeur & Directeur",
  "Événements Pédagogiques",
  "Formation Professionnelle d'Excellence",
];

/* ══════════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════════ */
export default function Presentation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  /* Navbar shadow on scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* Scroll-reveal refs */
  const refStats    = useScrollReveal();
  const refFeatures = useScrollReveal();
  const refFilieres = useScrollReveal();
  const refRoles    = useScrollReveal();
  const refSteps    = useScrollReveal();

  const S = { fontFamily: "'Inter', sans-serif" };

  return (
    <div style={{ ...S, background: "#fff", overflowX: "hidden" }}>

      {/* ══ NAVBAR ══════════════════════════════════════════ */}
      <header
        style={{
          position: "fixed", inset: "0 0 auto 0", zIndex: 100,
          background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.85)",
          backdropFilter: "blur(14px)",
          borderBottom: scrolled ? "1px solid #eceff1" : "1px solid transparent",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.07)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <nav style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#4CAF50,#2e7d32)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(76,175,80,0.3)" }}>
              <i className="fa-solid fa-graduation-cap" style={{ color: "#fff", fontSize: 17 }} />
            </div>
            <span style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#263238", letterSpacing: "-0.3px" }}>
              BTS <span style={{ color: "#4CAF50" }}>Taza</span>
            </span>
          </a>

          {/* Desktop links */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden lg:flex">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="nav-link"
                style={{ fontSize: "0.9rem", fontWeight: 600, color: "#455a64", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }}>
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: 13 }} />
                {item.name}
              </a>
            ))}
          </div>

          {/* Connexion btn */}
          <div className="hidden lg:flex" style={{ alignItems: "center", gap: 12 }}>
            <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#4CAF50,#388e3c)", color: "#fff", fontWeight: 700, fontSize: "0.88rem", padding: "9px 22px", borderRadius: 10, textDecoration: "none", boxShadow: "0 4px 14px rgba(76,175,80,0.3)", transition: "all 0.2s" }}>
              <i className="fa-solid fa-right-to-bracket" />
              Connexion
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "#455a64", fontSize: 20 }}>
            <i className="fa-solid fa-bars" />
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(38,50,56,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setMobileOpen(false)}>
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 300, background: "#fff", padding: "1.5rem", overflowY: "auto", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, color: "#263238" }}>BTS <span style={{ color: "#4CAF50" }}>Taza</span></span>
              <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#455a64" }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {navigation.map((item) => (
                <a key={item.name} href={item.href} onClick={() => setMobileOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, fontWeight: 600, color: "#455a64", textDecoration: "none", fontSize: "0.92rem" }}>
                  <i className={`fa-solid ${item.icon}`} style={{ color: "#4CAF50", width: 18, textAlign: "center" }} />
                  {item.name}
                </a>
              ))}
              <Link to="/login" onClick={() => setMobileOpen(false)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, padding: "12px", borderRadius: 10, fontWeight: 700, background: "#4CAF50", color: "#fff", textDecoration: "none" }}>
                <i className="fa-solid fa-right-to-bracket" /> Connexion
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══ HERO ═══════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", paddingTop: 68, minHeight: "100vh", display: "flex", alignItems: "center", background: "linear-gradient(160deg,#f0fdf4 0%,#fff 55%,#f0fdf4 100%)" }}>
        {/* Animated blobs */}
        <div className="animate-blob" aria-hidden style={{ position: "absolute", top: "8%", right: "-5%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(76,175,80,0.18) 0%,transparent 70%)", animationDelay: "0s" }} />
        <div className="animate-blob" aria-hidden style={{ position: "absolute", bottom: "5%", left: "-8%", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle,rgba(56,142,60,0.14) 0%,transparent 70%)", animationDelay: "3s" }} />

        {/* Grid pattern */}
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(76,175,80,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(76,175,80,0.05) 1px,transparent 1px)", backgroundSize: "60px 60px", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "5rem 2rem", width: "100%", textAlign: "center" }}>
          <div>
              <div className="animate-fadeUp" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 999, padding: "5px 14px", fontSize: "0.78rem", fontWeight: 700, color: "#2e7d32", marginBottom: 24, letterSpacing: 0.5 }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: 11 }} />
                Promotion 2024–2026 · Inscriptions ouvertes
              </div>

              <h1 className="animate-fadeUp delay-100" style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: "clamp(2.4rem,5vw,3.6rem)", color: "#263238", lineHeight: 1.18, letterSpacing: "-1px", marginBottom: 24 }}>
                Formez-vous pour le{" "}
                <span style={{ color: "#4CAF50", position: "relative" }}>monde professionnel
                  <svg viewBox="0 0 320 12" style={{ position: "absolute", bottom: -6, left: 0, width: "100%", overflow: "visible" }} aria-hidden>
                    <path d="M4 8 Q160 2 316 8" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="320" style={{ animation: "dash 1.2s 0.6s ease both", strokeDashoffset: 320 }} />
                  </svg>
                </span>{" "}de demain
              </h1>

              <p className="animate-fadeUp delay-200" style={{ fontSize: "1.1rem", color: "#78909c", lineHeight: 1.75, marginBottom: 36, maxWidth: 580, margin: "0 auto 36px" }}>
                Le <strong style={{ color: "#455a64" }}>BTS Taza</strong> vous prépare aux métiers du développement web et de la gestion d'entreprise. Suivi des absences, cours en ligne, et événements — tout en un.
              </p>

              <div className="animate-fadeUp delay-300" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40, justifyContent: "center" }}>
                <Link to="/inscription" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#4CAF50,#2e7d32)", color: "#fff", fontWeight: 700, fontSize: "0.95rem", padding: "13px 28px", borderRadius: 12, textDecoration: "none", boxShadow: "0 6px 20px rgba(76,175,80,0.35)" }}>
                  <i className="fa-solid fa-user-plus" /> S'inscrire maintenant
                </Link>
                <a href="#filieres" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#455a64", fontWeight: 600, fontSize: "0.95rem", padding: "13px 24px", borderRadius: 12, textDecoration: "none", border: "1.5px solid #cfd8dc" }}>
                  Voir les filières <i className="fa-solid fa-arrow-down" />
                </a>
              </div>

              {/* Mini badges */}
              <div className="animate-fadeUp delay-400" style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
                {["Filières reconnues","100% en ligne","Suivi en temps réel"].map((b) => (
                  <span key={b} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#546e7a", fontWeight: 500 }}>
                    <i className="fa-solid fa-check" style={{ color: "#4CAF50", fontSize: 11 }} /> {b}
                  </span>
                ))}
              </div>
          </div>
        </div>
      </section>

      {/* ══ TICKER ══════════════════════════════════════════ */}
      <div style={{ background: "linear-gradient(135deg,#2e7d32,#4CAF50)", padding: "14px 0", overflow: "hidden" }}>
        <div className="ticker-track" style={{ display: "flex", gap: 48, whiteSpace: "nowrap", width: "max-content" }}>
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", display: "inline-flex", alignItems: "center", gap: 12 }}>
              <i className="fa-solid fa-star" style={{ fontSize: 10, opacity: 0.7 }} /> {t}
            </span>
          ))}
        </div>
      </div>

      {/* ══ STATS ════════════════════════════════════════════ */}
      <section style={{ padding: "4rem 2rem", background: "#fff" }}>
        <div ref={refStats} className="scroll-reveal" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 24 }}>
          {stats.map((s, i) => (
            <div key={s.label} className="hover-lift" style={{ textAlign: "center", padding: "28px 16px", background: "#f9fafb", borderRadius: 16, border: "1px solid #eceff1", transitionDelay: `${i * 80}ms` }}>
              <div style={{ width: 52, height: 52, background: "#e8f5e9", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <i className={`fa-solid ${s.icon}`} style={{ color: "#2e7d32", fontSize: 20 }} />
              </div>
              <p style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: "2rem", color: "#4CAF50", lineHeight: 1, marginBottom: 6 }}>{s.val}</p>
              <p style={{ fontSize: "0.85rem", color: "#78909c", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FONCTIONNALITÉS ══════════════════════════════════ */}
      <section style={{ padding: "5rem 2rem", background: "#f5f7fa" }}>
        <div ref={refFeatures} className="scroll-reveal" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4CAF50", marginBottom: 10 }}>
              <i className="fa-solid fa-sparkles" style={{ marginRight: 6 }} />Fonctionnalités
            </p>
            <h2 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,3vw,2.4rem)", color: "#263238", letterSpacing: "-0.5px", marginBottom: 12 }}>
              Tout ce dont vous avez besoin
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#78909c", maxWidth: 520, margin: "0 auto" }}>
              Une plateforme complète pour gérer la vie académique du BTS Taza.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {features.map((f, i) => (
              <div key={f.title} className="hover-lift" style={{ background: "#fff", border: "1px solid #eceff1", borderRadius: 16, padding: "26px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", transitionDelay: `${i * 60}ms` }}>
                <div className="feature-icon-wrap" style={{ width: 52, height: 52, background: f.color, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <i className={`fa-solid ${f.icon}`} style={{ color: f.iconColor, fontSize: 20 }} />
                </div>
                <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: "1rem", color: "#263238", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "#78909c", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FILIÈRES ═════════════════════════════════════════ */}
      <section id="filieres" style={{ padding: "5rem 2rem", background: "#fff" }}>
        <div ref={refFilieres} className="scroll-reveal" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4CAF50", marginBottom: 10 }}>
              <i className="fa-solid fa-layer-group" style={{ marginRight: 6 }} />Formations
            </p>
            <h2 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,3vw,2.4rem)", color: "#263238", letterSpacing: "-0.5px", marginBottom: 12 }}>
              Nos filières BTS
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#78909c" }}>Deux formations reconnues au Maroc, conçues pour l'emploi</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 28 }}>
            {filieres.map((f) => (
              <div key={f.code} className="hover-lift" style={{ background: "#fff", border: "1px solid #eceff1", borderRadius: 22, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                {/* Header */}
                <div style={{ background: `linear-gradient(135deg,${f.color},${f.color}cc)`, padding: "28px 28px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 56, height: 56, background: "rgba(255,255,255,0.2)", borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className={`fa-solid ${f.icon}`} style={{ color: "#fff", fontSize: 24 }} />
                    </div>
                    <div>
                      <span style={{ display: "inline-block", background: "rgba(255,255,255,0.22)", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "2px 10px", borderRadius: 999, marginBottom: 4 }}>{f.code}</span>
                      <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#fff", lineHeight: 1.3 }}>{f.nom}</h3>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.88)", lineHeight: 1.65 }}>{f.description}</p>
                </div>
                {/* Body */}
                <div style={{ padding: "20px 28px 28px" }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#90a4ae", marginBottom: 14 }}>
                    <i className="fa-solid fa-list-check" style={{ marginRight: 6 }} />Modules
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
                    {f.modules.map((m, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <i className="fa-solid fa-circle-check" style={{ color: "#4CAF50", fontSize: 12, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.82rem", color: "#546e7a" }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RÔLES / QUI FAIT QUOI ════════════════════════════ */}
      <section style={{ padding: "5rem 2rem", background: "#f5f7fa" }}>
        <div ref={refRoles} className="scroll-reveal" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4CAF50", marginBottom: 10 }}>
              <i className="fa-solid fa-users-gear" style={{ marginRight: 6 }} />Espaces dédiés
            </p>
            <h2 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,3vw,2.4rem)", color: "#263238", letterSpacing: "-0.5px", marginBottom: 12 }}>
              Un espace pour chaque acteur
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#78909c", maxWidth: 500, margin: "0 auto" }}>
              Directeur, professeur ou étudiant — chacun dispose d'un espace personnalisé.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            {roles.map((r) => (
              <div key={r.role} className="role-card hover-lift" style={{ background: "#fff", border: "2px solid #eceff1", borderRadius: 18, padding: "28px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div className="role-icon" style={{ width: 58, height: 58, background: r.bg, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, transition: "background 0.25s" }}>
                  <i className={`fa-solid ${r.icon}`} style={{ color: r.color, fontSize: 24, transition: "color 0.25s" }} />
                </div>
                <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#263238", marginBottom: 16 }}>
                  <i className="fa-solid fa-user" style={{ color: "#4CAF50", fontSize: 13, marginRight: 8 }} />{r.role}
                </h3>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {r.actions.map((a, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.87rem", color: "#546e7a", lineHeight: 1.5 }}>
                      <i className="fa-solid fa-arrow-right" style={{ color: "#4CAF50", fontSize: 11, marginTop: 4, flexShrink: 0 }} />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMMENT ÇA MARCHE ════════════════════════════════ */}
      <section style={{ padding: "5rem 2rem", background: "#fff" }}>
        <div ref={refSteps} className="scroll-reveal" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4CAF50", marginBottom: 10 }}>
              <i className="fa-solid fa-route" style={{ marginRight: 6 }} />Processus
            </p>
            <h2 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,3vw,2.4rem)", color: "#263238", letterSpacing: "-0.5px" }}>
              Comment ça fonctionne ?
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 0, position: "relative" }}>
            {steps.map((step, idx) => (
              <div key={step.num} style={{ textAlign: "center", padding: "16px", position: "relative" }}>
                {/* Connector */}
                {idx < steps.length - 1 && (
                  <div aria-hidden style={{ position: "absolute", top: 44, left: "58%", right: "-42%", height: 2, background: "linear-gradient(to right,#4CAF50,#a5d6a7)", zIndex: 0 }} className="hidden lg:block" />
                )}
                <div className="animate-pulse-ring" style={{ width: 60, height: 60, background: "linear-gradient(135deg,#4CAF50,#2e7d32)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", position: "relative", zIndex: 1 }}>
                  <i className={`fa-solid ${step.icon}`} style={{ color: "#fff", fontSize: 22 }} />
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: "0.72rem", color: "#4CAF50", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Étape {step.num}</div>
                <h3 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: "1rem", color: "#263238", marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "#78909c", lineHeight: 1.65, maxWidth: 200, margin: "0 auto" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ════════════════════════════════════════ */}
      <section style={{ padding: "5rem 2rem", background: "linear-gradient(135deg,#1b5e20 0%,#2e7d32 50%,#388e3c 100%)", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div aria-hidden style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        {/* Grid pattern */}
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ width: 72, height: 72, background: "rgba(255,255,255,0.15)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <i className="fa-solid fa-graduation-cap" style={{ color: "#fff", fontSize: 32 }} />
          </div>
          <h2 style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,3vw,2.6rem)", color: "#fff", letterSpacing: "-0.5px", marginBottom: 16 }}>
            Prêt à rejoindre le BTS Taza ?
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.75, marginBottom: 36 }}>
            Démarrez votre parcours professionnel dès aujourd'hui. Inscrivez-vous ou contactez-nous pour plus d'informations sur nos formations.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/inscription" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", color: "#2e7d32", fontWeight: 700, fontSize: "0.95rem", padding: "14px 30px", borderRadius: 12, textDecoration: "none", boxShadow: "0 6px 24px rgba(0,0,0,0.2)" }}>
              <i className="fa-solid fa-user-plus" /> S'inscrire maintenant
            </Link>
            <Link to="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 600, fontSize: "0.95rem", padding: "14px 28px", borderRadius: 12, textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.4)" }}>
              <i className="fa-solid fa-envelope" /> Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════ */}
      <footer style={{ background: "#1a2327", padding: "2.5rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "#4CAF50", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fa-solid fa-graduation-cap" style={{ color: "#fff", fontSize: 15 }} />
            </div>
            <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, color: "#fff", fontSize: "1rem" }}>
              BTS <span style={{ color: "#4CAF50" }}>Taza</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {navigation.map((n) => (
              <a key={n.name} href={n.href} style={{ fontSize: "0.85rem", color: "#78909c", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                <i className={`fa-solid ${n.icon}`} style={{ fontSize: 11 }} /> {n.name}
              </a>
            ))}
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "#78909c", fontSize: "0.82rem" }}>© 2026 BTS Taza · Centre de Formation</p>
            <p style={{ color: "#546e7a", fontSize: "0.78rem", marginTop: 3 }}>
              <i className="fa-solid fa-location-dot" style={{ marginRight: 5, color: "#4CAF50" }} />Route de Fès, Taza, Maroc
            </p>
          </div>
        </div>
      </footer>

      {/* Responsive grid fix */}
      <style>{`
        @media (max-width: 768px) {
          .grid-hero { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hidden.lg\\:block { display: none !important; }
          .hidden.lg\\:flex { display: none !important; }
          .step-line { display: none !important; }
        }
      `}</style>
    </div>
  );
}