import { SiteHeader, SiteFooter } from "../../site-chrome";
export const metadata = {
  title: "Exchange Guidelines & Privacy | Control Lattice Systems",
};
export default function Privacy() {
  return (
    <main className="science-theme">
      <SiteHeader active="discussions" />
      <section className="science-page-hero">
        <div className="shell">
          <p className="eyebrow">THE ENGINEERING EXCHANGE</p>
          <h1>
            Guidelines & <em>privacy</em>
          </h1>
          <p>
            Good technical conversations depend on respect, evidence and
            sensible boundaries.
          </p>
        </div>
      </section>
      <section className="science-content">
        <div className="shell exchange-policy">
          <h2>Discuss ideas with care</h2>
          <p>
            Ask focused questions, explain your evidence, acknowledge
            uncertainty and disagree respectfully. Do not impersonate other
            people, post spam, harass participants or fabricate results. These
            discussions are general engineering exchanges; follow your
            organization’s formal procedures for safety decisions.
          </p>
          <h2>Keep sensitive information private</h2>
          <p>
            Never post passwords, credentials, proprietary designs, restricted
            facility information, confidential engineering documentation or
            sensitive personal information. Share only material you have
            permission to make public. Use <a href="/contact">Contact</a> for
            private inquiries.
          </p>
          <h2>Moderation</h2>
          <p>
            First contributions require approval. Administrators may grant
            trusted posting after a positive participation history. Edits return
            to review. Moderators can remove content, pin or lock discussions
            and review reports. Administrators can restrict abusive accounts.
            Report a contribution using its Report control, or contact us
            privately if you cannot sign in. Appeals and removal requests can be
            sent through Contact.
          </p>
          <h2>What we collect</h2>
          <p>
            Google verifies your identity. We store your Google subject
            identifier, chosen public display name, contributions, reactions,
            account permissions, reports and moderation records. We do not store
            or publish your email address, Google password or Google access
            tokens. Your public name and approved contributions are visible to
            everyone. Pending content and reports are visible to their authors
            and authorized moderators where appropriate.
          </p>
          <h2>Sessions and service providers</h2>
          <p>
            An essential, secure, HttpOnly cookie keeps you signed in for up to
            seven days. Google handles sign-in; Cloudflare and our hosting
            provider process requests and store community records. Sign-in
            attempts expire after ten minutes. Rate-limit records use
            short-lived counters and a salted hash of network addresses for
            sign-in abuse prevention. Hosting services may maintain their own
            operational logs. We do not sell community data or add advertising
            trackers.
          </p>
          <h2>Your data</h2>
          <p>
            Use My public profile and data to download your profile and
            contributions, change your display name or delete your account.
            Deletion removes your Google association, sessions, reactions and
            contribution text from the active community. A minimal anonymous
            record may remain to preserve reply relationships and moderation
            accountability. Backups may retain earlier data until their
            retention period expires; contact us about a specific deletion or
            privacy request. If self-service is unavailable, use{" "}
            <a href="/contact">Contact</a>.
          </p>
          <h2>Backup retention</h2>
          <p>
            Cloudflare D1 recovery follows the hosting provider’s configured
            Time Travel retention. Administrators should review that period and
            any exported backups before enabling posting. No additional exported
            backup schedule has been configured yet.
          </p>
          <a className="button" href="/discussions">
            Return to the Exchange →
          </a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
