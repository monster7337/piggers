import Link from "next/link";

export function LegalPdfPage({
  eyebrow,
  title,
  description,
  paragraphs,
  pdfPath,
  returnHref = "/booking",
  returnLabel = "Вернуться к записи"
}) {
  return (
    <section className="section">
      <div className="container legal-content">
        <div className="legal-top-return">
          <Link href={returnHref} className="button button-secondary">
            ← {returnLabel}
          </Link>
        </div>

        <div className="card" style={{ display: "grid", gap: "1.25rem", padding: "1.5rem" }}>
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h1 style={{ marginTop: "0.75rem" }}>{title}</h1>
            <p style={{ marginTop: "0.75rem" }}>{description}</p>
          </div>

          <div
            style={{
              display: "grid",
              gap: "0.9rem",
              borderRadius: "24px",
              border: "1px solid rgba(120, 71, 47, 0.14)",
              background: "rgba(255,255,255,0.82)",
              padding: "1.5rem"
            }}
          >
            {paragraphs.map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 24)}`}
                style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.7, color: "#4f3a30" }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {pdfPath ? (
              <a href={pdfPath} target="_blank" rel="noreferrer" className="button button-primary">
                Открыть исходный PDF
              </a>
            ) : null}
            <Link href={returnHref} className="button button-secondary">
              {returnLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
