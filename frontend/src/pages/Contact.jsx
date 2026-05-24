import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/common/PublicNavbar';

if (!document.getElementById("bts-contact-styles")) {
  const s = document.createElement("style");
  s.id = "bts-contact-styles";
  s.textContent = `
    .contact-page * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
    .contact-page h1, .contact-page h2, .contact-page h3 { font-family: 'Manrope', sans-serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.85); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes blobFloat {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-16px); }
    }
    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(76,175,80,0.4); }
      70%  { box-shadow: 0 0 0 12px rgba(76,175,80,0); }
      100% { box-shadow: 0 0 0 0 rgba(76,175,80,0); }
    }
    @keyframes checkBounce {
      0%   { transform: scale(0); opacity: 0; }
      60%  { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }

    .contact-input {
      border: 1.5px solid #e0e7e9;
      border-radius: 12px;
      padding: 12px 16px 12px 44px;
      width: 100%;
      font-size: 0.9rem;
      color: #263238;
      background: #f8faf8;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      outline: none;
      font-family: 'Inter', sans-serif;
    }
    .contact-input:focus {
      border-color: #4CAF50;
      box-shadow: 0 0 0 3px rgba(76,175,80,0.12);
      background: white;
    }
    .contact-input::placeholder { color: #90a4ae; }

    .contact-textarea {
      border: 1.5px solid #e0e7e9;
      border-radius: 12px;
      padding: 12px 16px;
      width: 100%;
      font-size: 0.9rem;
      color: #263238;
      background: #f8faf8;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      outline: none;
      resize: vertical;
      min-height: 140px;
      font-family: 'Inter', sans-serif;
    }
    .contact-textarea:focus {
      border-color: #4CAF50;
      box-shadow: 0 0 0 3px rgba(76,175,80,0.12);
      background: white;
    }
    .contact-textarea::placeholder { color: #90a4ae; }

    .contact-iw { position: relative; }
    .contact-icon {
      position: absolute;
      left: 14px; top: 50%;
      transform: translateY(-50%);
      color: #90a4ae; font-size: 0.82rem;
      pointer-events: none; transition: color 0.2s;
    }
    .contact-iw:focus-within .contact-icon { color: #4CAF50; }

    .contact-label {
      display: block;
      font-size: 0.85rem; font-weight: 600;
      color: #455a64; margin-bottom: 7px;
    }

    .contact-submit-btn {
      width: 100%;
      background: linear-gradient(135deg, #4CAF50, #2e7d32);
      color: white;
      border: none; border-radius: 12px;
      padding: 13px;
      font-family: 'Manrope', sans-serif;
      font-weight: 700; font-size: 0.95rem;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.25s;
    }
    .contact-submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(76,175,80,0.35); }
    .contact-submit-btn:active { transform: translateY(0); }

    .info-card {
      display: flex; align-items: flex-start; gap: 16px;
      padding: 20px;
      background: white;
      border-radius: 16px;
      border: 1.5px solid #e8f5e9;
      transition: all 0.25s;
    }
    .info-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(76,175,80,0.1); }

    .info-icon-wrap {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .info-icon-wrap i { color: #4CAF50; font-size: 1rem; }

    .fadeup { animation: fadeUp 0.65s ease both; }
    .fadeup-d1 { animation: fadeUp 0.65s 0.08s ease both; }
    .fadeup-d2 { animation: fadeUp 0.65s 0.16s ease both; }
  `;
  document.head.appendChild(s);
}

