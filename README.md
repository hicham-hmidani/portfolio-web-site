# Hicham Hmidani — Personal Portfolio & Admin Suite

A production-grade personal portfolio website built with React, TypeScript, Tailwind CSS, GSAP, and Firebase Firestore/Auth.

## Architecture & Visual System

- **Public Design System**: Swiss International Style adhering strictly to `AGENTS.md`. Light surfaces (`#FFFFFF` & `#F7F7F8`), hairline borders (`1px rgba(10,10,10,0.16)`), International Orange accent (`#FF4F00`), grotesk typography (`Helvetica Neue`), and oversized section folio numerals (`01-09`).
- **GSAP Animations**: Hairline rules that self-draw on scroll, column entrance timelines, magnetic CTA buttons with `quickTo`, `revertOnUpdate: true`, and `useScrollRefresh` for dynamic Firestore lists.
- **Admin Suite**: Dedicated dark UI at `/admin/*` powered by Firebase Authentication with automatic section versioning and real-time live synchronization.

---

## Data Model and Admin Guide

### 1. Firestore Data Model (`portfolio_content` Collection)

Every section on the public site is backed by a document in `portfolio_content`. Public components load in-code default fallback data if any document is missing.

| Document ID | Schema / Primary Fields | Description |
| :--- | :--- | :--- |
| `hero` | `{ name, titles: string[], bio, available: boolean, availableStatusText, rate, image: { url, alt, path } }` | Hero section content, availability badge state, and portrait. |
| `skills` | `{ categories: [{ name, items: string[] }] }` | Categorized technical proficiencies. |
| `experience` | `{ entries: [{ id, title, company, date, points: string[] }] }` | Career roles and experience timeline. |
| `contact` | `{ email, phone, location, socials: { linkedin, github, promptbase, upwork } }` | Contact info and social profile links. |
| `education` | `{ items: [{ id, degree, institution, period, field, visible }] }` | Academic degrees. |
| `certifications` | `{ items: [{ id, title, issuer, platform, date, verifyUrl, group, visible }] }` | Verified certifications (Google or Specialized). |
| `workwithme` | `{ heading, intro, cards: [{ id, title, blurb, bullets[], tags[], ctaLabel, ctaUrl, visible }] }` | Contract engagement cards. Supports `{rate}` placeholder. |
| `layout` | `{ sections: [{ id: string, visible: boolean }] }` | Middle section ordering & visibility sequence. |

#### Subcollections & Other Collections:
- **Section Version History**: `portfolio_content/{docId}/versions/{timestamp}` — Automatically captures up to 10 historical snapshots before writing changes.
- **`blog_posts`**: `{ title, category, excerpt, content, readTime, published, createdAt, updatedAt }`
- **`projects`**: `{ title, description, tools, githubUrl, stats, featured, imageUrl, image: { url, alt, path } }`
- **`marketplace_items`**: `{ platform, title, description, price, views, sales, link, featured, hourlyRate }`
- **`contact_messages`**: `{ from_name, from_email, message, read, receivedAt }`

---

### 2. Admin Capabilities & Safety Net

- **Access Guard**: Admin routes require a signed-in user matching `hmidanihicham8@gmail.com` with `email_verified == true`.
- **Automatic History & Rollback**: Every call to `saveSection()` archives the previous version to the `versions` subcollection before updating live content. Clicking **"History"** in any editor opens a drawer listing past versions with live diff comparison and one-click rollback.
- **Layout & Section Control**: Drag-and-drop section reordering (`/admin/sections`). Public site automatically recalculates continuous folio numerals (`01`, `02`, `03`...) without skipping numbers.
- **Input Validation**: URLs strictly require `https://` or `mailto:` and prohibit `javascript:`. Images uploaded are automatically resized client-side to max 1600px WebP at ~0.82 quality.

---

### 3. Security Rules Deployment

Firestore and Storage rules are configured in `firestore.rules` and `storage.rules`.

```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Storage security rules
firebase deploy --only storage

# Deploy both simultaneously
firebase deploy --only firestore:rules,storage
```

---

### 4. Environment Variables (`.env.example`)

Define client environment variables in `.env` (prefixed with `VITE_`):

```env
# Firebase Web Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef

# Image Storage Provider ('firebase' or 'cloudinary')
VITE_IMAGE_PROVIDER=firebase

# Optional Cloudinary Configuration (if VITE_IMAGE_PROVIDER=cloudinary)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
```

---

## Local Development & Build

```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Run TypeScript check & linter
npm run lint

# Production build
npm run build
```
