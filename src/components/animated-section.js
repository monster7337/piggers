export function AnimatedSection({ id, className, children }) {
  return (
    <section id={id} className={`section${className ? ` ${className}` : ""}`}>
      {children}
    </section>
  );
}

