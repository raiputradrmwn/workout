import type { MovePattern, MuscleRegion } from "@/lib/exercise-anim";

/**
 * Figur samping tersegmen. Gerakan digerakkan lewat CSS di globals.css
 * berdasarkan atribut data-pattern. Sorotan otot lewat data-muscle.
 */
export function ExerciseFigure({
  pattern,
  muscle,
  className,
}: {
  pattern: MovePattern;
  muscle: MuscleRegion;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 140"
      className={`exfig ${className ?? ""}`}
      data-pattern={pattern}
      data-muscle={muscle}
      role="img"
      aria-label={`Animasi gerakan: ${pattern}`}
    >
      {/* lantai / referensi */}
      <line
        x1="18"
        y1="132"
        x2="102"
        y2="132"
        className="exfig-floor"
        strokeLinecap="round"
      />

      <g className="exfig-fig">
        {/* kaki belakang (redup, untuk kedalaman) */}
        <g className="exfig-legB">
          <line x1="60" y1="84" x2="54" y2="108" />
          <line x1="54" y1="108" x2="52" y2="130" />
        </g>

        {/* rantai batang tubuh: pinggul -> kepala */}
        <g className="exfig-torso">
          <line x1="60" y1="84" x2="60" y2="52" className="exfig-spine" />
          <circle cx="60" cy="43" r="9" className="exfig-head" />

          {/* sorotan otot (satu yang cocok ditampilkan via CSS) */}
          <ellipse className="exfig-m exfig-m-chest" cx="60" cy="60" rx="9" ry="6" />
          <ellipse
            className="exfig-m exfig-m-shoulders"
            cx="60"
            cy="54"
            rx="7"
            ry="5"
          />
          <ellipse className="exfig-m exfig-m-core" cx="60" cy="76" rx="7" ry="7" />
          <ellipse
            className="exfig-m exfig-m-upper-back"
            cx="60"
            cy="58"
            rx="8"
            ry="7"
          />
          <ellipse className="exfig-m exfig-m-lats" cx="60" cy="66" rx="9" ry="9" />

          {/* lengan: bahu -> siku -> tangan */}
          <g className="exfig-armU">
            <line x1="60" y1="54" x2="60" y2="72" />
            <ellipse
              className="exfig-m exfig-m-triceps"
              cx="60"
              cy="63"
              rx="4"
              ry="7"
            />
            <g className="exfig-armL">
              <line x1="60" y1="72" x2="60" y2="90" />
              <ellipse
                className="exfig-m exfig-m-biceps"
                cx="60"
                cy="81"
                rx="4"
                ry="7"
              />
              <circle cx="60" cy="92" r="4" className="exfig-hand" />
              <rect
                x="52"
                y="88"
                width="16"
                height="8"
                rx="2"
                className="exfig-load"
              />
            </g>
          </g>
        </g>

        {/* kaki depan: pinggul -> lutut -> mata kaki -> telapak */}
        <g className="exfig-legF">
          <line x1="60" y1="84" x2="60" y2="108" />
          <ellipse
            className="exfig-m exfig-m-quads"
            cx="60"
            cy="96"
            rx="5"
            ry="10"
          />
          <ellipse
            className="exfig-m exfig-m-hamstrings"
            cx="60"
            cy="96"
            rx="5"
            ry="10"
          />
          <ellipse
            className="exfig-m exfig-m-glutes"
            cx="60"
            cy="85"
            rx="7"
            ry="5"
          />
          <g className="exfig-shinF">
            <line x1="60" y1="108" x2="60" y2="130" />
            <ellipse
              className="exfig-m exfig-m-calves"
              cx="60"
              cy="119"
              rx="4"
              ry="8"
            />
            <line
              x1="60"
              y1="130"
              x2="74"
              y2="130"
              className="exfig-foot"
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
