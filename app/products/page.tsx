import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../site-chrome";

export const metadata: Metadata = {
  title: "Products & Services | Control Lattice Systems",
  description: "Engineering products, digital twins, integration services, and professional portfolio systems from Control Lattice Systems.",
};

const twins = [
  { key: "twin-discovery", name: "Twin Discovery", price: "Custom quote", text: "A focused system assessment, use-case definition, signal map, architecture, and phased implementation plan." },
  { key: "twin-prototype", name: "Working Prototype", price: "Custom quote", text: "A functioning simulation with representative behavior, operator visualization, documented assumptions, and an acceptance demonstration." },
  { key: "twin-operational", name: "Operational Integration", price: "Custom quote", text: "A production-scoped twin connected to real interfaces, test workflows, monitoring, documentation, and team handoff." },
];

const reliabilityDeliverables = [
  "Controls and alarm-risk review",
  "Documentation and maintainability gap analysis",
  "Failure-mode and troubleshooting assessment",
  "Prioritized recommendations and modernization roadmap",
  "60-minute findings review with the engineering team",
];

const supportPlans = [
  { key: "support-monitor", name: "Engineering Monitor", price: "Custom quote", text: "A light recurring review of open risks, documentation changes, alarms, and technical questions." },
  { key: "support-partner", name: "Technical Partner", price: "Custom quote", text: "Reserved engineering capacity for reviews, troubleshooting, documentation, and practical improvement work." },
];

const toolkitItems = [
  "Commissioning dashboard with automatic progress totals",
  "Precommissioning, I/O checkout, and SAT trackers",
  "Alarm, interlock, punch-list, and signoff registers",
  "Editable Excel workbook plus concise PDF field guide",
];

