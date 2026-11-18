import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../site-chrome";

export const metadata: Metadata = {
  title: "CL-TS100 Accelerator Timing System | Control Lattice Systems",
  description: "Ethernet-native event generator / event receiver timing system for accelerators, beamlines, and test stands. 8b/10b fiber event stream, direct master-oscillator lock, GPS discipline, and an EPICS IOC on every node.",
  keywords: ["accelerator timing system", "event generator", "event receiver", "EVG", "EVR", "EPICS timing", "MRF alternative", "beamline timing", "8b/10b event stream"],
  alternates: { canonical: "/timing-system" },
  openGraph: { title: "Event timing without the crate.", description: "A two-node EVG/EVR timing system with direct RF lock, GPS-disciplined time, and EPICS built in. In development at Control Lattice Systems.", url: "/timing-system", type: "website" },
};

const specs = [
  ["Event link", "8b/10b serial event stream over fiber (SFP), 1.25 or 2.5 Gbps, event clock up to 125 MHz. 256 event codes with a distributed-bus byte and a data-buffer channel in every frame."],
  ["Sequencing", "Dual sequence RAMs of 2,048 timestamp / event-code entries each — single, continuous, and alternating modes — plus seven multiplexed counters and software, external, and AC-line trigger sources."],
  ["Clocking", "Direct phase lock to the machine master oscillator at the transceiver reference input (up to ~500 MHz, no external prescaler), internal synthesis for bench work, and GPS 1 PPS discipline."],
  ["Time & metadata", "A 64-bit timestamp distributed in the event stream, 2 KB data-buffer frames for shot metadata, and an on-node NTP server disciplined by a fabric-timestamped PPS input."],
  ["Controls", "An EPICS 7 IOC runs on every node — no crate CPU. Register-level compatibility with the established EVG/EVR database model, Phoebus-ready, autosave and procServ in the standard pattern."],
  ["Form factor", "Self-contained Ethernet nodes. Bench format today; a 1U rack shelf carrying two nodes is the planned productization step. TTL event I/O on the expansion header; the serial event domain is CML at the optics."],
];

const nodes = [
  { key: "timing-evg", name: "CL-EVG100 Event Generator", price: "$4,950", text: "Dual sequencers, multiplexed counters, data-buffer transmitter, external RF/MO lock, GPS PPS discipline, and the system timestamp source." },
  { key: "timing-evr", name: "CL-EVR100 Event Receiver", price: "$3,250", text: "Clock recovery from the fiber stream, event map RAM, programmable delay/width pulse generators, timestamp latching, and TTL + CML outputs." },
  { key: "timing-integration", name: "Integration & Commissioning", price: "Quoted", text: "Sequence programming, controls integration, acceptance testing against your event list, and operator handoff — scoped and quoted per facility." },
];

