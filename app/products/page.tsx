import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../site-chrome";

export const metadata: Metadata = {
  title: "Products & Services | Control Lattice Systems",
  description: "Engineering products, digital twins, integration services, and professional portfolio systems from Control Lattice Systems.",
};

const twins = [
  { key: "twin-discovery", name: "Twin Discovery", price: "$2,500", text: "A focused system assessment, use-case definition, signal map, architecture, and phased implementation plan." },
  { key: "twin-prototype", name: "Working Prototype", price: "$7,500+", text: "A functioning simulation with representative behavior, operator visualization, documented assumptions, and an acceptance demonstration." },
  { key: "twin-operational", name: "Operational Integration", price: "$20,000+", text: "A production-scoped twin connected to real interfaces, test workflows, monitoring, documentation, and team handoff." },
];

export default function ProductsPage() {
  return <main className="products-page">
    <SiteHeader active="products" />

    <section className="product-hero shell">
      <p className="eyebrow"><i/> Products &amp; services</p>
      <h1>Useful systems.<br/><em>Clear ways to begin.</em></h1>
      <p className="lede">Start with a defined package, then add engineering support where your equipment, workflow, or organization requires it.</p>
    </section>

    <section className="product-feature shell">
      <div className="product-copy">
        <p className="eyebrow"><i/> Instrumentation product</p>
        <h2>Source Stability Observer</h2>
        <p>A LabJack T8-based diagnostic package for synchronizing engineering signals with detector exposures, rejecting invalid samples, calculating bounded statistics, and presenting the result through EPICS and a Phoebus operator interface.</p>
        <ul className="product-list"><li>LabJack T8 data-acquisition hardware</li><li>Control Lattice software distribution and source</li><li>EPICS records and Phoebus GUI</li><li>Simulation, installation guide, and acceptance checklist</li><li>Read-only diagnostic architecture with explicit data-quality gates</li></ul>
        <div className="product-actions"><a className="button" href="/contact?service=observer">Request availability ↗</a><a className="text-link" href="https://github.com/Rainer1370/source-stability-observer" target="_blank" rel="noreferrer">Review the open project →</a></div>
      </div>
      <aside className="price-panel"><small>REFERENCE PACKAGE</small><strong>$2,800</strong><span>Current launch target</span><p>Based on one LabJack T8 at the manufacturer’s listed $1,400 unit price. Final quotes reflect hardware availability, shipping, tax, accessories, and application requirements.</p><hr/><h3>Integration &amp; commissioning</h3><p>Quoted separately for signal conditioning, interface development, deployment, validation, training, and ongoing support.</p><a href="/contact?service=observer-integration">Build an integration scope →</a></aside>
    </section>

    <section className="product-section shell">
      <div className="section-head"><div><p className="eyebrow"><i/> Digital twins</p><h2>From system model to operating tool.</h2></div><p>Digital-twin engagements begin with a bounded question and progress toward the level of fidelity, connectivity, and lifecycle support the system actually needs.</p></div>
      <div className="tier-grid">{twins.map((t, i) => <article className={i===1 ? "featured" : ""} key={t.name}><small>{i===0 ? "PLAN" : i===1 ? "PROVE" : "INTEGRATE"}</small><h3>{t.name}</h3><strong>{t.price}</strong><p>{t.text}</p><a href={`/contact?service=${t.key}`}>Discuss this tier →</a></article>)}</div>
      <p className="pricing-note">Starting prices establish a planning range. A written scope defines interfaces, fidelity, deliverables, acceptance criteria, schedule, and ownership before work begins.</p>
    </section>

    <section className="presence-wrap"><div className="presence shell"><div><p className="eyebrow"><i/> Professional presence</p><h2>A career story larger than one document.</h2><p>We create personal portfolio websites that complement a CV with deeper project evidence, technical writing, presentations, and links to professional accounts such as LinkedIn or a business-focused Instagram profile.</p><a className="button" href="/contact?service=portfolio">Discuss a portfolio site ↗</a></div><div className="presence-options"><article><small>PORTFOLIO WEBSITE</small><h3>Professional Portfolio Launch</h3><strong>From $1,500</strong><p>Positioning, responsive site, selected project pages, CV linkage, contact path, and professional-account connections.</p><a href="/contact?service=portfolio">See details &amp; inquire →</a></article><article><small>HYBRID SERVICE</small><h3>Career Campaign Partnership</h3><strong>Custom scope</strong><p>A background-based campaign with target-role analysis, opportunity screening, fitness metrics, custom CVs and cover letters, an active job tracker, outreach support, and interview preparation. The client reviews the strategy and approves every application.</p><a href="/contact?service=career">See details &amp; inquire →</a></article></div></div></section>

    <section className="contact"><div className="shell"><p className="eyebrow"><i/> Choose a starting point</p><h2>Tell us what you want to build, understand, or improve.</h2><p>We will turn the request into a practical scope with defined deliverables and decision points.</p><a className="button light" href="/contact?interest=Product%20or%20service%20inquiry">Start a conversation ↗</a></div></section>
    <SiteFooter />
  </main>;
}
