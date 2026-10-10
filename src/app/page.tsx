import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const quickStats = [
  { number: "03", label: "sample reports" },
  { number: "01", label: "neighbourhood" },
  { number: "0", label: "sent to the city" },
];

const steps = [
  {
    number: "01",
    title: "Spot something?",
    text: "A pothole, a dark streetlight, or an overflowing bin. Small things matter.",
    icon: "spark",
  },
  {
    number: "02",
    title: "See what’s nearby",
    text: "Browse local reports and find out what neighbours have already noticed.",
    icon: "pin",
  },
  {
    number: "03",
    title: "Keep the loop visible",
    text: "Follow a report from new to resolved, with clear updates along the way.",
    icon: "check",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero page-shell">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              A little care goes a long way
            </span>
            <h1>
              A better block
              <br />
              starts with <span>all of us.</span>
            </h1>
            <p className="hero-description">
              CivicFix is a simple place to notice local issues, see what’s
              happening nearby, and keep track together.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/issues">
                Explore sample reports
                <span aria-hidden="true">↗</span>
              </Link>
              <span className="action-note">A community demo, not a city service</span>
            </div>
            <div className="hero-proof">
              <span className="avatar-stack" aria-hidden="true">
                <span>J</span>
                <span>M</span>
                <span>A</span>
              </span>
              <p>
                Neighbourhood care
                <br />
                <strong>begins with noticing.</strong>
              </p>
            </div>
          </div>

          <div className="hero-art" aria-label="Illustration of a cared-for neighbourhood">
            <div className="art-sun" />
            <div className="art-label">
              <span className="art-label-icon" aria-hidden="true">✳</span>
              <span>
                <strong>Our neighbourhood</strong>
                <small>Better, together</small>
              </span>
            </div>
            <div className="art-cloud art-cloud-one" />
            <div className="art-cloud art-cloud-two" />
            <div className="art-ground" />
            <div className="art-house house-one">
              <div className="roof" />
              <div className="house-body">
                <span className="window" />
                <span className="door" />
                <span className="window" />
              </div>
            </div>
            <div className="art-house house-two">
              <div className="roof" />
              <div className="house-body">
                <span className="window" />
                <span className="door" />
                <span className="window" />
              </div>
            </div>
            <div className="art-tree tree-one"><i /><b /></div>
            <div className="art-tree tree-two"><i /><b /></div>
            <div className="art-path" />
            <div className="art-pin">
              <span className="pin-dot" />
              <span>Right around the corner</span>
            </div>
            <div className="art-sparkle sparkle-one">✳</div>
            <div className="art-sparkle sparkle-two">✳</div>
          </div>
        </section>

        <section className="stats-band page-shell" aria-label="Demo overview">
          <div className="stats-intro">
            <span className="tiny-label">A SMALL DEMO</span>
            <p>Just enough to show what looking out for each other can feel like.</p>
          </div>
          {quickStats.map((stat) => (
            <div className="stat-item" key={stat.label}>
              <strong>{stat.number}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="how-section page-shell">
          <div className="section-heading">
            <span className="eyebrow">Simple by design</span>
            <h2>Good neighbours make<br />good things happen.</h2>
            <p>No fuss. Just a clearer picture of the little things that shape a neighbourhood.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step-card" key={step.number}>
                <div className={`step-icon step-icon-${step.icon}`} aria-hidden="true">
                  {step.icon === "spark" ? "✳" : step.icon === "pin" ? "⌖" : "✓"}
                </div>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="closing-cta page-shell">
          <div>
            <span className="tiny-label">TAKE A LOOK AROUND</span>
            <h2>Every better block<br />begins with a first look.</h2>
          </div>
          <Link className="button button-light" href="/issues">
            Browse demo reports
            <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>
      <footer className="site-footer page-shell">
        <span>© CivicFix demo</span>
        <span>Made for neighbours, not a municipal service.</span>
      </footer>
    </>
  );
}
