export default function Card({ title, subtitle, children, right }) {
  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="cardTitle">{title}</div>
          {subtitle ? <div className="cardSub">{subtitle}</div> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      <div className="cardBody">{children}</div>
    </div>
  );
}
