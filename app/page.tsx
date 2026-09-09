import { SiteFooter, SiteHeader } from "./site-chrome";

const capabilities = [
  ["01", "Control Systems", "Architecture, integration and modernization for scientific and industrial facilities."],
  ["02", "Diagnostics & Instrumentation", "Synchronized measurements, quality gates and visualization that turn signals into evidence."],
  ["03", "Digital Twins & Simulation", "Models for validation, controls development, operator training and design decisions."],
  ["04", "AI Engineering Solutions", "Practical AI for engineering workflows, operations, documentation and technical knowledge."],
  ["05", "Data Centers & Infrastructure", "Monitoring, virtualization and resilient systems for mission-critical environments."],
];

const industries = [
  ["industry-1.jpg", "National Laboratories", "Accelerators, beamlines, experiments and facility controls."],
  ["industry-2.jpg", "Advanced Scientific Facilities", "X-ray, neutron and high-energy instrumentation."],
  ["industry-3.jpg", "Industrial & Advanced Manufacturing", "Automation, modernization and diagnostics."],
  ["industry-4.jpg", "Data Centers & Critical Infrastructure", "Monitoring, controls and operational resilience."],
  ["industry-5.jpg", "Energy & Emerging Technologies", "Controls, simulation and instrumentation for next-generation systems."],
];

export default function Home() { return <main className="science-theme">
  <SiteHeader active="home" />
  <section className="science-hero"><div className="science-hero-bg"/><div className="shell science-hero-grid">
    <aside className="hero-person"><img src="/brand/rob-control-room.png" alt="Rob Rainer in a scientific controls environment"/><div className="person-label"><strong>ROB RAINER</strong><span>Managing Director &amp; Principal Engineer</span></div></aside>
    <div className="hero-copy"><p className="eyebrow"><i/> Science · Industry · Infrastructure</p><h1>Advanced Control Systems<br/>for a More Capable World.</h1><p className="lede">Engineering, AI, and automation for scientific facilities, critical infrastructure, and complex industrial systems.</p><div className="actions"><a className="button" href="/products">Our solutions →</a><a className="button ghost" href="/work">Technical briefs →</a></div><div className="signal"><span>CONTROLS</span><b/><span>DIAGNOSTICS</span><b/><span>DATA</span><b/><span>INSIGHT</span></div></div>
  </div></section>
  <section className="capability-strip"><div className="shell capability-grid">{capabilities.map(c=><article key={c[0]}><b>{c[0]}</b><div><h3>{c[1]}</h3><p>{c[2]}</p></div></article>)}</div></section>
  <section className="industry-band" id="industries"><div className="shell"><div className="band-head"><div><p className="eyebrow"><i/> Where experience matters</p><h2>Industries We Serve</h2></div><p>Critical systems demand more than software. They require an understanding of equipment, operators, data, risk, and the mission the facility exists to accomplish.</p></div><div className="industry-grid">{industries.map(x=><article key={x[1]}><img src={`/brand/${x[0]}`} alt=""/><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div></div></section>
  <section className="briefs-band"><div className="shell"><div className="band-head light"><div><p className="eyebrow"><i/> Demonstrated engineering</p><h2>Featured Technical Briefs</h2></div><a className="text-link" href="/work">View all technical work →</a></div><div className="brief-grid"><article><img src="/source-stability-phoebus.png" alt="Source Stability Observer interface"/><div><h3>Source Stability Observer</h3><p>Synchronized acquisition, data-quality gates and bounded statistics for investigating X-ray source variability.</p><a href="/work#sso">View brief →</a></div></article><article><img src="/timing-sim-gui.png" alt="Accelerator timing digital twin"/><div><h3>Accelerator Timing Digital Twin</h3><p>EPICS-based simulation of timing behavior, environmental drift and adaptive correction.</p><a href="/work#timing">View brief →</a></div></article><article><div className="brief-icon">EPICS</div><div><h3>Controls Architecture</h3><p>Maintainable patterns for instrumentation, operator interfaces and complex facility controls.</p><a href="/products">Explore controls →</a></div></article><article><div className="brief-icon">AZURE</div><div><h3>Hybrid Infrastructure</h3><p>Centralized visibility for on-premises systems without moving deterministic control into the cloud.</p><a href="/work#azure">View brief →</a></div></article></div></div></section>
  <section className="home-about"><div className="shell"><div><p className="eyebrow"><i/> Independent engineering practice</p><h2>Led by Rob Rainer</h2><p>More than 20 years across scientific facilities, controls, advanced instrumentation, data-center infrastructure, technical leadership, and systems integration.</p></div><div className="home-about-links"><a className="button" href="/about">About Control Lattice ↗</a><a className="text-link" href="/staff">Meet the staff →</a><a className="text-link" href="https://rainer1370.com" target="_blank" rel="noreferrer">Rob’s portfolio →</a></div></div></section>
  <section className="contact"><div className="shell"><p className="eyebrow"><i/> Start with the system</p><h2>What needs to become clearer, more reliable, or easier to operate?</h2><p>Tell us what you are working with and what a better outcome would look like.</p><a className="button light" href="/contact">Start a conversation ↗</a></div></section>
  <SiteFooter />
</main>; }
