import { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

/* ══════════════════════════════════════════
   INJECT FA + FONTS + STYLES (once)
══════════════════════════════════════════ */
if (!document.getElementById("fa-cdn")) {
  const link = document.createElement("link");
  link.id = "fa-cdn";
  link.rel = "stylesheet";
  link.href =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
  document.head.appendChild(link);
}
if (!document.getElementById("bts-fonts")) {
  const s = document.createElement("style");
  s.id = "bts-fonts";
  s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');`;
  document.head.appendChild(s);
}
if (!document.getElementById("bts-navbar-styles")) {
  const s = document.createElement("style");
  s.id = "bts-navbar-styles";
  s.textContent = `
    .bts-nav * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
    .bts-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      transition: all 0.3s ease;
    }
    .bts-nav.scrolled {
      background: rgba(255,255,255,0.97) !important;
      box-shadow: 0 2px 20px rgba(0,0,0,0.07);
      border-bottom: 1px solid #eceff1;
    }
    .bts-nav.top {
      background: rgba(255,255,255,0.85) !important;
      backdrop-filter: blur(14px);
      border-bottom: 1px solid transparent;
    }

    .nav-link-item {
      position: relative;
      font-size: 0.9rem;
      font-weight: 600;
      color: #455a64;
      text-decoration: none;
      padding: 4px 0;
      transition: color 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nav-link-item::after {
      content: '';
      position: absolute;
      bottom: -4px; left: 0;
      width: 0; height: 2px;
      background: #4CAF50;
      transition: width 0.25s ease;
      border-radius: 2px;
    }
    .nav-link-item:hover { color: #4CAF50; }
    .nav-link-item:hover::after,
    .nav-link-item.active::after { width: 100%; }
    .nav-link-item.active { color: #4CAF50; }

    .nav-login-btn {
      background: linear-gradient(135deg, #4CAF50, #388e3c);
      color: white !important;
      border: none;
      border-radius: 10px;
      padding: 9px 22px;
      font-family: 'Manrope', sans-serif;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(76,175,80,0.3);
    }
    .nav-login-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(76,175,80,0.4);
    }

    /* ── Mobile drawer ── */
    .nav-drawer {
      position: fixed;
      top: 0; right: 0;
      height: 100vh;
      width: 300px;
      background: white;
      z-index: 200;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: -8px 0 40px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
    }
    .nav-drawer.open { transform: translateX(0); }

    .nav-overlay {
      position: fixed; inset: 0;
      background: rgba(38,50,56,0.5);
      z-index: 199;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
      backdrop-filter: blur(4px);
    }
    .nav-overlay.show { opacity: 1; pointer-events: all; }

    .drawer-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      color: #455a64;
      font-size: 0.92rem;
      transition: background 0.2s, color 0.2s;
    }
    .drawer-link:hover { background: #f0fdf4; color: #4CAF50; }
    .drawer-link.active { background: #f0fdf4; color: #4CAF50; }
    .drawer-link i { color: #4CAF50; width: 18px; text-align: center; }

    .hamburger-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: #455a64;
      font-size: 20px;
    }

    @media (min-width: 1024px) {
      .nav-desktop { display: flex !important; }
      .nav-mobile  { display: none  !important; }
    }
    @media (max-width: 1023px) {
      .nav-desktop { display: none  !important; }
      .nav-mobile  { display: flex  !important; }
    }
  `;
  document.head.appendChild(s);
}

/* ══════════════════════════════════════════
   GRADUATION CAP — SVG inline
   Remplace fa-graduation-cap partout
   → rendu immédiat, zéro dépendance FA
══════════════════════════════════════════ */
function GradCapIcon({ size = 17 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3.33 2 8.67 2 12 0v-5" />
    </svg>
  );
}

/* ══════════════════════════════════════════
   NAV LINKS
══════════════════════════════════════════ */
const NAV_LINKS = [
  { to: "/", label: "Accueil", icon: "fa-house" },
  { to: "/cours", label: "Cours", icon: "fa-book-open" },
  { to: "/evenements", label: "Événements", icon: "fa-calendar-days" },
  { to: "/contact", label: "Contact", icon: "fa-envelope" },
];

/* ══════════════════════════════════════════
   COMPOSANT
══════════════════════════════════════════ */
export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { user } = useContext(AuthContext);

  /* Navbar shadow on scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* Close drawer on route change */
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ══ NAVBAR ══════════════════════════════════════════ */}
      <nav className={`bts-nav ${scrolled ? "scrolled" : "top"}`}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 2rem",
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* ── Logo (identique à Presentation.jsx) ── */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                background: "linear-gradient(135deg,#4CAF50,#2e7d32)",
                borderRadius: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(76,175,80,0.3)",
              }}
            >
              <GradCapIcon size={17} />
            </div>
            <span
              style={{
                fontFamily: "Manrope, sans-serif",
                fontWeight: 800,
                fontSize: "1.1rem",
                color: "#263238",
                letterSpacing: "-0.3px",
              }}
            >
              BTS <span style={{ color: "#4CAF50" }}>Taza</span>
            </span>
          </Link>

          {/* ── Desktop links ── */}
          <div
            className="nav-desktop"
            style={{ alignItems: "center", gap: 32 }}
          >
            {NAV_LINKS.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link-item ${isActive(to) ? "active" : ""}`}
              >
                <i className={`fa-solid ${icon}`} style={{ fontSize: 13 }} />
                {label}
              </Link>
            ))}
          </div>

          {/* ── Desktop CTA ── */}
          <div
            className="nav-desktop"
            style={{ alignItems: "center", gap: 12 }}
          >
            {user ? (
              <Link
                to="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#f0fdf4",
                  color: "#2e7d32",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  padding: "6px 14px",
                  borderRadius: 20,
                  textDecoration: "none",
                  border: "1px solid #a5d6a7",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    background: "#4CAF50",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "0.75rem",
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span>{user.name}</span>
              </Link>
            ) : (
              <Link to="/login" className="nav-login-btn">
                <i className="fa-solid fa-right-to-bracket" />
                Connexion
              </Link>
            )}
          </div>

          {/* ── Mobile toggle ── */}
          <button
            className="nav-mobile hamburger-btn"
            onClick={() => setDrawerOpen(true)}
          >
            <i className="fa-solid fa-bars" />
          </button>
        </div>
      </nav>

      {/* ══ OVERLAY ═════════════════════════════════════════ */}
      <div
        className={`nav-overlay ${drawerOpen ? "show" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ══ MOBILE DRAWER ═══════════════════════════════════ */}
      <div className={`nav-drawer ${drawerOpen ? "open" : ""}`}>
        {/* Drawer header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: "linear-gradient(135deg,#4CAF50,#2e7d32)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GradCapIcon size={15} />
            </div>
            <span
              style={{
                fontFamily: "Manrope, sans-serif",
                fontWeight: 800,
                fontSize: "1.05rem",
                color: "#263238",
              }}
            >
              BTS <span style={{ color: "#4CAF50" }}>Taza</span>
            </span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: "#455a64",
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Drawer links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_LINKS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`drawer-link ${isActive(to) ? "active" : ""}`}
            >
              <i className={`fa-solid ${icon}`} />
              {label}
            </Link>
          ))}
        </div>

        {/* Drawer CTA */}
        <div style={{ marginTop: "auto", paddingTop: 24 }}>
          {user ? (
            <Link
              to="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 10,
                fontWeight: 700,
                background: "#f0fdf4",
                color: "#2e7d32",
                textDecoration: "none",
                border: "1px solid #a5d6a7",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: "#4CAF50",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "0.8rem",
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
              {user.name}
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-login-btn"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  borderRadius: 12,
                  padding: "12px",
                }}
              >
                <i className="fa-solid fa-right-to-bracket" />
                Connexion
              </Link>
              <Link
                to="/inscription"
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: 10,
                  color: "#78909c",
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
              >
                Pas de compte ?{" "}
                <span style={{ color: "#4CAF50", fontWeight: 600 }}>
                  S'inscrire
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
