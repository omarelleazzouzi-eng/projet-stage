import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

/* ── Font Awesome + Google Fonts + Animations (same as Presentation.jsx) ── */
if (!document.getElementById("fa-cdn")) {
  const link = document.createElement("link");
  link.id = "fa-cdn";
  link.rel = "stylesheet";
  link.href =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
  document.head.appendChild(link);
}

if (!document.getElementById("bts-login-styles")) {
  const style = document.createElement("style");
  style.id = "bts-login-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideR {
      from { opacity: 0; transform: translateX(-36px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes blobFloat {
      0%,100% { transform: translateY(0) scale(1); }
      50%      { transform: translateY(-18px) scale(1.04); }
    }
    @keyframes pulse-ring-login {
      0%   { box-shadow: 0 0 0 0 rgba(76,175,80,0.4); }
      70%  { box-shadow: 0 0 0 14px rgba(76,175,80,0); }
      100% { box-shadow: 0 0 0 0 rgba(76,175,80,0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    .login-page * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
    .login-page h1, .login-page h2, .login-page h3 { font-family: 'Manrope', sans-serif; }

    .login-blob { animation: blobFloat 7s ease-in-out infinite; }
    .login-blob-2 { animation: blobFloat 9s ease-in-out infinite reverse; }

    .fadeup-1 { animation: fadeUp 0.65s ease both; }
    .fadeup-2 { animation: fadeUp 0.65s 0.1s ease both; }
    .fadeup-3 { animation: fadeUp 0.65s 0.2s ease both; }
    .fadeup-4 { animation: fadeUp 0.65s 0.3s ease both; }

    .slider { animation: slideR 0.7s ease both; }

    .login-btn {
      background: linear-gradient(135deg, #4CAF50, #2e7d32);
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }
    .login-btn::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
      opacity: 0;
      transition: opacity 0.2s;
    }
    .login-btn:hover::after { opacity: 1; }
    .login-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(46,125,50,0.4); }
    .login-btn:active { transform: translateY(0); }

    .login-input {
      border: 1.5px solid #e0e7e9;
      border-radius: 12px;
      padding: 12px 16px 12px 44px;
      width: 100%;
      font-size: 0.95rem;
      color: #263238;
      background: #f8faf8;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      outline: none;
    }
    .login-input:focus {
      border-color: #4CAF50;
      box-shadow: 0 0 0 3px rgba(76,175,80,0.15);
      background: #fff;
    }
    .login-input::placeholder { color: #90a4ae; }

    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #78909c;
      font-size: 0.9rem;
      pointer-events: none;
      transition: color 0.2s;
    }
    .input-wrapper:focus-within .input-icon { color: #4CAF50; }

    .feature-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      color: white;
      font-size: 0.88rem;
      backdrop-filter: blur(4px);
    }
    .feature-pill i { color: #a5d6a7; font-size: 0.85rem; }

    .error-box {
      background: #fef2f2;
      border: 1.5px solid #fca5a5;
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #dc2626;
      font-size: 0.88rem;
      animation: fadeUp 0.3s ease both;
    }

    .side-pattern {
      background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
      background-size: 28px 28px;
    }

    .divider-line {
      height: 1px;
      background: linear-gradient(to right, transparent, #e0e7e9, transparent);
      margin: 24px 0;
    }

    .toggle-password {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      color: #90a4ae;
      transition: color 0.2s;
      background: none;
      border: none;
      padding: 0;
    }
    .toggle-password:hover { color: #4CAF50; }
  `;
  document.head.appendChild(style);
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Email ou mot de passe incorrect",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{ minHeight: "100vh", display: "flex", background: "#f5f7fa" }}
    >
      {/* ── LEFT PANEL ── */}
      <div
        className="slider"
        style={{
          display: "none",
          width: "45%",
          background:
            "linear-gradient(145deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 52px",
        }}
        id="login-left-panel"
      >
        {/* Grid pattern */}
        <div
          className="side-pattern"
          style={{ position: "absolute", inset: 0, opacity: 0.6 }}
        />

        {/* Blobs */}
        <div
          className="login-blob"
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "340px",
            height: "340px",
            background: "rgba(76,175,80,0.2)",
            borderRadius: "50%",
            filter: "blur(40px)",
          }}
        />
        <div
          className="login-blob-2"
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "280px",
            height: "280px",
            background: "rgba(27,94,32,0.4)",
            borderRadius: "50%",
            filter: "blur(50px)",
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "52px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "rgba(255,255,255,0.15)",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(8px)",
              }}
            >
              <i
                className="fa-solid fa-graduation-cap"
                style={{ color: "white", fontSize: "1.3rem" }}
              />
            </div>
            <span
              style={{
                color: "white",
                fontFamily: "Manrope",
                fontWeight: 800,
                fontSize: "1.4rem",
                letterSpacing: "-0.3px",
              }}
            >
              BTS Taza
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "Manrope",
              fontWeight: 800,
              fontSize: "2.5rem",
              lineHeight: 1.15,
              color: "white",
              marginBottom: "16px",
            }}
          >
            Bienvenue sur
            <br />
            <span style={{ color: "#a5d6a7" }}>votre espace</span>
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "1rem",
              lineHeight: 1.6,
              marginBottom: "44px",
            }}
          >
            Plateforme académique dédiée aux étudiants, professeurs et
            directeurs du BTS Taza.
          </p>

          {/* Features */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {[
              ["fa-chart-line", "Suivi des absences en temps réel"],
              ["fa-calendar-check", "Gestion des événements et cours"],
              ["fa-shield-halved", "Espace sécurisé par rôle"],
              ["fa-mobile-screen", "Accessible partout, tout le temps"],
            ].map(([icon, text]) => (
              <div key={icon} className="feature-pill">
                <i className={`fa-solid ${icon}`} />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div
            style={{
              marginTop: "52px",
              padding: "14px 18px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i
              className="fa-solid fa-location-dot"
              style={{ color: "#a5d6a7" }}
            />
            Route de Fès, Taza, Maroc — Promotion 2024–2026
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Form) ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {/* Mobile logo */}
          <div
            className="fadeup-1"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "36px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                background: "linear-gradient(135deg, #4CAF50, #2e7d32)",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(76,175,80,0.3)",
              }}
            >
              <i
                className="fa-solid fa-graduation-cap"
                style={{ color: "white", fontSize: "1.1rem" }}
              />
            </div>
            <span
              style={{
                fontFamily: "Manrope",
                fontWeight: 800,
                fontSize: "1.3rem",
                color: "#263238",
              }}
            >
              BTS Taza
            </span>
          </div>

          {/* Title */}
          <div className="fadeup-2" style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontFamily: "Manrope",
                fontWeight: 800,
                fontSize: "1.9rem",
                color: "#263238",
                marginBottom: "6px",
                letterSpacing: "-0.5px",
              }}
            >
              Connexion
            </h2>
            <p style={{ color: "#78909c", fontSize: "0.95rem" }}>
              Accédez à votre espace de gestion académique
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="error-box" style={{ marginBottom: "20px" }}>
              <i className="fa-solid fa-circle-exclamation" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <div className="fadeup-3">
              <label
                style={{
                  display: "block",
                  fontSize: "0.87rem",
                  fontWeight: 600,
                  color: "#455a64",
                  marginBottom: "7px",
                }}
              >
                Adresse email
              </label>
              <div className="input-wrapper" style={{ position: "relative" }}>
                <i className="fa-solid fa-envelope input-icon" />
                <input
                  type="email"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="fadeup-3">
              <label
                style={{
                  display: "block",
                  fontSize: "0.87rem",
                  fontWeight: 600,
                  color: "#455a64",
                  marginBottom: "7px",
                }}
              >
                Mot de passe
              </label>
              <div className="input-wrapper" style={{ position: "relative" }}>
                <i className="fa-solid fa-lock input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  style={{ paddingRight: "44px" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i
                    className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  />
                </button>
              </div>
            </div>

            <div className="fadeup-4">
              <button
                type="submit"
                className="login-btn"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  fontFamily: "Manrope",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: loading ? 0.75 : 1,
                  marginTop: "4px",
                }}
              >
                {loading ? (
                  <>
                    <i
                      className="fa-solid fa-circle-notch"
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <i
                      className="fa-solid fa-arrow-right"
                      style={{ fontSize: "0.85rem" }}
                    />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="divider-line" />

          {/* Links */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <p style={{ color: "#78909c", fontSize: "0.9rem", margin: 0 }}>
              Pas encore de compte ?{" "}
              <Link
                to="/inscription"
                style={{
                  color: "#4CAF50",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
                onMouseOver={(e) => (e.target.style.color = "#2e7d32")}
                onMouseOut={(e) => (e.target.style.color = "#4CAF50")}
              >
                S'inscrire
              </Link>
            </p>
            <Link
              to="/"
              style={{
                color: "#90a4ae",
                fontSize: "0.85rem",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = "#4CAF50";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = "#90a4ae";
              }}
            >
              <i
                className="fa-solid fa-arrow-left"
                style={{ fontSize: "0.75rem" }}
              />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>

      {/* Make left panel visible on lg screens via JS (Tailwind not in scope) */}
      <style>{`
        @media (min-width: 1024px) {
          #login-left-panel { display: flex !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
