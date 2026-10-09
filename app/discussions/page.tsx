import { SiteFooter, SiteHeader } from "../site-chrome";
import ExchangeClient from "./exchange-client";
export const metadata = {
  title: "The Engineering Exchange | Control Lattice Systems",
  description:
    "Thoughtful technical discussion about controls, scientific facilities, AI diagnostics and digital twins.",
};
export default function Discussions() {
  return (
    <main className="science-theme">
      <SiteHeader active="discussions" />
      <section className="science-page-hero">
        <div className="shell">
          <p className="eyebrow">CONTROL LATTICE COMMUNITY</p>
          <h1>
            The Engineering <em>Exchange</em>
          </h1>
          <p>
            A place for engineers, researchers, technicians and curious people
            to share questions, lessons and ideas. No sales pitch required.
          </p>
          <div className="actions">
            <a className="button" href="#community">
              Explore discussions ↓
            </a>
            <a
              className="button ghost"
              href="/contact?interest=Research%20or%20engineering%20collaboration"
            >
              Start a private conversation →
            </a>
          </div>
        </div>
      </section>
      <section id="community" className="science-content">
        <div className="shell">
          <ExchangeClient />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
