import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import PublicNavbar from "../components/common/PublicNavbar";

if (!document.getElementById("bts-events-styles")) {
  const s = document.createElement("style");
  s.id = "bts-events-styles";
  s.textContent = `
    .events-page * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
    .events-page h1, .events-page h2, .events-page h3, .events-page h4 { font-family: 'Manrope', sans-serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes blobFloat {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-18px); }
    }

    .event-card {
      background: white;
      border-radius: 18px;
      border: 1.5px solid #e8f5e9;
      overflow: hidden;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }
    .event-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 48px rgba(76,175,80,0.14);
      border-color: #a5d6a7;
    }
    .event-card.past { opacity: 0.65; }
    .event-card.past:hover { transform: translateY(-3px); }

    .event-img-placeholder {
      height: 180px;
      display: flex; align-items: center; justify-content: center;
      font-size: 3rem;
    }

    .tag-pill {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.73rem; font-weight: 600;
    }

    .event-register-btn {
      display: flex; align-items: center; justify-content: center; gap: 7px;
      width: 100%;
      padding: 11px;
      background: linear-gradient(135deg, #4CAF50, #2e7d32);
      color: white;
      border-radius: 11px;
      font-family: 'Manrope', sans-serif;
      font-weight: 700; font-size: 0.88rem;
      text-decoration: none; border: none; cursor: pointer;
      transition: all 0.2s;
    }
    .event-register-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(76,175,80,0.35); }

    .events-filter-btn {
      padding: 7px 16px;
      border-radius: 20px;
      font-size: 0.83rem; font-weight: 600;
      cursor: pointer; border: 1.5px solid transparent;
      transition: all 0.2s; font-family: 'Inter', sans-serif;
    }
    .events-filter-btn.active { background: #4CAF50; color: white; border-color: #4CAF50; }
    .events-filter-btn.inactive { background: white; color: #455a64; border-color: #e0e7e9; }
    .events-filter-btn.inactive:hover { border-color: #4CAF50; color: #4CAF50; }

    .events-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .meta-row {
      display: flex; align-items: flex-start; gap: 9px;
      font-size: 0.84rem; color: #455a64;
    }
    .meta-row i { color: #4CAF50; font-size: 0.78rem; margin-top: 2px; flex-shrink: 0; }

    .countdown-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: #e8f5e9; color: #2e7d32;
      padding: 4px 10px; border-radius: 20px;
      font-size: 0.75rem; font-weight: 700;
    }
  `;
  document.head.appendChild(s);
}

