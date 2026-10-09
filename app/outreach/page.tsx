import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../site-chrome";

export const metadata: Metadata = {
  title: "Community & Venture Outreach | Control Lattice Systems",
  description: "Community technology support, sponsored technical reviews, and client-originated ventures from Control Lattice Systems.",
};

export default function OutreachPage() {
  return <main>
    <SiteHeader active="outreach" />
    <section className="outreach-hero"><div className="shell">
      <p className="eyebrow"><i/> Community &amp; venture outreach</p>
      <h1>Practical technology support for organizations doing useful work.</h1>
      <p className="lede">Control Lattice reserves a small amount of capacity for community-serving organizations, and helps promising client-originated ideas reach a responsible first pilot.</p>
      <div className="actions"><a className="button" href="#community-support">See community programs →</a><a className="button ghost" href="#same-frequency">Explore Same Frequency →</a></div>
    </div></section>
    <section className="outreach-intro shell"><div>
      <p className="eyebrow"><i/> A bounded commitment</p><h2>Useful help, with a clear scope.</h2>
    </div><div>
      <p>Small organizations often know exactly what is not working but cannot justify a full consulting engagement just to identify the right next step. These offers provide a short, structured technical review—not an open-ended promise of free implementation.</p>
      <p>Free capacity is deliberately limited. Sponsors can underwrite additional reviews so participating organizations receive useful guidance without making the program financially unsustainable.</p>
    </div></section>
    <section className="venture-callout" id="same-frequency"><div className="shell"><div>
      <p className="eyebrow"><i/> Client-originated venture</p><h2>Same Frequency</h2>
      <p>A client request became a broader idea: a privacy-conscious dating pilot built around communication, routines, sensory comfort, planning, and the practical ways different minds relate.</p>
      <p>Control Lattice Systems is incubating the concept and conducting outreach for Long Island pilot participants, community referral partners, sponsors, and potential investors.</p>
    </div><div className="venture-actions">
      <a className="button" href="https://samefrequencydating.com/pilot" target="_blank" rel="noreferrer">Join the pilot →</a>
      <a className="button ghost" href="mailto:contact@controllattice.com?subject=Same%20Frequency%20Community%20Partnership">Refer participants or partner →</a>
      <a className="text-link" href="mailto:contact@controllattice.com?subject=Same%20Frequency%20Sponsor%20or%20Investor%20Inquiry">Discuss sponsorship or investment →</a>
    </div></div></section>
    <section className="community-programs shell" id="community-support">
      <p className="eyebrow"><i/> Community technology support</p><h2>Start with the smallest useful intervention.</h2>
      <p>For eligible Long Island and New York community-serving organizations, we offer two tightly scoped ways to clarify a technical problem before committing scarce time or money.</p>
      <div className="program-grid">
        <article className="program-card featured"><small>Limited free capacity</small><h3>Community Technology Triage</h3><strong>$0 · up to two each month</strong><p>A focused 30-minute conversation for a nonprofit, volunteer group, school program, or small community-serving business with a specific technology or systems problem.</p><ul><li>Problem framing and constraint check</li><li>Three priority risks or opportunities</li><li>A concise written next-step note</li></ul><a className="text-link" href="mailto:contact@controllattice.com?subject=Community%20Technology%20Triage%20Request">Request a triage →</a></article>
        <article className="program-card"><small>Reduced-cost review</small><h3>Community Systems Snapshot</h3><strong>$495 · 50% community rate</strong><p>A compact technical analysis for an organization that needs more than a conversation but is not ready for a full engineering engagement.</p><ul><li>One working session and document review</li><li>System, workflow, reliability, or data-flow analysis</li><li>Short findings report with a prioritized action plan</li></ul><a className="text-link" href="mailto:contact@controllattice.com?subject=Community%20Systems%20Snapshot">Ask about eligibility →</a></article>
      </div>
    </section>
    <section className="eligibility-band"><div className="shell"><div><p className="eyebrow"><i/> Who this is for</p><h2>Community benefit comes first.</h2><p>Priority goes to small organizations with a clear public or local benefit and a problem within our technical competence.</p></div><div><ul><li>Nonprofits, mutual-aid groups, schools, libraries, and youth or family programs</li><li>Small businesses that provide a demonstrable community service</li><li>Projects involving systems, workflows, automation, data quality, monitoring, reliability, or technical decision-making</li></ul><p>These programs do not include emergency response, regulated engineering sign-off, penetration testing, safety certification, or guaranteed implementation. Requests are accepted based on fit and available capacity.</p></div></div></section>
    <section className="outreach-funding"><div className="shell"><div><p className="eyebrow"><i/> Extend the impact</p><h2>Sponsor a review or support an outreach project.</h2><p>A sponsor can fund a Community Systems Snapshot for an eligible organization, expand the number of free triage sessions available, or support the responsible pilot of a client-originated venture. Sponsorship does not influence findings or create an investment offering.</p></div><div className="venture-actions"><a className="button" href="mailto:contact@controllattice.com?subject=Sponsor%20a%20Community%20Technology%20Review">Sponsor a community review →</a><a className="button ghost" href="https://www.venmo.com/u/controllattice" target="_blank" rel="noreferrer">Contribute to outreach →</a><a className="text-link" href="/contact">Discuss a community partnership →</a></div></div></section>
    <SiteFooter />
  </main>;
}