export default function TimingSystemPage() {
  return <main className="products-page">
    <SiteHeader active="products" />

    <section className="product-hero shell">
      <p className="eyebrow"><i/> Accelerator timing — in development</p>
      <h1>Event timing.<br/><em>Without the crate.</em></h1>
      <p className="lede">The CL-TS100 is an Ethernet-native event generator / event receiver system for small accelerators, beamlines, and test stands — the class of timing the VME era defined, rebuilt on modern SoC/FPGA nodes with the EPICS IOC running on the node itself.</p>
    </section>

    <section className="product-feature shell">
      <div className="product-copy">
        <p className="eyebrow"><i/> Starter system</p>
        <h2>CL-TS100 Timing System</h2>
        <p>One event generator and one event receiver, linked by fiber, disciplined by GPS, and lockable directly to your master oscillator. Sequence tables, multiplexed counters, distributed timestamps, and shot metadata travel in the same 8b/10b event stream facilities have trusted for decades — generated and decoded in FPGA fabric, supervised by an EPICS IOC on each node.</p>
        <ul className="product-list"><li>CL-EVG100 event generator + CL-EVR100 event receiver</li><li>Fiber optic link kit (SFP modules and patch cables)</li><li>GPS reference with 1 PPS discipline and on-node NTP service</li><li>EPICS IOC, database set, and Phoebus operator screens</li><li>Bench signal source for master-oscillator simulation and lock testing</li></ul>
        <div className="product-actions"><a className="button" href="/contact?service=timing-system">Discuss a founding system ↗</a><a className="text-link" href="#status">What is proven, what is next →</a></div>
      </div>
      <aside className="price-panel"><small>STARTER SYSTEM</small><strong>$9,950</strong><span>Founding systems — in development</span><p>A two-node working system at a price a facility can approve without a capital cycle. Final quotes reflect configuration, optics, and delivery requirements.</p><hr/><h3>Expansion nodes</h3><p>Additional event receivers at $3,250 and generators at $4,950 extend the same system — one generator fans out to every receiver on the fiber plant.</p><a href="/contact?service=timing-nodes">Plan a node layout →</a></aside>
    </section>

    <section className="product-section shell">
      <div className="section-head"><div><p className="eyebrow"><i/> System specification</p><h2>Facility timing, node by node.</h2></div><p>Every figure below is a design target for the bench system now in build, stated the way we would want it stated to us.</p></div>
      <div className="evidence-grid">{specs.map((item, i) => <article key={item[0]}><small>0{i + 1}</small><h3>{item[0]}</h3><p>{item[1]}</p></article>)}</div>
    </section>

    <section className="product-section shell">
      <div className="section-head"><div><p className="eyebrow"><i/> Building blocks</p><h2>Buy the system, or the nodes.</h2></div><p>The starter system is the fastest path to a working installation. Nodes are also available individually for facilities extending an existing event plant.</p></div>
      <div className="tier-grid">{nodes.map((t, i) => <article className={i === 0 ? "featured" : ""} key={t.name}><small>{i === 0 ? "GENERATE" : i === 1 ? "RECEIVE" : "INTEGRATE"}</small><h3>{t.name}</h3><strong>{t.price}</strong><p>{t.text}</p><a href={`/contact?service=${t.key}`}>Discuss this node →</a></article>)}</div>
      <p className="pricing-note">Prices are list for the founding production run. A written scope defines interfaces, event lists, acceptance criteria, schedule, and support terms before work begins.</p>
    </section>

    <section className="book-band" id="status"><div className="shell book-grid"><div><p className="eyebrow"><i/> Development status</p><h2>Proven in the control plane.<br/><em>Building the fiber plane.</em></h2><p>We publish the state of this product the way we publish the state of a machine: what is verified, and what is not yet.</p><ul className="product-list"><li><strong>Proven:</strong> the EPICS control layer — the production EVG/EVR driver stack runs against our register model today, with reads and writes verified at the device-memory level</li><li><strong>Proven:</strong> direct master-oscillator lock and GPS discipline are established at the component level (transceiver reference range and clock synthesis verified against datasheets)</li><li><strong>In build:</strong> the FPGA event cores — 8b/10b stream generation, sequencing, clock recovery, and pulse generation</li><li><strong>Next:</strong> the two-node fiber demonstration, then founding systems</li></ul><div className="product-actions"><a className="button" href="/contact?service=timing-system">Follow the build ↗</a></div></div><aside className="price-panel"><small>WHY NOW</small><strong>The 230 era is ending</strong><span>Its replacement should not cost like it</span><p>The VME event-timing generation many facilities still run is no longer in production, and its successors are quoted, crate-based, and priced for large laboratories. Small facilities and test stands need the same determinism at a scale they can approve.</p><hr/><h3>Built by operators</h3><p>Designed by engineers who commissioned and operated event timing at a national synchrotron facility — and who still have to make it work at 3 a.m.</p><a href="/about">About Control Lattice →</a></aside></div></section>

    <section className="contact"><div className="shell"><p className="eyebrow"><i/> Founding systems</p><h2>Bring us your event list.</h2><p>Tell us the machine, the RF frequency, and the events you need to distribute. We will turn it into a node layout and a written scope.</p><a className="button light" href="/contact?service=timing-system">Start a conversation ↗</a></div></section>
    <SiteFooter />
  </main>;
}