export default function ProductsPage() {
  return <main className="products-page">
    <SiteHeader active="products" />

    <section className="product-hero shell">
      <p className="eyebrow"><i/> Products &amp; services</p>
      <h1>Useful systems.<br/><em>Clear ways to begin.</em></h1>
      <p className="lede">Start with a defined package, then add engineering support where your equipment, workflow, or organization requires it.</p>
    </section>

    <section className="tools-feature-wrap" id="lattice-lab"><div className="tools-feature shell">
      <div><p className="eyebrow"><i/> Free learning adventure · Playable pilot</p><h2>Lattice Lab: Station Rescue</h2><p>Think like a scientist. Fix like an engineer. Investigate a failing orbital station, repair its power, greenhouse, and rover, and practice math and science through evidence-based decisions. Two challenge levels, free hints, and a printable mission report.</p></div>
      <div className="tools-feature-actions"><span>Roughly ages 9–14+ · No signup · Solo or together on one screen</span><a className="button" href="/learn">Play Station Rescue ↗</a></div>
    </div></section>

    <section className="assessment-wrap" id="reliability-assessment"><div className="assessment shell">
      <div className="assessment-copy">
        <p className="eyebrow"><i/> Defined diagnostic engagement</p>
        <h2>Machine Observability Review</h2>
        <p>A focused remote review of controls reliability and the evidence your team needs to explain faults, alarms, and difficult restarts.</p>
        <ul className="product-list">{reliabilityDeliverables.map(item => <li key={item}>{item}</li>)}</ul>
        <p className="assessment-boundary">Designed for a bounded system or subsystem. A short intake confirms that the available information and scope fit the assessment before work begins.</p>
      </div>
      <aside className="price-panel assessment-price"><small>FIXED-FEE ASSESSMENT</small><strong className="quote-label">Scoped quote</strong><span>After a short consultation</span><p>We agree the system boundary, source materials, deliverables, schedule, and fixed fee before work begins. Includes a written findings report and a 60-minute findings review.</p><a className="button" href="/contact?service=observability-review">Request an assessment ↗</a></aside>
    </div></section>

    <section className="product-feature shell">
      <div className="product-copy">
        <p className="eyebrow"><i/> Instrumentation product</p>
        <h2>Source Stability Observer</h2>
        <p>A LabJack T8-based diagnostic package for synchronizing engineering signals with detector exposures, rejecting invalid samples, calculating bounded statistics, and presenting the result through EPICS and a Phoebus operator interface.</p>
        <ul className="product-list"><li>LabJack T8 data-acquisition hardware</li><li>Control Lattice software distribution and source</li><li>EPICS records and Phoebus GUI</li><li>Simulation, installation guide, and acceptance checklist</li><li>Read-only diagnostic architecture with explicit data-quality gates</li></ul>
        <div className="product-actions"><a className="button" href="/contact?service=observer">Request availability ↗</a><a className="text-link" href="https://github.com/Rainer1370/source-stability-observer" target="_blank" rel="noreferrer">Review the open project →</a></div>
      </div>
      <aside className="price-panel"><small>CONFIGURED PACKAGE</small><strong className="quote-label">Request a quote</strong><span>Matched to your application</span><p>A written quote confirms the hardware, accessories, software package, availability, and delivery requirements for your system.</p><hr/><h3>Integration &amp; commissioning</h3><p>Quoted separately for signal conditioning, interface development, deployment, validation, training, and ongoing support.</p><a href="/contact?service=observer-integration">Build an integration scope →</a></aside>
    </section>

    <section className="product-section shell">
      <div className="section-head"><div><p className="eyebrow"><i/> Digital twins</p><h2>From system model to operating tool.</h2></div><p>Digital-twin engagements begin with a bounded question and progress toward the level of fidelity, connectivity, and lifecycle support the system actually needs.</p></div>
      <div className="tier-grid">{twins.map((t, i) => <article className={i===1 ? "featured" : ""} key={t.name}><small>{i===0 ? "PLAN" : i===1 ? "PROVE" : "INTEGRATE"}</small><h3>{t.name}</h3><strong>{t.price}</strong><p>{t.text}</p><a href={`/contact?service=${t.key}`}>Discuss this tier →</a></article>)}</div>
      <p className="pricing-note">Each engagement receives a custom quote. A written scope defines interfaces, fidelity, deliverables, acceptance criteria, schedule, and ownership before work begins.</p>
    </section>

    <section className="product-section shell" id="ongoing-support">
      <div className="section-head"><div><p className="eyebrow"><i/> Recurring engineering support</p><h2>Keep improvements moving after the first assessment.</h2></div><p>Monthly support creates a predictable path for technical questions, documentation upkeep, diagnostic reviews, and prioritized reliability work without adding a full-time role.</p></div>
      <div className="support-grid">{supportPlans.map(plan => <article key={plan.key}><small>MONTHLY SUPPORT</small><h3>{plan.name}</h3><strong>{plan.price}</strong><p>{plan.text}</p><a href={`/contact?service=${plan.key}`}>Discuss fit and availability →</a></article>)}</div>
      <p className="pricing-note">Support begins only after scope, response expectations, included hours, and escalation boundaries are documented. Unused capacity and additional engineering are handled according to the written agreement.</p>
    </section>

    <section className="toolkit-wrap" id="commissioning-toolkit"><div className="toolkit shell">
      <div>
        <p className="eyebrow"><i/> Downloadable field toolkit</p>
        <h2>Controls Commissioning Toolkit</h2>
        <p>Keep commissioning evidence organized from first walkdown through final acceptance. Built for controls engineers, integrators, technicians, and project leads who need a practical record—not another blank template.</p>
        <ul className="product-list">{toolkitItems.map(item => <li key={item}>{item}</li>)}</ul>
        <p className="toolkit-note">Reusable on your own projects. Safety decisions, test procedures, and final acceptance remain the responsibility of qualified project personnel.</p>
        <p>For recovery test ideas, read <a className="text-link" href="https://rainer1370.com/pages/articles/control-system-recovery-readiness.html" target="_blank" rel="noreferrer">The System Is Back Online. Is It Ready to Run? ↗</a> The article covers stale data, retained controller state, and interruptions during restart.</p>
      </div>
      <aside className="toolkit-card"><small>ONE-TIME DOWNLOAD</small><strong>$19</strong><span>Excel workbook + PDF guide</span><p>Pay securely through the Control Lattice Systems Venmo business profile. Enter $19 and use <strong>Controls Commissioning Toolkit</strong> as the payment note.</p><a className="button" href="https://www.venmo.com/u/controllattice" target="_blank" rel="noreferrer">Pay $19 with Venmo ↗</a><a className="toolkit-help" href="/contact?service=commissioning-toolkit">Payment or delivery question →</a></aside>
    </div></section>

    <section className="review-wrap" id="technical-review"><div className="review shell">
      <div>
        <p className="eyebrow"><i/> Focused expert input</p>
        <h2>30-Minute Technical Clarity Session</h2>
        <p>Bring one bounded controls, automation, instrumentation, infrastructure, documentation, or engineering-career question. You will leave with a clearer problem statement, practical next steps, and a short written follow-up.</p>
        <ul className="product-list"><li>30-minute remote conversation</li><li>One defined technical question or decision</li><li>Three-point written follow-up</li><li>No sales obligation</li></ul>
        <p className="toolkit-note">This is advisory review, not stamped engineering, safety authorization, emergency response, or a substitute for site-qualified technical authority.</p>
      </div>
      <aside className="toolkit-card"><small>ONE-TIME SESSION</small><strong>$75</strong><span>30 minutes + concise follow-up</span><p>Start with the short intake so we can confirm the question fits. When confirmed, pay through Venmo and use <strong>Technical Clarity Session</strong> as the payment note.</p><a className="button" href="/contact?service=technical-review">Request a session ↗</a><a className="toolkit-help" href="https://www.venmo.com/u/controllattice" target="_blank" rel="noreferrer">Already confirmed? Pay with Venmo →</a></aside>
    </div></section>

    <section className="book-promo shell">
      <img src="/shift-logic-cover.png" alt="Shift Logic book cover"/>
      <div><p className="eyebrow"><i/> A five-minute mental reset</p><h2>Shift Logic</h2><p>Forty clear, self-paced deduction puzzles for adults—designed for a satisfying coffee-break challenge with no trivia or outside knowledge required.</p><a className="button" href="https://www.amazon.com/s?k=Shift+Logic+Robert+S+Rainer&i=stripbooks" target="_blank" rel="noreferrer">Find it on Amazon ↗</a></div>
    </section>

    <section className="tools-feature-wrap"><div className="tools-feature shell">
      <div><p className="eyebrow"><i/> Free public tools</p><h2>Small Useful Things</h2><p>Seven private, browser-based tools for clearer decisions, repair-or-replace comparisons, difficult messages, time and subscription costs, fair splits, and deadline planning.</p></div>
      <div className="tools-feature-actions"><span>No account required · Your entries stay in your browser</span><a className="button" href="https://tools.rainer1370.com" target="_blank" rel="noreferrer">Open the tools ↗</a></div>
    </div></section>

    <section className="presence-wrap"><div className="presence shell"><div><p className="eyebrow"><i/> Professional presence</p><h2>A career story larger than one document.</h2><p>We create personal portfolio websites that complement a CV with deeper project evidence, technical writing, presentations, and links to professional accounts such as LinkedIn or a business-focused Instagram profile.</p><a className="button" href="/contact?service=portfolio">Discuss a portfolio site ↗</a></div><div className="presence-options"><article><small>PORTFOLIO WEBSITE</small><h3>Professional Portfolio Launch</h3><strong>Custom quote</strong><p>Positioning, responsive site, selected project pages, CV linkage, contact path, and professional-account connections.</p><a href="/contact?service=portfolio">See details &amp; inquire →</a></article><article><small>HYBRID SERVICE</small><h3>Career Campaign Partnership</h3><strong>Custom scope</strong><p>A background-based campaign with target-role analysis, opportunity screening, fitness metrics, custom CVs and cover letters, an active job tracker, outreach support, and interview preparation. The client reviews the strategy and approves every application.</p><a href="/contact?service=career">See details &amp; inquire →</a></article></div></div></section>

    <section className="contact"><div className="shell"><p className="eyebrow"><i/> Choose a starting point</p><h2>Tell us what you want to build, understand, or improve.</h2><p>We will turn the request into a practical scope with defined deliverables and decision points.</p><a className="button light" href="/contact?interest=Product%20or%20service%20inquiry">Start a conversation ↗</a></div></section>
    <SiteFooter />
  </main>;
}
