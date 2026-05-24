import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PublicNavbar from '../components/common/PublicNavbar';

if (!document.getElementById("bts-cours-styles")) {
  const s = document.createElement("style");
  s.id = "bts-cours-styles";
  s.textContent = `
    .cours-page * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
    .cours-page h1, .cours-page h2, .cours-page h3 { font-family: 'Manrope', sans-serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes blobFloat {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-16px); }
    }

    .cours-hero { background: linear-gradient(145deg, #1b5e20 0%, #2e7d32 55%, #388e3c 100%); }
    .cours-hero-pattern {
      background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 26px 26px;
    }

    .cours-card {
      background: white;
      border-radius: 18px;
      border: 1.5px solid #e8f5e9;
      overflow: hidden;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }
    .cours-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 48px rgba(76,175,80,0.15);
      border-color: #a5d6a7;
    }

    .cours-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .filter-btn {
      padding: 8px 18px;
      border-radius: 22px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: 1.5px solid transparent;
      font-family: 'Inter', sans-serif;
    }
    .filter-btn.active {
      background: #4CAF50;
      color: white;
      border-color: #4CAF50;
      box-shadow: 0 4px 12px rgba(76,175,80,0.3);
    }
    .filter-btn.inactive {
      background: white;
      color: #455a64;
      border-color: #e0e7e9;
    }
    .filter-btn.inactive:hover { border-color: #4CAF50; color: #4CAF50; }

    .search-input {
      border: 1.5px solid #e0e7e9;
      border-radius: 12px;
      padding: 10px 16px 10px 42px;
      font-size: 0.9rem;
      color: #263238;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: white;
      width: 100%;
      max-width: 320px;
      font-family: 'Inter', sans-serif;
    }
    .search-input:focus {
      border-color: #4CAF50;
      box-shadow: 0 0 0 3px rgba(76,175,80,0.1);
    }
    .search-input::placeholder { color: #90a4ae; }

    .inscris-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 10px 22px;
      background: white;
      color: #2e7d32;
      border-radius: 10px;
      font-family: 'Manrope', sans-serif;
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
    }
    .inscris-btn:hover { background: #e8f5e9; transform: translateY(-1px); }

    .cours-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .cours-card-dl-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      width: 100%;
      padding: 10px;
      background: #e8f5e9;
      color: #2e7d32;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
    }
    .cours-card-dl-btn:hover { background: #4CAF50; color: white; }

    .fadeup { animation: fadeUp 0.6s ease both; }
    .fadeup-d1 { animation: fadeUp 0.6s 0.08s ease both; }
    .fadeup-d2 { animation: fadeUp 0.6s 0.16s ease both; }
  `;
  document.head.appendChild(s);
}