const CONTACT_INFO = [
  {
    icon: "fa-location-dot",
    title: "Adresse",
    lines: ["Route de Fès, Taza", "Maroc"]
  },
  {
    icon: "fa-envelope",
    title: "Email",
    lines: ["contact@bts-taza.ma"]
  },
  {
    icon: "fa-phone",
    title: "Téléphone",
    lines: ["+212 5XX XX XX XX"]
  },
  {
    icon: "fa-clock",
    title: "Horaires",
    lines: ["Lun – Ven : 8h00 – 17h00", "Samedi : 9h00 – 13h00"]
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', sujet: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1200);
  };

  return (
    <div className="contact-page" style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <PublicNavbar />

      {/* ── HERO ── */}
      <div style={{
        background: "linear-gradient(145deg, #1b5e20 0%, #2e7d32 55%, #388e3c 100%)",
        paddingTop: "68px", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "26px 26px"
        }} />
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "280px", height: "280px",
          background: "rgba(76,175,80,0.2)", borderRadius: "50%",
          filter: "blur(50px)", animation: "blobFloat 8s ease-in-out infinite", pointerEvents: "none"
        }} />

        <div style={{
          maxWidth: "1200px", margin: "0 auto", padding: "52px 24px 60px",
          position: "relative", zIndex: 1
        }}>
          <div className="fadeup">
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "20px", padding: "5px 14px",
              color: "#a5d6a7", fontSize: "0.8rem", fontWeight: 600, marginBottom: "16px"
            }}>
              <i className="fa-solid fa-envelope" />
              Nous contacter
            </div>
            <h1 style={{
              fontFamily: "Manrope", fontWeight: 800,
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              color: "white", lineHeight: 1.2, marginBottom: "12px"
            }}>
              Contact
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", lineHeight: 1.6, maxWidth: "520px" }}>
              Une question, une demande d'information ? L'équipe BTS Taza est à votre disposition.
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "52px 24px 80px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: "40px",
          alignItems: "start"
        }}
          className="contact-layout"
        >

          {/* ── LEFT: Info cards ── */}
          <div className="fadeup" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{
              fontFamily: "Manrope", fontWeight: 800,
              fontSize: "1.4rem", color: "#263238", marginBottom: "4px"
            }}>
              Informations de contact
            </h2>
            <p style={{ color: "#78909c", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "8px" }}>
              Venez nous rendre visite sur le campus ou contactez-nous par email ou téléphone.
            </p>

            {CONTACT_INFO.map(({ icon, title, lines }) => (
              <div key={title} className="info-card">
                <div className="info-icon-wrap">
                  <i className={`fa-solid ${icon}`} />
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "Manrope", fontWeight: 700,
                    fontSize: "0.95rem", color: "#263238", marginBottom: "4px"
                  }}>
                    {title}
                  </h3>
                  {lines.map((l, i) => (
                    <p key={i} style={{ color: "#455a64", fontSize: "0.88rem", lineHeight: 1.5 }}>{l}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div style={{
              background: "linear-gradient(135deg, #e8f5e9, #f1f8f1)",
              border: "1.5px solid #c8e6c9",
              borderRadius: "16px",
              padding: "28px",
              textAlign: "center"
            }}>
              <i className="fa-solid fa-map-location-dot" style={{
                fontSize: "2.5rem", color: "#4CAF50", marginBottom: "12px", display: "block"
              }} />
              <p style={{ fontFamily: "Manrope", fontWeight: 700, color: "#263238", fontSize: "0.95rem" }}>
                Route de Fès, Taza
              </p>
              <p style={{ color: "#78909c", fontSize: "0.82rem", marginTop: "4px" }}>Maroc</p>
            </div>
          </div>

          {/* ── RIGHT: Form ── */}
          <div className="fadeup-d1">
            {sent ? (
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "52px 36px",
                textAlign: "center",
                border: "1.5px solid #e8f5e9",
                boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
                animation: "scaleIn 0.5s ease both"
              }}>
                <div style={{
                  width: "80px", height: "80px",
                  background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                  animation: "pulse-ring 2.5s ease-out infinite"
                }}>
                  <i className="fa-solid fa-check" style={{
                    fontSize: "2rem", color: "#4CAF50",
                    animation: "checkBounce 0.5s 0.1s ease both"
                  }} />
                </div>
                <h3 style={{
                  fontFamily: "Manrope", fontWeight: 800,
                  fontSize: "1.5rem", color: "#263238", marginBottom: "10px"
                }}>
                  Message envoyé !
                </h3>
                <p style={{ color: "#78909c", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "28px" }}>
                  Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
                </p>
                <button
                  onClick={() => { setSent(false); setFormData({ name: '', email: '', sujet: '', message: '' }); }}
                  style={{
                    background: "#e8f5e9", color: "#2e7d32",
                    border: "none", borderRadius: "11px",
                    padding: "11px 24px",
                    fontFamily: "Manrope", fontWeight: 700, fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "36px 32px",
                border: "1.5px solid #e8f5e9",
                boxShadow: "0 4px 40px rgba(0,0,0,0.06)"
              }}>
                <h3 style={{
                  fontFamily: "Manrope", fontWeight: 800,
                  fontSize: "1.3rem", color: "#263238", marginBottom: "6px"
                }}>
                  Envoyer un message
                </h3>
                <p style={{ color: "#78909c", fontSize: "0.87rem", marginBottom: "28px" }}>
                  Tous les champs marqués <span style={{ color: "#ef4444" }}>*</span> sont obligatoires.
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

                  <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label className="contact-label">Nom complet <span style={{ color: "#ef4444" }}>*</span></label>
                      <div className="contact-iw">
                        <i className="fa-solid fa-user contact-icon" />
                        <input type="text" name="name" value={formData.name} onChange={handleChange}
                          className="contact-input" placeholder="Votre nom" required />
                      </div>
                    </div>
                    <div>
                      <label className="contact-label">Email <span style={{ color: "#ef4444" }}>*</span></label>
                      <div className="contact-iw">
                        <i className="fa-solid fa-envelope contact-icon" />
                        <input type="email" name="email" value={formData.email} onChange={handleChange}
                          className="contact-input" placeholder="votre@email.com" required />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="contact-label">Sujet <span style={{ color: "#ef4444" }}>*</span></label>
                    <div className="contact-iw">
                      <i className="fa-solid fa-tag contact-icon" />
                      <input type="text" name="sujet" value={formData.sujet} onChange={handleChange}
                        className="contact-input" placeholder="Objet de votre message" required />
                    </div>
                  </div>

                  <div>
                    <label className="contact-label">Message <span style={{ color: "#ef4444" }}>*</span></label>
                    <textarea
                      name="message" value={formData.message} onChange={handleChange}
                      className="contact-textarea"
                      placeholder="Décrivez votre demande en détail..."
                      required
                    />
                  </div>

                  <button type="submit" className="contact-submit-btn" disabled={sending}>
                    {sending ? (
                      <>
                        <i className="fa-solid fa-circle-notch" style={{ animation: "spin 1s linear infinite" }} />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane" />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </form>

                {/* Quick links */}
                <div style={{
                  marginTop: "24px", paddingTop: "20px",
                  borderTop: "1px solid #f0f4f5",
                  display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center"
                }}>
                  <Link to="/inscription" style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    color: "#4CAF50", fontWeight: 600, fontSize: "0.85rem",
                    textDecoration: "none"
                  }}>
                    <i className="fa-solid fa-user-plus" style={{ fontSize: "0.75rem" }} />
                    S'inscrire
                  </Link>
                  <span style={{ color: "#e0e7e9" }}>|</span>
                  <Link to="/login" style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    color: "#4CAF50", fontWeight: 600, fontSize: "0.85rem",
                    textDecoration: "none"
                  }}>
                    <i className="fa-solid fa-right-to-bracket" style={{ fontSize: "0.75rem" }} />
                    Connexion
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive fix */}
      <style>{`
        @media (max-width: 768px) {
          .contact-layout { grid-template-columns: 1fr !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}