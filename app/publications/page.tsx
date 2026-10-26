import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../site-chrome";

export const metadata: Metadata = {
  title: "Publications & Books | Control Lattice Systems",
  description: "Technical articles, peer-reviewed accelerator research, and books by Rob Rainer and Control Lattice Systems.",
  alternates: { canonical: "/publications" },
};

const articles = [
  { tag: "Recovery & commissioning", title: "The System Is Back Online. Is It Ready to Run?", text: "Why restoring communications does not establish operational readiness: fresh measurements, state reconciliation, command authority, and testing interrupted recovery.", href: "https://rainer1370.com/pages/articles/control-system-recovery-readiness.html" },
  { tag: "Diagnostics", title: "Source Stability Observer", text: "Synchronized acquisition, data-quality gates, bounded statistics and operator views for X-ray source diagnostics.", href: "https://rainer1370.com/pages/articles/source-stability-observer.html" },
  { tag: "Digital twins", title: "Accelerator Timing Digital Twin", text: "An EPICS simulation of timing drift, adaptive correction and beam-dump behavior.", href: "https://rainer1370.com/pages/articles/timingsim-writeup.html" },
  { tag: "Systems architecture", title: "Fusion Digital Twin DCS", text: "A facility-scale architecture connecting plant systems, controls, data and operator workflows.", href: "https://rainer1370.com/pages/articles/fusion-digital-twin-dcs-infrastructure.html" },
];

const papers = [
  { year: "2025", title: "Online regularization of Poincaré map of storage rings with Shannon entropy", journal: "Physical Review Accelerators and Beams", href: "https://www.researchgate.net/publication/390344413_Online_regularization_of_Poincare_map_of_storage_rings_with_Shannon_entropy" },
  { year: "2024", title: "Dedicated beam position monitor pair for model-independent lattice characterization at NSLS-II", journal: "Nuclear Instruments and Methods in Physics Research A", href: "https://www.researchgate.net/publication/381666620_Dedicated_beam_position_monitor_pair_for_model-independent_lattice_characterization_at_NSLS-II" },
  { year: "2022", title: "Designing linear lattices for round beam in electron storage rings using the solution by linear matrices analysis", journal: "Physical Review Accelerators and Beams", href: "https://www.researchgate.net/publication/360119372_Designing_linear_lattices_for_round_beam_in_electron_storage_rings_using_the_solution_by_linear_matrices_analysis" },
  { year: "2019", title: "Fast dynamic aperture optimization with reversal integration", journal: "Accelerator physics research", href: "https://www.researchgate.net/publication/337702988_Fast_dynamic_aperture_optimization_with_reversal_integration" },
];

const books = [
  { title: "The Observable Machine", subtitle: "A Field Guide to Instrumentation, Controls, and Complex Technical Systems", text: "A practical guide to making complex machines understandable through signals, state, timing, diagnostics and disciplined observation.", image: "/brand/the-observable-machine-cover.jpg", href: "https://a.co/d/01XD6ab9" },
  { title: "Shift Logic", subtitle: "40 self-paced deduction puzzles", text: "A satisfying coffee-break challenge for adults: forty clear deduction puzzles with no trivia or outside knowledge required.", image: "/brand/shift-logic-cover.png", href: "https://a.co/d/09bWn1nk" },
];

export default function PublicationsPage() {
  return <main className="publications-page"><SiteHeader active="work" />
    <section className="publication-hero"><div className="shell"><p className="eyebrow"><i/> Publications &amp; books</p><h1>Engineering knowledge,<br/><em>made useful.</em></h1><p>Practical technical articles, peer-reviewed research and books for people who build, operate and improve complex systems.</p></div></section>

    <section className="publication-section shell"><div className="publication-heading"><div><small>01 · PRACTICAL WORK</small><h2>Technical articles</h2></div><p>Public work on diagnostics, recovery, commissioning, timing and control system architecture.</p></div><div className="article-list">{articles.map(a => <article key={a.title}><small>{a.tag}</small><h3><a href={a.href} target="_blank" rel="noreferrer">{a.title}</a></h3><p>{a.text}</p><a className="publication-link" href={a.href} target="_blank" rel="noreferrer">Read article <span aria-hidden="true">↗</span></a></article>)}</div><a className="publication-index-link" href="https://rainer1370.com/pages/articles.html" target="_blank" rel="noreferrer">Browse all technical articles <span aria-hidden="true">↗</span></a></section>

    <section className="research-band"><div className="shell"><div className="publication-heading"><div><small>02 · PUBLISHED RESEARCH</small><h2>Accelerator science</h2></div><p>Selected collaborative research from Rob Rainer’s work at NSLS-II.</p></div><div className="paper-list">{papers.map(p => <a href={p.href} target="_blank" rel="noreferrer" key={p.title}><span>{p.year}</span><div><h3>{p.title}</h3><p>{p.journal}</p></div><b>Read paper ↗</b></a>)}</div><a className="research-profile publication-index-link" href="https://www.researchgate.net/profile/Rob-Rainer-3" target="_blank" rel="noreferrer">View Rob’s ResearchGate profile <span aria-hidden="true">↗</span></a></div></section>

    <section className="publication-section books-section shell"><div className="publication-heading"><div><small>03 · BOOKS</small><h2>Field guides &amp; thoughtful puzzles</h2></div><p>Practical engineering knowledge and self-paced deduction challenges.</p></div><div className="book-grid">{books.map(b => <article key={b.title}><a className="book-art" href={b.href} target="_blank" rel="noreferrer"><img src={b.image} alt={`Cover of ${b.title} by Rob Rainer`}/></a><div><small>BY ROB RAINER</small><h3>{b.title}</h3><h4>{b.subtitle}</h4><p>{b.text}</p><a className="button" href={b.href} target="_blank" rel="noreferrer">View on Amazon ↗</a></div></article>)}</div></section>

    <section className="contact"><div className="shell"><p className="eyebrow"><i/> Put the ideas to work</p><h2>Need help with a system that is difficult to observe, explain or improve?</h2><a className="button light" href="/contact">Start a conversation ↗</a></div></section><SiteFooter />
  </main>;
}
