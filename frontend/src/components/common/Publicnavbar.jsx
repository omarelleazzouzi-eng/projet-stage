import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

/* ── FA + Fonts (injected once globally) ── */
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
    .bts-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: all 0.3s ease; }
    .bts-nav.scrolled { background: white !important; box-shadow: 0 2px 24px rgba(0,0,0,0.08); }
    .bts-nav.transparent { background: transparent; }

    .nav-link-item {
      position: relative;
      font-size: 0.9rem;
      font-weight: 500;
      color: #455a64;
      text-decoration: none;
      padding: 4px 0;
      transition: color 0.2s;
    }
    .nav-link-item::after {
      content: '';
      position: absolute;
      bottom: -2px; left: 0;
      width: 0; height: 2px;
      background: #4CAF50;
      transition: width 0.25s ease;
      border-radius: 2px;
    }
    .nav-link-item:hover { color: #2e7d32; }
    .nav-link-item:hover::after, .nav-link-item.active::after { width: 100%; }
    .nav-link-item.active { color: #4CAF50; font-weight: 600; }

    .nav-login-btn {
      background: linear-gradient(135deg, #4CAF50, #2e7d32);
      color: white !important;
      border: none;
      border-radius: 10px;
      padding: 9px 20px;
      font-family: 'Manrope', sans-serif;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      transition: all 0.25s;
      box-shadow: 0 4px 14px rgba(76,175,80,0.3);
    }
    .nav-login-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(76,175,80,0.4); }

    /* Mobile drawer */
    .nav-drawer {
      position: fixed;
      top: 0; right: 0;
      height: 100vh;
      width: 280px;
      background: white;
      z-index: 200;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: -8px 0 40px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      padding: 28px 24px;
      gap: 0;
    }
    .nav-drawer.open { transform: translateX(0); }
    .nav-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 199;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
      backdrop-filter: blur(2px);
    }
    .nav-overlay.show { opacity: 1; pointer-events: all; }

    .drawer-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 0;
      border-bottom: 1px solid #f0f4f5;
      text-decoration: none;
      color: #455a64;
      font-size: 0.95rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .drawer-link:hover, .drawer-link.active { color: #4CAF50; }
    .drawer-link i { width: 18px; color: #78909c; font-size: 0.85rem; }
    .drawer-link.active i { color: #4CAF50; }

    .hamburger-btn {
      background: none;
      border: 1.5px solid #e0e7e9;
      border-radius: 9px;
      width: 38px; height: 38px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      color: #455a64;
      transition: all 0.2s;
    }
    .hamburger-btn:hover { border-color: #4CAF50; color: #4CAF50; }

    @media (min-width: 1024px) {
      .nav-desktop { display: flex !important; }
      .nav-mobile { display: none !important; }
    }
    @media (max-width: 1023px) {
      .nav-desktop { display: none !important; }
      .nav-mobile { display: flex !important; }
    }
  `;
  document.head.appendChild(s);
}

const NAV_LINKS = [
  { to: "/", label: "Accueil", icon: "fa-house" },
  { to: "/cours", label: "Cours", icon: "fa-book-open" },
  { to: "/evenements", label: "Événements", icon: "fa-calendar-check" },
  { to: "/contact", label: "Contact", icon: "fa-envelope" },
];

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`bts-nav ${scrolled ? "scrolled" : "transparent"}`}
        style={{ background: scrolled ? "white" : "rgba(255,255,255,0.95)" }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
            height: "68px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                background: "linear-gradient(135deg, #4CAF50, #2e7d32)",
                borderRadius: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(76,175,80,0.3)",
              }}
            >
              <i
                className="fa-solid fa-graduation-cap"
                style={{ color: "white", fontSize: "1rem" }}
              />
            </div>
            <span
              style={{
                fontFamily: "Manrope",
                fontWeight: 800,
                fontSize: "1.15rem",
                color: "#263238",
                letterSpacing: "-0.3px",
              }}
            >
              BTS <span style={{ color: "#4CAF50" }}>Taza</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div
            className="nav-desktop"
            style={{ alignItems: "center", gap: "32px" }}
          >
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link-item ${isActive(to) ? "active" : ""}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div
            className="nav-desktop"
            style={{ alignItems: "center", gap: "12px" }}
          >
            <Link to="/login" className="nav-login-btn">
              <i className="fa-solid fa-right-to-bracket" />
              Connexion
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-mobile hamburger-btn"
            onClick={() => setDrawerOpen(true)}
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <i className="fa-solid fa-bars" style={{ fontSize: "0.95rem" }} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`nav-overlay ${drawerOpen ? "show" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile drawer */}
      <div className={`nav-drawer ${drawerOpen ? "open" : ""}`}>
        {/* Drawer header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                background: "linear-gradient(135deg, #4CAF50, #2e7d32)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="fa-solid fa-graduation-cap"
                style={{ color: "white", fontSize: "0.9rem" }}
              />
            </div>
            <span
              style={{
                fontFamily: "Manrope",
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
              background: "#f0f4f5",
              border: "none",
              borderRadius: "8px",
              width: "34px",
              height: "34px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#455a64",
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Drawer links */}
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

        {/* Drawer CTA */}
        <div style={{ marginTop: "auto", paddingTop: "24px" }}>
          <Link
            to="/login"
            className="nav-login-btn"
            style={{
              width: "100%",
              justifyContent: "center",
              borderRadius: "12px",
              padding: "13px",
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
              marginTop: "10px",
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
        </div>
      </div>
    </>
  );
}
