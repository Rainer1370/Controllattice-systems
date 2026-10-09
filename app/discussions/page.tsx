import { SiteFooter, SiteHeader } from "../site-chrome";
export const metadata = { title: "The Engineering Exchange", description: "An engineering discussion space for controls, research facilities, diagnostics and digital twins." };
const topics = [
  ["Controls & Automation", "SCADA, EPICS, commissioning and troubleshooting"],
  ["Scientific Facilities", "Accelerators, beamlines, fusion and research infrastructure"],
  ["AI & Diagnostics", "Observability, fault analysis and practical AI"],
  ["Digital Twins", "Simulation, validation and operational modeling"],
  ["General Engineering", "Questions, collaboration and field experience"],
];
const prompts = [
  ["Detection is not diagnosis", "What evidence helps you distinguish symptoms from root causes?", "Controls & Automation"],
  ["Digital twins that operators actually use", "What makes a model useful after the demonstration?", "Digital Twins"],
  ["Accelerator controls and fusion machines", "Where can experience transfer between scientific facilities?", "Scientific Facilities"],
];
export default function Discussions() { return <main className="science-theme"><SiteHeader active="discussions" />
<section className="science-page-hero"><div className="shell"><p className="eyebrow">CONTROL LATTICE COMMUNITY</p><h1>The Engineering <em>Exchange</em></h1><p>A place for engineers, researchers, technicians and curious people to share questions, lessons and ideas. No sales pitch required.</p><div className="actions"><a className="button" href="#topics">Explore topics ↓</a><a className="button ghost" href="/contact?interest=Research%20or%20engineering%20collaboration">Start a private conversation →</a></div></div></section>
<section className="science-content"><div className="shell"><p className="eyebrow">COMMUNITY PREVIEW</p><h2>Discussion space in development</h2><p style={{maxWidth:760,lineHeight:1.7,color:"#b7cbd1"}}>We are building native discussion threads and replies directly into this website, with Google sign-in and moderation. Public posting is not enabled yet. You can browse the proposed topics below or send us a question through Contact.</p>
<div id="topics" style={{marginTop:45}}><h2>Explore a topic</h2><div className="science-card-grid">{topics.map(([title,desc])=><article className="science-card" key={title}><small>TOPIC</small><h3>{title}</h3><p>{desc}</p></article>)}</div></div>
<div style={{marginTop:64}}><p className="eyebrow">CONVERSATION STARTERS</p><h2>Questions worth exploring</h2><div className="science-card-grid">{prompts.map(([title,desc,category])=><article className="science-card" key={title}><small>{category.toUpperCase()}</small><h3>{title}</h3><p>{desc}</p><a href={"/contact?interest=General%20question%20or%20technical%20discussion"}>Share your thoughts privately ↗</a></article>)}</div></div>
<div style={{marginTop:64,maxWidth:800}}><h2>Community guidelines</h2><p>Thoughtful technical discussion and respectful disagreement are welcome. Please do not share credentials, proprietary designs, restricted facility information, or private personal data. Public posts will be moderated once posting opens.</p><p>Have a question or want to collaborate now? <a href="/contact" style={{textDecoration:"underline"}}>Contact Control Lattice →</a></p></div></div></section><SiteFooter /></main>; }
