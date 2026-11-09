# Portfolio upgrade rules
Read the skills in .agents/skills/ (gsap-*, frontend-design) before editing.

## Visual direction (frontend-design skill: one anchor, no hybrids)
- Anchor: Swiss. Surfaces #FFFFFF or #F7F7F8 only: no dark sections, no gradients, no grain, no blurred glows.
- One grotesque family, stack: "Helvetica Neue", Helvetica, Arial, sans-serif. No second typeface.
- One accent: International Orange #FF4F00, used deliberately. Ink #0A0A0A. Hairlines: 1px rgba(10,10,10,.16).
- Visible grid or hairline rules. Left-aligned type, asymmetric balance, no centered headings.
- Section folio numerals (01-09) in condensed/large sans as composition elements.
- Differentiator: hairline rules that draw themselves on scroll + oversized folio numerals.
- Content discipline: every string names real information. No invented stats, no filler kickers, no unicode-glyph icons (lucide-react is fine), standard copy for standard actions. Keep all existing Firestore fields and content.

## GSAP rules
- Import only from src/lib/gsap.ts. Use useGSAP with a `scope` ref; never unscoped selectors.
- Wrap handlers created after setup in contextSafe.
- Animate transform and autoAlpha only (no width/height/top/left). Use gsap.matchMedia() for breakpoints and prefers-reduced-motion: reduced motion = content visible, no movement.
- Firestore-driven lists: pass the data in useGSAP `dependencies` with `revertOnUpdate: true`, and call useScrollRefresh(data). Create ScrollTriggers top to bottom; use ScrollTrigger.batch for lists.
- Do NOT use ScrollSmoother. Nav anchors use ScrollToPlugin with an offset for the fixed header.
- When a section is migrated, remove its motion `initial`/`whileInView`/`animate` props. Keep motion's AnimatePresence for the mobile menu and Blog modals.

## Do not touch
- firebase config, firestore.rules.
- IDs used by EmailJS in Contact: contact-form, from_name, from_email, message, submit-btn, form-status.

## Done means
`npm run lint` and `npm run build` pass, no console errors, works with slow/empty Firestore data, works in React StrictMode.

## Admin rules
- Admin keeps its existing dark UI; the Swiss direction applies to the public site only.
- Content model: every editable section is a doc in portfolio_content/{docId} (public read, admin write, no Firestore rule change needed). Public components keep in-code defaults and merge the Firestore doc over them, so an empty or missing doc never breaks the site.
- Add a "Seed from defaults" action in each editor that writes the in-code defaults if the doc is missing.
- Every URL field must be validated (https:// or mailto: only, never javascript:). Render user text as plain text; markdown only via react-markdown without rehype-raw.
- Every save sets updatedAt (serverTimestamp). No secrets in Firestore or client code.
- Public components that become Firestore-driven must follow the GSAP rules (useGSAP dependencies + revertOnUpdate + useScrollRefresh).
- New admin pages live under /admin/* and must appear in the shared sidebar.
