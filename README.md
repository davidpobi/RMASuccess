# RMASuccess

> **Medical-device returns, captured correctly the first time.**

[![RMASuccess — return request form](https://firebasestorage.googleapis.com/v0/b/bashbash-labs.firebasestorage.app/o/projects%2FRMASuccess%2Fdesktop-form-light.png?alt=media&token=b4b59536-400a-4cce-91da-7460437d908b)](https://rmasuccess.vercel.app/)

**Live demo: [rmasuccess.vercel.app ↗](https://rmasuccess.vercel.app/)**

RMASuccess is a Return Merchandise Authorization (RMA) intake portal for medical-device teams. It replaces the spreadsheet-and-email shuffle with a single, keyboard-first form that validates every field, gives the submitter a clear receipt, and lands a structured, branded notification in the quality team's inbox.

## The problem

RMA intake is where traceability starts. A missing serial number, a typo in a model, or a free-text quantity can stall an evaluation, a repair, or a credit — and in a regulated environment, every return needs a clean record.

Most teams still collect this information through ad-hoc emails and shared spreadsheets. RMASuccess makes the first record the right record.

## How it works

```text
Submitter → form (live validation) → API route (same schema) → escaped HTML email → QA inbox
                                                                          │
                                                               on-screen summary receipt
```

1. **Capture** — three focused sections: return information, product details, and the customer's description of the problem.
2. **Validate** — a single Zod schema checks every field in the browser as you go, and again on the server before anything is sent.
3. **Notify** — a responsive HTML email (with a plain-text fallback) is delivered through Resend to every configured business address.
4. **Confirm** — the submitter sees a summary of exactly what was recorded.

## Screenshots

### Day and night

| Day | Night |
| --- | --- |
| ![Form in day mode](https://firebasestorage.googleapis.com/v0/b/bashbash-labs.firebasestorage.app/o/projects%2FRMASuccess%2Fdesktop-form-light.png?alt=media&token=b4b59536-400a-4cce-91da-7460437d908b) | ![Form in night mode](https://firebasestorage.googleapis.com/v0/b/bashbash-labs.firebasestorage.app/o/projects%2FRMASuccess%2Fdesktop-form-dark.png?alt=media&token=60836bf0-8061-4dd9-944b-3d712786d811) |

### Validation that explains itself

Errors appear inline, in plain language, next to the field that caused them. Submitting jumps focus to the first problem.

![Inline validation errors](https://firebasestorage.googleapis.com/v0/b/bashbash-labs.firebasestorage.app/o/projects%2FRMASuccess%2Fdesktop-validation.png?alt=media&token=5b47ed47-f914-4da4-99e9-8ec3845b7f5b)

### Submission receipt

| Day | Night |
| --- | --- |
| ![Submission summary, day](https://firebasestorage.googleapis.com/v0/b/bashbash-labs.firebasestorage.app/o/projects%2FRMASuccess%2Fdesktop-success-light.png?alt=media&token=6b27889d-9af5-4cbf-aa98-17f0670954d2) | ![Submission summary, night](https://firebasestorage.googleapis.com/v0/b/bashbash-labs.firebasestorage.app/o/projects%2FRMASuccess%2Fdesktop-success-dark.png?alt=media&token=c960f50a-a724-41f4-9bfa-8bbad3728a77) |

### Mobile

<table>
  <tr>
    <td><img src="https://firebasestorage.googleapis.com/v0/b/bashbash-labs.firebasestorage.app/o/projects%2FRMASuccess%2Fmobile-form-light.png?alt=media&token=d870256f-3a40-45e9-a7ba-46740841b88d" alt="Mobile form, day" width="240" /></td>
    <td><img src="https://firebasestorage.googleapis.com/v0/b/bashbash-labs.firebasestorage.app/o/projects%2FRMASuccess%2Fmobile-form-dark.png?alt=media&token=2dd61c78-7de8-4d6d-84bc-795206a52fbd" alt="Mobile form, night" width="240" /></td>
    <td><img src="https://firebasestorage.googleapis.com/v0/b/bashbash-labs.firebasestorage.app/o/projects%2FRMASuccess%2Fmobile-validation.png?alt=media&token=0ada9182-bc13-4f05-ab7b-c728a24f8750" alt="Mobile validation" width="240" /></td>
    <td><img src="https://firebasestorage.googleapis.com/v0/b/bashbash-labs.firebasestorage.app/o/projects%2FRMASuccess%2Fmobile-success-light.png?alt=media&token=0410c8f7-18f7-438f-a5cc-759900283f55" alt="Mobile receipt, day" width="240" /></td>
    <td><img src="https://firebasestorage.googleapis.com/v0/b/bashbash-labs.firebasestorage.app/o/projects%2FRMASuccess%2Fmobile-success-dark.png?alt=media&token=32fa129b-3d0e-46d1-ac8f-fe3e7ef1e055" alt="Mobile receipt, night" width="240" /></td>
  </tr>
</table>

### The email the quality team receives

<img src="https://firebasestorage.googleapis.com/v0/b/bashbash-labs.firebasestorage.app/o/projects%2FRMASuccess%2Femail-notification.png?alt=media&token=a7143f58-d096-4446-9ee2-c558884306a0" alt="RMA notification email" width="520" />

## What makes it interesting

- **One schema, two boundaries** — [`utils/rmaUtils.ts`](./utils/rmaUtils.ts) defines the RMA rules once against the typed contract in [`interfaces/rma.ts`](./interfaces/rma.ts). The form uses it for live, per-field feedback; the API handler uses it to reject anything malformed with field-level `400` errors.
- **Domain-aware rules** — RMA numbers are restricted to safe identifiers, dates must be real and not in the future, quantities must be whole numbers, RMA types come from a fixed enum, and single-line fields can't smuggle in line breaks (which also protects the email subject line).
- **Injection-safe email** — the notification is a [React Email](https://react.email) component, so every user-supplied value is escaped by rendering; a submission can't inject links or markup into a business inbox. A readable plain-text version is sent alongside it.
- **Layered, predictable API** — a thin `route.ts` switches on `operation` and delegates to an adjacent handler; side effects live in services, provider clients in `config/`, and every response has the same `{ success, data, message }` shape.
- **Honest error handling** — invalid JSON and failed validation return `400`; missing server configuration returns `500` without crashing the route; provider failures return `502` instead of a false success. The UI surfaces these as toasts.
- **Keyboard-first, accessible input** — labelled fields, `aria-invalid` / `aria-describedby` wiring for errors, focus moved to the first invalid field, and section-level progress indicators in the header.
- **Considered visual design** — a precise, medical-device aesthetic with a crosshair mark, day/night themes, a live progress bar, and an email template that matches the product.

## Architecture

Code is organised by responsibility: **interfaces** describe shapes, **services** perform side effects, **utils** hold pure helpers, and **routes** translate HTTP into handler calls.

```text
interfaces/rma.ts                       RmaType enum, submission, field-error and response contracts
services/rma.service.ts                 submitRma() → POST /api/send-rma { operation: "submitRma", data }
utils/rmaUtils.ts                       Zod schema, validateRma / validateRmaField, mail subject + text
components/
  Rma/RmaForm.tsx                       form state, live validation, toasts, receipt screen
  Rma/FieldWrap.tsx                     labelled field with inline error / hint
  General/LogoMark.tsx                  crosshair brand mark
  Mail/RmaSubmissionMail.tsx            React Email notification template
app/api/
  (routes)/send-rma/route.ts            POST → switch (operation) → handler
  (routes)/send-rma/sendRma.ts          handleSubmitRma: validate → check config → send
  services/mail.service.ts              render template → send via Resend → { success, data, error }
  config/resend.ts                      lazily created Resend client
  utils/mailUtils.ts                    recipients, sender, configuration check
  interfaces/mails.ts                   mail contracts
```

```text
RmaForm ── validateRma ──▶ rma.service ──▶ route.ts ──▶ sendRma.ts ── validateRma ──▶ mail.service ──▶ Resend
                                                                                              │
                                                                                 RmaSubmissionMail
```

## Stack

Next.js · React · TypeScript · Tailwind CSS · Zod · Resend · React Email · Sonner · Vercel Analytics

## Run locally

```bash
pnpm install
pnpm dev
```

Create `.env.local` with:

```bash
RESEND_API_KEY=your_resend_key
BUSINESS_MAILS=qa@yourcompany.com,returns@yourcompany.com   # comma-separated recipients
SENDER_MAIL=rma@yourverifieddomain.com                       # optional, must be a Resend-verified sender
```

Without these values the form still runs and validates; submissions return a clear "temporarily unavailable" error instead of sending.

```bash
pnpm build
pnpm start
```