export default function EvenementsPublic() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all' | 'upcoming' | 'past'

  useEffect(() => {
    api
      .get("/public/events")
      .then((res) => setEvents(res.data))
      .catch((err) => setError(err.message || "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPast = (date) => new Date(date) < new Date();

  const getDaysUntil = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredEvents = events.filter((e) => {
    if (filter === "upcoming") return !isPast(e.date_evenement);
    if (filter === "past") return isPast(e.date_evenement);
    return true;
  });

  const upcomingCount = events.filter((e) => !isPast(e.date_evenement)).length;

  return (
    <div
      className="events-page"
      style={{ minHeight: "100vh", background: "#f5f7fa" }}
    >
      <PublicNavbar />

      {/* ── HERO ── */}
      <div
        style={{
          background:
            "linear-gradient(145deg, #1b5e20 0%, #2e7d32 55%, #388e3c 100%)",
          paddingTop: "68px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        {/* Blobs */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "320px",
            height: "320px",
            background: "rgba(76,175,80,0.18)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "blobFloat 9s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-40px",
            width: "240px",
            height: "240px",
            background: "rgba(27,94,32,0.3)",
            borderRadius: "50%",
            filter: "blur(50px)",
            animation: "blobFloat 11s ease-in-out reverse infinite",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "52px 24px 60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ animation: "fadeUp 0.65s ease both" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "20px",
                padding: "5px 14px",
                color: "#a5d6a7",
                fontSize: "0.8rem",
                fontWeight: 600,
                marginBottom: "16px",
              }}
            >
              <i className="fa-solid fa-calendar-check" />
              Agenda BTS Taza
            </div>
            <h1
              style={{
                fontFamily: "Manrope",
                fontWeight: 800,
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                color: "white",
                lineHeight: 1.2,
                marginBottom: "12px",
                letterSpacing: "-0.5px",
              }}
            >
              Événements
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "1rem",
                lineHeight: 1.6,
                maxWidth: "520px",
              }}
            >
              Découvrez tous les événements organisés par le BTS Taza.
              Inscrivez-vous pour participer et rester informé.
            </p>
          </div>

          {/* Stats pills */}
          <div
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              animation: "fadeUp 0.65s 0.1s ease both",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "14px",
                padding: "16px 20px",
                textAlign: "center",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  fontFamily: "Manrope",
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  color: "white",
                }}
              >
                {events.length}
              </div>
              <div
                style={{
                  color: "#a5d6a7",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                Total
              </div>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "14px",
                padding: "16px 20px",
                textAlign: "center",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  fontFamily: "Manrope",
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  color: "white",
                }}
              >
                {upcomingCount}
              </div>
              <div
                style={{
                  color: "#a5d6a7",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                À venir
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e8f5e9",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{ color: "#78909c", fontSize: "0.85rem", fontWeight: 600 }}
          >
            Filtrer :
          </span>
          {[
            { key: "all", label: "Tous", icon: "fa-list" },
            { key: "upcoming", label: "À venir", icon: "fa-clock" },
            { key: "past", label: "Passés", icon: "fa-check" },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              className={`events-filter-btn ${filter === key ? "active" : "inactive"}`}
              onClick={() => setFilter(key)}
            >
              <i
                className={`fa-solid ${icon}`}
                style={{ marginRight: "5px", fontSize: "0.8rem" }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── EVENTS GRID ── */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 24px 64px",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 0",
              gap: "14px",
            }}
          >
            <i
              className="fa-solid fa-circle-notch"
              style={{
                fontSize: "1.8rem",
                color: "#4CAF50",
                animation: "spin 1s linear infinite",
              }}
            />
            <span
              style={{
                color: "#78909c",
                fontFamily: "Manrope",
                fontWeight: 600,
              }}
            >
              Chargement des événements...
            </span>
          </div>
        ) : error ? (
          <div
            style={{
              background: "#fef2f2",
              border: "1.5px solid #fca5a5",
              borderRadius: "14px",
              padding: "20px 24px",
              display: "flex",
              gap: "10px",
              color: "#dc2626",
            }}
          >
            <i className="fa-solid fa-circle-exclamation" />
            <span>{error}</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "#e8f5e9",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <i
                className="fa-solid fa-calendar-xmark"
                style={{ fontSize: "2rem", color: "#4CAF50" }}
              />
            </div>
            <h3
              style={{
                fontFamily: "Manrope",
                fontWeight: 700,
                fontSize: "1.3rem",
                color: "#263238",
                marginBottom: "8px",
              }}
            >
              Aucun événement
            </h3>
            <p style={{ color: "#78909c" }}>
              {filter === "upcoming"
                ? "Pas d'événements à venir pour l'instant"
                : "Aucun événement trouvé"}
            </p>
          </div>
        ) : (
          <>
            <p
              style={{
                color: "#78909c",
                fontSize: "0.88rem",
                marginBottom: "20px",
              }}
            >
              <span style={{ color: "#4CAF50", fontWeight: 700 }}>
                {filteredEvents.length}
              </span>{" "}
              événement{filteredEvents.length > 1 ? "s" : ""} trouvé
              {filteredEvents.length > 1 ? "s" : ""}
            </p>
            <div className="events-grid">
              {filteredEvents.map((event, i) => {
                const past = isPast(event.date_evenement);
                const daysUntil = !past
                  ? getDaysUntil(event.date_evenement)
                  : null;

                return (
                  <div
                    key={event.id}
                    className={`event-card ${past ? "past" : ""}`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {/* Image or placeholder */}
                    {event.image ? (
                      <div
                        style={{
                          height: "180px",
                          backgroundImage: `url(/storage/${event.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    ) : (
                      <div
                        className="event-img-placeholder"
                        style={{
                          background: past
                            ? "linear-gradient(135deg, #f0f4f5, #e0e7e9)"
                            : "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
                        }}
                      >
                        <i
                          className="fa-solid fa-calendar-star"
                          style={{
                            color: past ? "#90a4ae" : "#4CAF50",
                            fontSize: "2.8rem",
                          }}
                        />
                      </div>
                    )}

                    <div
                      style={{
                        padding: "18px 20px",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {/* Tags */}
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        {past ? (
                          <span
                            className="tag-pill"
                            style={{ background: "#f0f4f5", color: "#78909c" }}
                          >
                            <i
                              className="fa-solid fa-check"
                              style={{ fontSize: "0.65rem" }}
                            />
                            Passé
                          </span>
                        ) : (
                          <span
                            className="tag-pill"
                            style={{ background: "#e8f5e9", color: "#2e7d32" }}
                          >
                            <i
                              className="fa-solid fa-circle"
                              style={{ fontSize: "0.45rem" }}
                            />
                            À venir
                          </span>
                        )}
                        {event.categorie && (
                          <span
                            className="tag-pill"
                            style={{ background: "#f3f0ff", color: "#7c3aed" }}
                          >
                            {event.categorie}
                          </span>
                        )}
                        {event.club && (
                          <span
                            className="tag-pill"
                            style={{ background: "#eff6ff", color: "#2563eb" }}
                          >
                            {event.club.nom}
                          </span>
                        )}
                      </div>

                      {/* Countdown for upcoming */}
                      {!past && daysUntil !== null && daysUntil <= 14 && (
                        <div
                          className="countdown-badge"
                          style={{ width: "fit-content" }}
                        >
                          <i
                            className="fa-solid fa-hourglass-half"
                            style={{ fontSize: "0.75rem" }}
                          />
                          {daysUntil === 0
                            ? "Aujourd'hui !"
                            : daysUntil === 1
                              ? "Demain"
                              : `Dans ${daysUntil} jours`}
                        </div>
                      )}

                      {/* Title */}
                      <h3
                        style={{
                          fontFamily: "Manrope",
                          fontWeight: 700,
                          fontSize: "1.05rem",
                          color: "#263238",
                          lineHeight: 1.35,
                        }}
                      >
                        {event.titre}
                      </h3>

                      {event.description && (
                        <p
                          style={{
                            color: "#78909c",
                            fontSize: "0.85rem",
                            lineHeight: 1.55,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {event.description}
                        </p>
                      )}

                      {/* Meta info */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                        }}
                      >
                        <div className="meta-row">
                          <i className="fa-solid fa-calendar" />
                          <span>{formatDate(event.date_evenement)}</span>
                        </div>
                        {event.date_evenement && (
                          <div className="meta-row">
                            <i className="fa-solid fa-clock" />
                            <span>{formatTime(event.date_evenement)}</span>
                          </div>
                        )}
                        {event.lieu && (
                          <div className="meta-row">
                            <i className="fa-solid fa-location-dot" />
                            <span>{event.lieu}</span>
                          </div>
                        )}
                        {event.max_participants && (
                          <div className="meta-row">
                            <i className="fa-solid fa-users" />
                            <span>
                              {event.max_participants} places disponibles
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <div
                      style={{
                        padding: "14px 20px",
                        borderTop: "1px solid #f0f4f5",
                      }}
                    >
                      {past ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "7px",
                            padding: "10px",
                            background: "#f0f4f5",
                            borderRadius: "11px",
                            color: "#90a4ae",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          <i className="fa-solid fa-flag-checkered" />
                          Événement terminé
                        </div>
                      ) : (
                        <Link to="/login" className="event-register-btn">
                          <i className="fa-solid fa-ticket" />
                          Connectez-vous pour vous inscrire
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── FOOTER CTA ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1b5e20, #2e7d32)",
          padding: "60px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "Manrope",
            fontWeight: 800,
            fontSize: "1.8rem",
            color: "white",
            marginBottom: "12px",
          }}
        >
          Ne manquez aucun événement
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            marginBottom: "28px",
            fontSize: "0.95rem",
          }}
        >
          Inscrivez-vous et recevez les notifications pour tous les événements à
          venir
        </p>
        <div
          style={{
            display: "flex",
            gap: "14px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/inscription"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "white",
              color: "#2e7d32",
              padding: "13px 28px",
              borderRadius: "12px",
              fontFamily: "Manrope",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
            }}
          >
            <i className="fa-solid fa-user-plus" />
            S'inscrire
          </Link>
          <Link
            to="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.12)",
              color: "white",
              border: "1.5px solid rgba(255,255,255,0.25)",
              padding: "13px 28px",
              borderRadius: "12px",
              fontFamily: "Manrope",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
            }}
          >
            <i className="fa-solid fa-right-to-bracket" />
            Connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
