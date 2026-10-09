import { SiteHeader, SiteFooter } from "../../site-chrome";
import ExchangeClient from "../exchange-client";
export const metadata = {
  title: "Exchange Moderation | Control Lattice Systems",
  robots: { index: false, follow: false },
};
export default function Admin() {
  return (
    <main className="science-theme">
      <SiteHeader active="discussions" />
      <section className="science-page-hero">
        <div className="shell">
          <p className="eyebrow">COMMUNITY ADMINISTRATION</p>
          <h1>
            Exchange <em>moderation</em>
          </h1>
          <p>Review contributions, reports and member access.</p>
          <a href="/discussions">← Return to discussions</a>
        </div>
      </section>
      <section className="science-content">
        <div className="shell">
          <ExchangeClient admin />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
