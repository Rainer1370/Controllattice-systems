"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { SiteFooter, SiteHeader } from "../site-chrome";

const endpoint =
  "https://script.google.com/macros/s/AKfycbwS1mWml8VqK2NyQe1r0N7mSjPwl1ay_yn79O6Z-MOy03i8m6QmoOkiU-fqdoOb85sZ/exec";

const serviceDetails: Record<string, { title: string; interest: string; summary: string; message: string }> = {
  portfolio: { title: "Professional Portfolio Launch", interest: "Portfolio website", summary: "A responsive professional website with positioning, selected project pages, deeper evidence than a CV can hold, CV linkage, a contact path, and connections to professional accounts such as LinkedIn and a business-focused Instagram profile.", message: "I’m interested in a Professional Portfolio Launch. I’d like to discuss my background, the projects and professional accounts to feature, and the goals for the site." },
  career: { title: "Career Campaign Partnership", interest: "Career campaign partnership", summary: "A hybrid, client-directed campaign including background analysis, target-role strategy, opportunity screening, role-fitness metrics, custom CVs and cover letters, an active job tracker, outreach support, and interview preparation. The client reviews the strategy and approves every application.", message: "I’m interested in a Career Campaign Partnership. I’d like to discuss my background, target roles, location and compensation preferences, current application materials, and the level of campaign support I need." },
  observer: { title: "Source Stability Observer", interest: "Source Stability Observer", summary: "A LabJack T8-based diagnostic package with the Control Lattice software distribution and source, EPICS records, Phoebus GUI, simulation, installation guidance, data-quality gates, and an acceptance checklist.", message: "I’m interested in Source Stability Observer package availability. Please contact me about my application, signal requirements, timing needs, and anticipated deployment environment." },
  "observer-integration": { title: "Observer Integration & Commissioning", interest: "Source Stability Observer", summary: "Application-specific engineering for signal conditioning, interface development, deployment, validation, operator training, documentation, and ongoing support.", message: "I’m interested in Source Stability Observer integration and commissioning. I’d like to discuss the equipment, signals, controls environment, validation needs, and support expectations." },
  "twin-discovery": { title: "Twin Discovery", interest: "Digital twin package", summary: "A focused system assessment, use-case definition, signal map, architecture, and phased implementation plan.", message: "I’m interested in a Twin Discovery engagement. I’d like to discuss the system, the decisions the twin should support, available data and interfaces, and the desired implementation path." },
  "twin-prototype": { title: "Working Prototype", interest: "Digital twin package", summary: "A functioning simulation with representative behavior, operator visualization, documented assumptions, and an acceptance demonstration.", message: "I’m interested in a Working Digital Twin Prototype. I’d like to discuss the required behavior, fidelity, interfaces, visualization, and acceptance demonstration." },
  "twin-operational": { title: "Operational Integration", interest: "Digital twin package", summary: "A production-scoped twin connected to real interfaces, test workflows, monitoring, documentation, and team handoff.", message: "I’m interested in Operational Digital Twin Integration. I’d like to discuss the production interfaces, fidelity, test workflows, monitoring, documentation, and lifecycle support required." },
};

export default function Contact() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedService, setSelectedService] = useState<(typeof serviceDetails)[string] | null>(null);
  const interestRef = useRef<HTMLSelectElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");
    const detail = service ? serviceDetails[service] : null;
    if (detail) {
      // Query-string state is initialized after hydration so guided inquiries remain linkable.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedService(detail);
      if (interestRef.current) interestRef.current.value = detail.interest;
      if (messageRef.current && !messageRef.current.value) messageRef.current.value = detail.message;
      return;
    }
    const requested = params.get("interest");
    if (!requested || !interestRef.current) return;
    const normalized = requested.toLowerCase();
    const fallback = normalized.includes("twin")
      ? "digital twin package"
      : normalized.includes("observer")
        ? "source stability observer"
        : normalized.includes("portfolio")
          ? "portfolio website"
          : normalized.includes("career")
            ? "career campaign partnership"
            : normalized;
    const exact = Array.from(interestRef.current.options).find(
      (option) => option.text.toLowerCase() === fallback,
    );
    if (exact) interestRef.current.value = exact.value;
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    data.set("source_page", window.location.href);
    setSending(true);
    setStatus("Sending your inquiry…");
    try {
      await fetch(endpoint, { method: "POST", body: data, mode: "no-cors" });
      form.reset();
      setStatus(
        "Thank you. Your inquiry has been sent to ControlLattice Systems.",
      );
    } catch {
      setStatus(
        "The form could not connect. Please email contact@controllattice.com.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="contact-page">
      <SiteHeader active="contact" />
      <section className="contact contact-page-section">
        <div className="shell contact-grid">
          <div className="contact-intro">
            <p className="eyebrow">
              <i /> Start with the system
            </p>
            <h1>
              What is getting lost between your equipment, data, and people?
            </h1>
            <p>
              Tell us what you are operating, where the friction is, and what a
              better outcome would look like. We will respond from{" "}
              <strong>contact@controllattice.com</strong>.
            </p>
          </div>
          <form className="contact-form" onSubmit={submit} noValidate>
            {selectedService && <aside className="selected-service"><small>SELECTED SERVICE</small><h2>{selectedService.title}</h2><p>{selectedService.summary}</p></aside>}
            <div className="form-grid">
              <label>
                <span>
                  Name <b>*</b>
                </span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  maxLength={150}
                  required
                />
              </label>
              <label>
                <span>Company / organization</span>
                <input
                  type="text"
                  name="company"
                  autoComplete="organization"
                  maxLength={200}
                />
              </label>
              <label>
                <span>
                  Work email <b>*</b>
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </label>
              <label>
                <span>Phone</span>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  maxLength={50}
                />
              </label>
              <label>
                <span>Area of interest</span>
                <select name="interest" defaultValue="" ref={interestRef}>
                  <option value="">Select an area</option>
                  <option>Industrial controls & automation</option>
                  <option>EPICS integration & modernization</option>
                  <option>Digital twins & simulation</option>
                  <option>Azure & hybrid infrastructure</option>
                  <option>AI workflow or document automation</option>
                  <option>Technical modernization</option>
                  <option>Managed technical systems</option>
                  <option>Engineering Knowledge Audit</option>
                  <option>Source Stability Observer</option>
                  <option>Digital twin package</option>
                  <option>Portfolio website</option>
                  <option>Career campaign partnership</option>
                  <option>Product or service inquiry</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                <span>Preferred contact</span>
                <select name="preferred_contact" defaultValue="">
                  <option value="">No preference</option>
                  <option>Email</option>
                  <option>Phone</option>
                  <option>Video call</option>
                </select>
              </label>
              <label className="form-wide">
                <span>
                  How can we help? <b>*</b>
                </span>
                <textarea ref={messageRef} name="message" rows={6} maxLength={5000} required />
              </label>
            </div>
            <label className="form-trap" aria-hidden="true">
              Website
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
            <input type="hidden" name="source_page" value="" readOnly />
            <div className="form-footer">
              <p>
                We use this information only to respond to your inquiry. Please
                do not include passwords or sensitive access details.
              </p>
              <button className="button light" type="submit" disabled={sending}>
                {sending ? "Sending…" : "Send inquiry ↗"}
              </button>
            </div>
            <p className="form-status" role="status" aria-live="polite">
              {status}
            </p>
          </form>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
