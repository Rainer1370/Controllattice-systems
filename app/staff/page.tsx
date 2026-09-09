import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../site-chrome";

export const metadata: Metadata = {
  title: "Staff | Control Lattice Systems",
  description: "Meet the human and digital staff of Control Lattice Systems, led by Managing Director and Principal Engineer Rob Rainer.",
};

const staff = [
  { initials:"CW", name:"Charles “Chuck” Weaver", title:"Chief Technology Officer", type:"Digital Executive", description:"Leads technical architecture, implementation planning, cloud infrastructure, engineering review, and quality assurance across Control Lattice initiatives." },
  { initials:"MS", name:"Mira Sterling", title:"Chief Marketing Officer", type:"Digital Executive", description:"Guides market research, positioning, content strategy, customer communication, and the translation of complex engineering capabilities into clear business value." },
  { initials:"AM", name:"Adrian Mercer", title:"Chief Operating Officer & Chief of Staff", type:"Digital Executive", description:"Coordinates priorities, operating plans, documentation, risks, and handoffs so strategy becomes organized, traceable execution." },
  { initials:"EV", name:"Eleanor Vale", title:"Legal Assistant", type:"Digital Staff", description:"Supports legal research, contract review, compliance issue-spotting, and source verification. Eleanor does not provide legal advice; consequential matters are reserved for Rob and qualified counsel." },
  { initials:"ND", name:"Nadiyah Deo'Rainer", title:"Junior Creative & Marketing Associate", type:"Junior Human Contributor", description:"Contributes optional, age-appropriate creative ideas, visitor-perspective website feedback, and supervised marketing support in collaboration with Mira." },
  { initials:"TC", name:"Technical Contributor", title:"Human Staff Contributor", type:"Profile Private", description:"Provides practical technical perspective, review, and implementation insight. Identity is withheld pending public-profile approval." },
  { initials:"DC", name:"Domain Contributor", title:"Human Staff Contributor", type:"Profile Private", description:"Contributes professional context, cross-disciplinary feedback, and grounded review. Identity is withheld pending public-profile approval." },
];

export default function StaffPage() {
  return <main className="staff-page">
    <SiteHeader active="staff" />
    <section className="staff-hero shell"><p className="eyebrow"><i/> Our operating team</p><h1>Human judgment.<br/><em>Digital leverage.</em></h1><p className="lede">Control Lattice Systems operates as an eight-member human-and-AI team. The practice is led by Rob Rainer, Managing Director & Principal Engineer.</p></section>
    <section className="leader shell"><div className="leader-mark" aria-hidden="true">RR</div><div className="leader-copy"><p className="eyebrow"><i/> Managing Director</p><h2>Rob Rainer</h2><h3>Managing Director & Principal Engineer</h3><p>Rob Rainer is a controls and systems engineering leader with more than 20 years of experience across scientific facilities, advanced instrumentation, accelerator operations, industrial automation, resilient computing infrastructure, and multidisciplinary technical leadership.</p><p>His work connects physical equipment, control software, operational data, and the people responsible for keeping complex systems reliable. His background includes EPICS-based control systems, precision motion, diagnostics, virtualization, data-center infrastructure, Azure virtual machines, digital twins, and practical applications of AI for technical knowledge and engineering workflows.</p><p>At Control Lattice Systems, Rob retains responsibility for engineering judgment, client commitments, technical direction, and final decisions.</p><div className="leader-actions"><a className="button" href="https://rainer1370.com" target="_blank" rel="noreferrer">View Rob’s engineering portfolio ↗</a><a className="text-link" href="/contact">Contact Control Lattice →</a></div></div></section>
    <section className="staff-roster shell"><div className="section-head"><div><p className="eyebrow"><i/> Staff</p><h2>Specialized roles, connected work.</h2></div><p>Each staff member supports a defined part of the practice while Rob maintains human oversight and professional accountability.</p></div><div className="staff-grid">{staff.map(member=><article className="staff-card" key={member.name}><div className="staff-initials" aria-hidden="true">{member.initials}</div><span className="staff-type">{member.type}</span><h3>{member.name}</h3><h4>{member.title}</h4><p>{member.description}</p></article>)}</div><p className="staff-disclosure">Digital executives and digital staff are software-based members of the operating team. Eleanor provides research and administrative support, not legal advice. Client commitments, legal decisions, and engineering accountability remain under Rob Rainer.</p></section>
    <section className="contact staff-cta"><div className="shell"><p className="eyebrow"><i/> Work with the team</p><h2>Bring us the system that needs clarity.</h2><p>Start with the technical problem, operating constraint, or modernization goal.</p><a className="button light" href="/contact">Start a conversation ↗</a></div></section>
    <SiteFooter />
  </main>;
}
