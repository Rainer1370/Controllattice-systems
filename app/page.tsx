import { SiteFooter, SiteHeader } from "./site-chrome";

const capabilities = [
  ["01", "Engineering Systems", "Controls, automation, instrumentation, digital twins and resilient infrastructure."],
  ["02", "AI & Knowledge", "Expert AI training, evaluation, technical review and practical workflow automation."],
  ["03", "Products & Publications", "Software, field tools, books and focused technical resources built from real work."],
  ["04", "Research & Contribution", "Open projects, technical briefs, experiments and useful participation in the wider community."],
];

const currentWork = [
  ["BUILDING", "Engineering tools", "Diagnostics, simulation and commissioning resources that make difficult systems easier to understand."],
  ["TRAINING", "Better technical AI", "Applying engineering judgment to AI training, evaluation and expert technical review."],
  ["PUBLISHING", "Practical knowledge", "Books, primers, videos and technical explanations made to be genuinely useful."],
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
    <div className="hero-copy"><p className="eyebrow"><i/> Engineering · Intelligence · Creation</p><h1>Making complex systems—and complex knowledge—work better.</h1><p className="lede">We build reliable engineering systems, train and apply AI, develop technical products, and publish practical knowledge.</p><div className="actions"><a className="button" href="/products">Explore our work →</a><a className="button ghost" href="/contact">Work with us →</a></div><div className="signal"><span>ENGINEERING</span><b/><span>AI</span><b/><span>PRODUCTS</span><b/><span>RESEARCH</span></div></div>
  </div></section>
  <section className="capability-strip"><div className="shell capability-grid">{capabilities.map(c=><article key={c[0]}><b>{c[0]}</b><div><h3>{c[1]}</h3><p>{c[2]}</p></div></article>)}</div></section>
  <section className="now-band"><div className="shell"><div className="band-head"><div><p className="eyebrow"><i/> Active practice</p><h2>What we’re working on now</h2></div><p>Control Lattice is an applied engineering and intelligence company. We solve client problems, build original tools, and contribute useful technical work in public.</p></div><div className="now-grid">{currentWork.map(item=><article key={item[0]}><small>{item[0]}</small><h3>{item[1]}</h3><p>{item[2]}</p></article>)}</div><div className="now-actions"><a className="button" href="/work">See current work →</a><a className="text-link" href="/ai">Explore AI &amp; knowledge work →</a></div></div></section>
  <section className="industry-band" id="industries"><div className="shell"><div className="band-head"><div><p className="eyebrow"><i/> Where experience matters</p><h2>Industries We Serve</h2></div><p>Critical systems demand more than software. They require an understanding of equipment, operators, data, risk, and the mission the facility exists to accomplish.</p></div><div className="industry-grid">{industries.map(x=><article key={x[1]}><img src={`/brand/${x[0]}`} alt=""/><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div></div></section>
  <section className="briefs-band"><div className="shell"><div className="band-head light"><div><p className="eyebrow"><i/> Work made visible</p><h2>Selected Work &amp; Technical Contributions</h2></div><a className="text-link" href="/work">View all work →</a></div><div className="brief-grid"><article><img src="/source-stability-phoebus.png" alt="Source Stability Observer interface"/><div><h3>Source Stability Observer</h3><p>Synchronized acquisition, data-quality gates and bounded statistics for investigating X-ray source variability.</p><a href="/work#sso">View brief →</a></div></article><article><img src="/timing-sim-gui.png" alt="Accelerator timing digital twin"/><div><h3>Accelerator Timing Digital Twin</h3><p>EPICS-based simulation of timing behavior, environmental drift and adaptive correction.</p><a href="/work#timing">View brief →</a></div></article><article><div className="brief-icon">AI</div><div><h3>AI Training &amp; Evaluation</h3><p>Expert technical judgment for model training, response evaluation and knowledge-intensive workflows.</p><a href="/ai">Explore practical AI →</a></div></article><article><div className="brief-icon">BOOKS</div><div><h3>Products &amp; Publications</h3><p>Technical primers, decision tools and publications that turn experience into reusable knowledge.</p><a href="/products">Explore products →</a></div></article></div></div></section>
  <section className="home-about"><div className="shell"><div><p className="eyebrow"><i/> Independent engineering practice</p><h2>Led by Rob Rainer</h2><p>More than 20 years across scientific facilities, controls, advanced instrumentation, data-center infrastructure, technical leadership, and systems integration.</p></div><div className="home-about-links"><a className="button" href="/about">About Control Lattice ↗</a><a className="text-link" href="/staff">Meet the staff →</a><a className="text-link" href="https://rainer1370.com" target="_blank" rel="noreferrer">Rob’s portfolio →</a></div></div></section>
  <section className="observable-callout"><div className="shell"><div><p className="eyebrow"><i/> Machine observability</p><h2>Can your machine explain why it failed?</h2><p>Turn alarms, commands, readbacks, interlocks, sequence state, timing, and operating context into evidence your team can actually use.</p></div><div><a className="button" href="/observable-machine">Explore the Observable Machine →</a><a className="text-link" href="/observable-machine#checklist">Download the free evidence checklist →</a></div></div></section>
  <section className="contact"><div className="shell"><p className="eyebrow"><i/> Start with the challenge</p><h2>What are you trying to build, understand, improve, or teach?</h2><p>Bring us the complex part. We’ll help turn it into a system, product, decision, or body of knowledge that works.</p><a className="button light" href="/contact">Start a conversation ↗</a></div></section>
  <SiteFooter />
</main>; }
