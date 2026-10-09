import { SiteFooter, SiteHeader } from "../site-chrome";
export const metadata = { title: "The Engineering Exchange", description: "Technical questions and conversations about controls, scientific facilities, digital twins, and practical engineering." };
const topics = [
  ["Controls & Automation", "Troubleshooting, SCADA, EPICS, instrumentation and commissioning"],
  ["Scientific Facilities", "Accelerators, beamlines, fusion and research infrastructure"],
  ["AI & Diagnostics", "Observability, fault analysis and responsible AI workflows"],
  ["Digital Twins", "Simulation, model fidelity, validation and useful operator tools"],
  ["General Engineering", "Questions, ideas, collaborations and lessons from the field"],
];
const prompts = [
  ["Detection is not diagnosis", "What evidence helps you separate a symptom from its root cause?"],
  ["Digital twins that operators actually use", "What makes a model useful beyond a demonstration?"],
  ["Accelerator controls and fusion machines", "Where can scientific-controls experience transfer across fields?"],
];
const repo = "https://github.com/Rainer1370/Controllattice-systems";
export default function Discussions() { return <main className="science-theme"><SiteHeader active="discussions" />
<section className="science-page-hero"><div className="shell"><p className="eyebrow">OPEN TECHNICAL CONVERSATIONS</p><h1>The Engineering <em>Exchange</em></h1><p>Bring a question, share a practical lesson, or explore an idea with engineers and curious people. Good discussions start with curiosity, not a sales pitch.</p><div className="actions"><a className="button" href={repo+"/discussions"} target="_blank" rel="noreferrer">Browse discussions ↗</a><a className="button ghost" href="/contact?interest=Research%20or%20engineering%20collaboration">Discuss a collaboration →</a></div></div></section>
<section className="science-content"><div className="shell"><h2>Explore a topic</h2><div className="science-card-grid">{topics.map(([title,desc])=><article className="science-card" key={title}><small>ENGINEERING EXCHANGE</small><h3>{title}</h3><p>{desc}</p><a href={repo+"/discussions"} target="_blank" rel="noreferrer">Join the conversation ↗</a></article>)}</div>
<div style={{marginTop:64}}><p className="eyebrow">CONVERSATION STARTERS</p><h2>Questions worth exploring</h2><div className="science-card-grid">{prompts.map(([title,desc])=><article className="science-card" key={title}><h3>{title}</h3><p>{desc}</p><a href={repo+"/discussions"} target="_blank" rel="noreferrer">Discuss ↗</a></article>)}</div></div>
<div style={{marginTop:64,maxWidth:800}}><h2>How this community works</h2><p>We welcome thoughtful questions, respectful disagreement, practical experience, and research-informed discussion. Please do not share credentials, proprietary system details, restricted facility information, or anyone's personal information.</p><p>Our first version uses GitHub Discussions for public conversations and moderation. A free GitHub account is needed to participate. The community will open once Discussions is enabled in the repository.</p><p>Prefer a private conversation? <a href="/contact" style={{textDecoration:"underline"}}>Contact Control Lattice →</a></p></div></div></section><SiteFooter /></main>; }
