import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

/* ── Font Awesome + Google Fonts + Animations ── */
if (!document.getElementById("fa-cdn")) {
  const link = document.createElement("link");
  link.id = "fa-cdn";
  link.rel = "stylesheet";
  link.href =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
  document.head.appendChild(link);
}

if (!document.getElementById("bts-inscription-styles")) {
  const style = document.createElement("style");
  style.id = "bts-inscription-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.85); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes blobFloat {
      0%,100% { transform: translateY(0) scale(1); }
      50%      { transform: translateY(-16px) scale(1.03); }
    }
    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(76,175,80,0.5); }
      70%  { box-shadow: 0 0 0 10px rgba(76,175,80,0); }
      100% { box-shadow: 0 0 0 0 rgba(76,175,80,0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes checkBounce {
      0%   { transform: scale(0); opacity: 0; }
      60%  { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); }
    }

    .insc-page * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
    .insc-page h1, .insc-page h2, .insc-page h3, .insc-page h4 { font-family: 'Manrope', sans-serif; }

    .insc-blob { animation: blobFloat 7s ease-in-out infinite; }
    .insc-blob-2 { animation: blobFloat 9s ease-in-out 1s infinite reverse; }

    .fadeup-1 { animation: fadeUp 0.65s ease both; }
    .fadeup-2 { animation: fadeUp 0.65s 0.08s ease both; }
    .fadeup-3 { animation: fadeUp 0.65s 0.16s ease both; }
    .fadeup-4 { animation: fadeUp 0.65s 0.24s ease both; }

    .insc-input {
      border: 1.5px solid #e0e7e9;
      border-radius: 12px;
      padding: 11px 16px 11px 42px;
      width: 100%;
      font-size: 0.9rem;
      color: #263238;
      background: #f8faf8;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      outline: none;
    }
    .insc-input:focus {
      border-color: #4CAF50;
      box-shadow: 0 0 0 3px rgba(76,175,80,0.12);
      background: #fff;
    }
    .insc-input::placeholder { color: #90a4ae; }
    .insc-input-no-icon {
      padding-left: 16px;
    }

    .insc-icon {
      position: absolute;
      left: 13px;
      top: 50%;
      transform: translateY(-50%);
      color: #90a4ae;
      font-size: 0.82rem;
      pointer-events: none;
      transition: color 0.2s;
    }
    .insc-iw:focus-within .insc-icon { color: #4CAF50; }

    .insc-label {
      display: block;
      font-size: 0.83rem;
      font-weight: 600;
      color: #455a64;
      margin-bottom: 6px;
    }

    .step-circle {
      width: 36px; height: 36px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Manrope', sans-serif;
      font-weight: 800;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }
    .step-circle.active {
      background: linear-gradient(135deg, #4CAF50, #2e7d32);
      color: white;
      animation: pulse-ring 2s ease-out infinite;
    }
    .step-circle.done {
      background: #e8f5e9;
      color: #4CAF50;
    }
    .step-circle.inactive {
      background: #f0f4f5;
      color: #90a4ae;
    }
    .step-connector {
      height: 2px;
      flex: 1;
      transition: background 0.4s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #4CAF50, #2e7d32);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 24px;
      font-family: 'Manrope', sans-serif;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(46,125,50,0.35); }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

    .btn-secondary {
      background: #f0f4f5;
      color: #455a64;
      border: none;
      border-radius: 12px;
      padding: 12px 24px;
      font-family: 'Manrope', sans-serif;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .btn-secondary:hover { background: #e0e7e9; }

    .error-box {
      background: #fef2f2;
      border: 1.5px solid #fca5a5;
      border-radius: 12px;
      padding: 11px 14px;
      display: flex;
      align-items: flex-start;
      gap: 9px;
      color: #dc2626;
      font-size: 0.86rem;
      animation: fadeUp 0.3s ease both;
    }

    .success-card {
      text-align: center;
      animation: scaleIn 0.5s ease both;
    }
    .success-icon-ring {
      width: 88px; height: 88px;
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      animation: pulse-ring 2.5s ease-out infinite;
    }
    .success-icon-ring i {
      font-size: 2.2rem;
      color: #4CAF50;
      animation: checkBounce 0.5s 0.2s ease both;
    }

    .form-card {
      background: white;
      border-radius: 20px;
      padding: 36px 32px;
      box-shadow: 0 4px 40px rgba(0,0,0,0.07);
      border: 1px solid rgba(76,175,80,0.08);
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    @media (max-width: 480px) {
      .grid-2 { grid-template-columns: 1fr; }
      .form-card { padding: 24px 18px; }
    }

    .divider-line {
      height: 1px;
      background: linear-gradient(to right, transparent, #e0e7e9, transparent);
      margin: 28px 0;
    }
  `;
  document.head.appendChild(style);
}

export default function Inscription() {
  const [formData, setFormData] = useState({
    cne: "",
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    date_naissance: "",
    telephone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValid = () => {
    const { nom, prenom, email, password, confirmPassword } = formData;
    return nom.trim() && prenom.trim() && email.trim() && password.length >= 6 && password === confirmPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    try {
      await api.post("/inscription", {
        cne: formData.cne || null,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        date_naissance: formData.date_naissance || null,
        lieu_naissance: formData.lieu_naissance || null,
        telephone: formData.telephone || null,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Erreur lors de l'inscription";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── SUCCESS STATE ── */
  if (success) {
    return (
      <div
        className="insc-page"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div className="success-card">
          <div className="success-icon-ring">
            <i className="fa-solid fa-circle-check" />
          </div>
          <h2
            style={{
              fontFamily: "Manrope",
              fontWeight: 800,
              fontSize: "1.8rem",
              color: "#263238",
              marginBottom: "12px",
            }}
          >
            Inscription réussie !
          </h2>
          <p
            style={{
              color: "#78909c",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              maxWidth: "380px",
              margin: "0 auto 24px",
            }}
          >
            Votre compte est actif. Vous pouvez maintenant vous connecter et
            commencer à utiliser la plateforme.
          </p>
          <Link
            to="/login"
            className="btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "13px 32px",
              textDecoration: "none",
            }}
          >
            Se connecter
            <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      </div>
    );
  }

  /* ── MAIN FORM ── */
  return (
    <div
      className="insc-page"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 50%, #f5f7fa 100%)",
        padding: "48px 24px",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="insc-blob"
        style={{
          position: "fixed",
          top: "-100px",
          right: "-100px",
          width: "400px",
          height: "400px",
          background: "rgba(76,175,80,0.07)",
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="insc-blob-2"
        style={{
          position: "fixed",
          bottom: "-80px",
          left: "-80px",
          width: "350px",
          height: "350px",
          background: "rgba(46,125,50,0.06)",
          borderRadius: "50%",
          filter: "blur(70px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: "540px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          className="fadeup-1"
          style={{ textAlign: "center", marginBottom: "32px" }}
        >
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "linear-gradient(135deg, #4CAF50, #2e7d32)",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(76,175,80,0.3)",
              }}
            >
              <i
                className="fa-solid fa-graduation-cap"
                style={{ color: "white", fontSize: "1.2rem" }}
              />
            </div>
            <span
              style={{
                fontFamily: "Manrope",
                fontWeight: 800,
                fontSize: "1.4rem",
                color: "#263238",
              }}
            >
              BTS Taza
            </span>
          </Link>
          <h1
            style={{
              fontFamily: "Manrope",
              fontWeight: 800,
              fontSize: "1.8rem",
              color: "#263238",
              marginBottom: "6px",
              letterSpacing: "-0.4px",
            }}
          >
            Créer votre compte
          </h1>
          <p style={{ color: "#78909c", fontSize: "0.92rem" }}>
            Centre de Formation BTS Taza — Promotion 2024–2026
          </p>
        </div>

        <div className="fadeup-2" style={{ marginBottom: "8px" }} />

        {/* Form card */}
        <div className="form-card fadeup-3">
          {error && (
            <div className="error-box" style={{ marginBottom: "20px" }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginTop: "1px" }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: "1.05rem", color: "#263238", marginBottom: "4px" }}>
                <i className="fa-solid fa-user" style={{ color: "#4CAF50", marginRight: "8px" }} />
                Créer votre compte
              </h3>

              <div className="grid-2">
                <div>
                  <label className="insc-label">Nom <span style={{ color: "#ef4444" }}>*</span></label>
                  <div className="insc-iw" style={{ position: "relative" }}>
                    <i className="fa-solid fa-user insc-icon" />
                    <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="insc-input" required />
                  </div>
                </div>
                <div>
                  <label className="insc-label">Prénom <span style={{ color: "#ef4444" }}>*</span></label>
                  <div className="insc-iw" style={{ position: "relative" }}>
                    <i className="fa-solid fa-user insc-icon" />
                    <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="insc-input" required />
                  </div>
                </div>
              </div>

              <div>
                <label className="insc-label">Email <span style={{ color: "#ef4444" }}>*</span></label>
                <div className="insc-iw" style={{ position: "relative" }}>
                  <i className="fa-solid fa-envelope insc-icon" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="insc-input" placeholder="exemple@email.com" required />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label className="insc-label">Mot de passe <span style={{ color: "#ef4444" }}>*</span></label>
                  <div className="insc-iw" style={{ position: "relative" }}>
                    <i className="fa-solid fa-lock insc-icon" />
                    <input type={showPwd ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="insc-input" style={{ paddingRight: "40px" }} minLength={6} required />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="toggle-password" tabIndex={-1}>
                      <i className={`fa-solid ${showPwd ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="insc-label">Confirmer <span style={{ color: "#ef4444" }}>*</span></label>
                  <div className="insc-iw" style={{ position: "relative" }}>
                    <i className="fa-solid fa-lock-open insc-icon" />
                    <input type={showConfirmPwd ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="insc-input" style={{ paddingRight: "40px" }} required />
                    <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="toggle-password" tabIndex={-1}>
                      <i className={`fa-solid ${showConfirmPwd ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="divider-line" />

              <p style={{ fontSize: "0.82rem", color: "#90a4ae", marginBottom: "4px" }}>
                Champs optionnels
              </p>

              <div className="grid-2">
                <div>
                  <label className="insc-label">CNE (optionnel)</label>
                  <div className="insc-iw" style={{ position: "relative" }}>
                    <i className="fa-solid fa-id-card insc-icon" />
                    <input type="text" name="cne" value={formData.cne} onChange={handleChange} className="insc-input" placeholder="P123456" />
                  </div>
                </div>
                <div>
                  <label className="insc-label">Téléphone</label>
                  <div className="insc-iw" style={{ position: "relative" }}>
                    <i className="fa-solid fa-phone insc-icon" />
                    <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="insc-input" placeholder="06 00 00 00 00" />
                  </div>
                </div>
              </div>

              <div>
                <label className="insc-label">Date de naissance</label>
                <div className="insc-iw" style={{ position: "relative" }}>
                  <i className="fa-solid fa-calendar insc-icon" />
                  <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} className="insc-input" />
                </div>
              </div>

              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p style={{ fontSize: "0.82rem", color: "#ef4444" }}>
                  <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "4px" }} />
                  Les mots de passe ne correspondent pas
                </p>
              )}

              <button type="submit" className="btn-primary" disabled={loading || !isValid()} style={{ marginTop: "8px" }}>
                {loading ? (
                  <><i className="fa-solid fa-circle-notch" style={{ animation: "spin 1s linear infinite" }} /> Inscription...</>
                ) : (
                  <><i className="fa-solid fa-paper-plane" /> S'inscrire</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer link */}
        <div
          className="fadeup-4"
          style={{ textAlign: "center", marginTop: "24px" }}
        >
          <p style={{ color: "#78909c", fontSize: "0.88rem" }}>
            Déjà inscrit ?{" "}
            <Link
              to="/login"
              style={{
                color: "#4CAF50",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Se connecter
            </Link>
          </p>
          <Link
            to="/"
            style={{
              color: "#90a4ae",
              fontSize: "0.82rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              marginTop: "8px",
            }}
          >
            <i
              className="fa-solid fa-arrow-left"
              style={{ fontSize: "0.72rem" }}
            />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