export default function CoursPublic() {
  const [cours, setCours] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursRes, filieresRes] = await Promise.all([
          api.get('/public/cours'),
          api.get('/filieres')
        ]);
        setCours(coursRes.data);
        setFilieres(filieresRes.data);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = cours.filter(c => {
    const matchFiliere = !selectedFiliere || c.classe?.filiere_id == selectedFiliere;
    const matchSearch = !search ||
      c.titre?.toLowerCase().includes(search.toLowerCase()) ||
      c.matiere?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      c.professeur?.nom?.toLowerCase().includes(search.toLowerCase());
    return matchFiliere && matchSearch;
  });

  return (
    <div className="cours-page" style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <PublicNavbar />

      {/* ── HERO ── */}
      <div className="cours-hero" style={{ paddingTop: "68px" }}>
        <div className="cours-hero-pattern" style={{ position: "relative" }}>
          {/* Blobs */}
          <div style={{
            position: "absolute", top: "-60px", right: "-60px",
            width: "300px", height: "300px",
            background: "rgba(76,175,80,0.15)", borderRadius: "50%",
            filter: "blur(50px)", animation: "blobFloat 8s ease-in-out infinite",
            pointerEvents: "none"
          }} />

          <div style={{
            maxWidth: "1200px", margin: "0 auto", padding: "52px 24px 60px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: "24px", flexWrap: "wrap", position: "relative", zIndex: 1
          }}>
            <div className="fadeup">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "20px", padding: "5px 14px",
                color: "#a5d6a7", fontSize: "0.8rem", fontWeight: 600,
                marginBottom: "16px"
              }}>
                <i className="fa-solid fa-book-open" />
                Ressources pédagogiques
              </div>
              <h1 style={{
                fontFamily: "Manrope", fontWeight: 800,
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                color: "white", lineHeight: 1.2,
                marginBottom: "12px", letterSpacing: "-0.5px"
              }}>
                Cours & Ressources
              </h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", lineHeight: 1.6, maxWidth: "500px" }}>
                Accédez aux supports de cours de toutes les filières BTS.
                Le téléchargement est réservé aux étudiants inscrits.
              </p>
            </div>

            <div className="fadeup-d1">
              <Link to="/inscription" className="inscris-btn">
                <i className="fa-solid fa-user-plus" />
                S'inscrire pour télécharger
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      {!loading && (
        <div style={{
          background: "white",
          borderBottom: "1px solid #e8f5e9",
          padding: "0"
        }}>
          <div style={{
            maxWidth: "1200px", margin: "0 auto", padding: "0 24px",
            display: "flex", gap: "0", overflowX: "auto"
          }}>
            {[
              { icon: "fa-book", label: "Cours disponibles", val: cours.length },
              { icon: "fa-layer-group", label: "Filières", val: filieres.length },
              { icon: "fa-file-pdf", label: "Documents", val: cours.filter(c => c.fichier).length },
            ].map(({ icon, label, val }) => (
              <div key={label} style={{
                padding: "20px 32px",
                borderRight: "1px solid #f0f4f5",
                display: "flex", alignItems: "center", gap: "12px",
                whiteSpace: "nowrap"
              }}>
                <div style={{
                  width: "38px", height: "38px",
                  background: "#e8f5e9", borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <i className={`fa-solid ${icon}`} style={{ color: "#4CAF50", fontSize: "0.9rem" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: "1.3rem", color: "#263238", lineHeight: 1 }}>
                    {val}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#78909c", marginTop: "2px" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FILTERS ── */}
      <div style={{ background: "#f5f7fa", padding: "28px 24px 0" }}>
        <div style={{
          maxWidth: "1200px", margin: "0 auto",
          display: "flex", gap: "16px", alignItems: "center",
          flexWrap: "wrap", justifyContent: "space-between"
        }}>
          {/* Filiere filters */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              className={`filter-btn ${selectedFiliere === '' ? 'active' : 'inactive'}`}
              onClick={() => setSelectedFiliere('')}
            >
              Toutes les filières
            </button>
            {filieres.map(f => (
              <button
                key={f.id}
                className={`filter-btn ${selectedFiliere == f.id ? 'active' : 'inactive'}`}
                onClick={() => setSelectedFiliere(selectedFiliere == f.id ? '' : f.id)}
              >
                {f.code || f.nom}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <i className="fa-solid fa-magnifying-glass" style={{
              position: "absolute", left: "14px", top: "50%",
              transform: "translateY(-50%)", color: "#90a4ae", fontSize: "0.85rem"
            }} />
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher un cours..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── COURS GRID ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 24px 64px" }}>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: "14px" }}>
            <i className="fa-solid fa-circle-notch" style={{
              fontSize: "1.8rem", color: "#4CAF50",
              animation: "spin 1s linear infinite"
            }} />
            <span style={{ color: "#78909c", fontFamily: "Manrope", fontWeight: 600 }}>Chargement des cours...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{
              width: "80px", height: "80px",
              background: "#e8f5e9", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px"
            }}>
              <i className="fa-solid fa-book-open" style={{ fontSize: "2rem", color: "#4CAF50" }} />
            </div>
            <h3 style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: "1.3rem", color: "#263238", marginBottom: "8px" }}>
              Aucun cours trouvé
            </h3>
            <p style={{ color: "#78909c", fontSize: "0.95rem" }}>
              {search ? "Essayez d'autres mots-clés" : "Revenez plus tard"}
            </p>
          </div>
        ) : (
          <>
            <p style={{ color: "#78909c", fontSize: "0.88rem", marginBottom: "20px" }}>
              <span style={{ color: "#4CAF50", fontWeight: 700 }}>{filtered.length}</span> cours trouvés
            </p>
            <div className="cours-grid">
              {filtered.map((c, i) => (
                <div key={c.id} className="cours-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  {/* Card top banner */}
                  <div style={{
                    background: "linear-gradient(135deg, #e8f5e9, #f1f8f1)",
                    padding: "20px 20px 16px",
                    borderBottom: "1px solid #e8f5e9"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{
                        width: "44px", height: "44px",
                        background: "white",
                        borderRadius: "12px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        flexShrink: 0
                      }}>
                        <i className="fa-solid fa-file-lines" style={{ color: "#4CAF50", fontSize: "1.1rem" }} />
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {c.classe?.filiere?.code && (
                          <span className="cours-badge" style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                            {c.classe.filiere.code}
                          </span>
                        )}
                        {c.fichier && (
                          <span className="cours-badge" style={{ background: "#dcfce7", color: "#16a34a" }}>
                            <i className="fa-solid fa-file-pdf" style={{ fontSize: "0.65rem" }} />
                            PDF
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 style={{
                      fontFamily: "Manrope", fontWeight: 700,
                      fontSize: "1.02rem", color: "#263238",
                      marginTop: "14px", lineHeight: 1.35
                    }}>
                      {c.titre}
                    </h3>
                    {c.matiere?.nom && (
                      <p style={{ color: "#4CAF50", fontSize: "0.82rem", fontWeight: 600, marginTop: "4px" }}>
                        {c.matiere.nom}
                      </p>
                    )}
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "16px 20px", flex: 1 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {c.professeur && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <i className="fa-solid fa-chalkboard-user" style={{ color: "#78909c", fontSize: "0.8rem", width: "14px" }} />
                          <span style={{ color: "#455a64", fontSize: "0.87rem" }}>
                            {c.professeur.nom} {c.professeur.prenom}
                          </span>
                        </div>
                      )}
                      {c.classe && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <i className="fa-solid fa-users" style={{ color: "#78909c", fontSize: "0.8rem", width: "14px" }} />
                          <span style={{ color: "#455a64", fontSize: "0.87rem" }}>{c.classe.nom}</span>
                        </div>
                      )}
                    </div>

                    {c.description && (
                      <p style={{
                        color: "#78909c", fontSize: "0.83rem",
                        lineHeight: 1.55, marginTop: "12px",
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden"
                      }}>
                        {c.description}
                      </p>
                    )}
                  </div>

                  {/* Card footer */}
                  <div style={{ padding: "14px 20px", borderTop: "1px solid #f0f4f5" }}>
                    {c.fichier ? (
                      <Link to="/login" className="cours-card-dl-btn">
                        <i className="fa-solid fa-download" />
                        Connectez-vous pour télécharger
                      </Link>
                    ) : (
                      <div style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        color: "#90a4ae", fontSize: "0.82rem"
                      }}>
                        <i className="fa-solid fa-clock" />
                        Document bientôt disponible
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── FOOTER CTA ── */}
      <div style={{
        background: "linear-gradient(135deg, #1b5e20, #2e7d32)",
        padding: "60px 24px",
        textAlign: "center"
      }}>
        <h2 style={{
          fontFamily: "Manrope", fontWeight: 800,
          fontSize: "1.8rem", color: "white",
          marginBottom: "12px"
        }}>
          Prêt à accéder à tous les cours ?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: "28px", fontSize: "0.95rem" }}>
          Inscrivez-vous pour télécharger tous les supports de cours
        </p>
        <Link to="/inscription" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "white", color: "#2e7d32",
          padding: "13px 28px", borderRadius: "12px",
          fontFamily: "Manrope", fontWeight: 700, fontSize: "0.95rem",
          textDecoration: "none", transition: "all 0.2s"
        }}>
          <i className="fa-solid fa-user-plus" />
          S'inscrire maintenant
        </Link>
      </div>
    </div>
  );
}