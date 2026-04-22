import clsx from "clsx";

export function SectionHeading({ eyebrow, title, description, mobileDescription, align = "left", actions }) {
  return (
    <div className={clsx("section-heading", align === "center" && "center")}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 className="section-title">{title}</h2>
      {description ? (
        <p className="section-copy">
          {mobileDescription ? (
            <>
              <span className="copy-desktop">{description}</span>
              <span className="copy-mobile">{mobileDescription}</span>
            </>
          ) : (
            description
          )}
        </p>
      ) : null}
      {actions ? <div className="section-actions">{actions}</div> : null}
    </div>
  );
}

