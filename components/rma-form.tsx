"use client";

import { useState, useRef, useCallback, useId, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ArrowRight, RotateCcw, Sun, Moon } from "lucide-react";

const RMA_TYPES = [
  "Comp.",
  "Repair",
  "Replace",
  "Credit",
  "Evaluation",
  "Other",
];

interface FormData {
  rmaNumber: string;
  customer: string;
  dateOpened: string;
  initial: string;
  rmaType: string;
  productName: string;
  modelNumber: string;
  productLine: string;
  quantityReturned: string;
  serialLotNumber: string;
  customerDescription: string;
}

const INITIAL_FORM: FormData = {
  rmaNumber: "",
  customer: "",
  dateOpened: "",
  initial: "",
  rmaType: "",
  productName: "",
  modelNumber: "",
  productLine: "",
  quantityReturned: "",
  serialLotNumber: "",
  customerDescription: "",
};

const FIELD_ORDER: (keyof FormData)[] = [
  "rmaNumber",
  "customer",
  "dateOpened",
  "initial",
  "rmaType",
  "productName",
  "modelNumber",
  "productLine",
  "quantityReturned",
  "serialLotNumber",
  "customerDescription",
];

interface FieldWrapProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  active?: boolean;
  filled?: boolean;
  htmlFor: string;
}

function FieldWrap({ label, required, hint, children, active, filled, htmlFor }: FieldWrapProps) {
  return (
    <div className="group relative">
      <label
        htmlFor={htmlFor}
        className={cn(
          "block text-[11px] font-semibold tracking-[0.08em] mb-2 transition-colors duration-150",
          active ? "text-accent" : filled ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      {children}
      {hint && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function inputCls(active: boolean) {
  return cn(
    "w-full h-11 bg-transparent font-sans text-sm text-foreground",
    "border-0 border-b-2 outline-none transition-all duration-200",
    "placeholder:text-muted-foreground/40",
    active
      ? "border-accent"
      : "border-border hover:border-foreground/30"
  );
}

function selectCls(active: boolean, empty: boolean) {
  return cn(
    "w-full h-11 bg-transparent font-sans text-sm appearance-none pr-8",
    "border-0 border-b-2 outline-none transition-all duration-200 cursor-pointer",
    active ? "border-accent" : "border-border hover:border-foreground/30",
    empty ? "text-muted-foreground/40" : "text-foreground"
  );
}

// Minimal scope/crosshair logo mark — medical device precision
function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle cx="16" cy="16" r="13.5" stroke="currentColor" strokeWidth="1.2" />
      {/* Inner circle */}
      <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.2" />
      {/* Crosshair lines */}
      <line x1="16" y1="2" x2="16" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="21.5" x2="16" y2="30" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="2" y1="16" x2="10.5" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="21.5" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {/* Center dot */}
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

function StepDot({ done, active }: { done: boolean; active: boolean }) {
  return (
    <div
      className={cn(
        "w-2 h-2 rounded-full transition-all duration-300",
        done ? "bg-foreground" : active ? "bg-accent" : "bg-border"
      )}
    />
  );
}

export default function RmaForm() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [active, setActive] = useState<keyof FormData | null>(null);
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [dark]);

  const fieldId = (name: string) => `${id}-${name}`;

  const set = useCallback(
    (field: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((p) => ({ ...p, [field]: e.target.value }));
      },
    []
  );

  const filled = (f: keyof FormData) => form[f] !== "";

  const completedCount = FIELD_ORDER.filter(filled).length;
  const pct = Math.round((completedCount / FIELD_ORDER.length) * 100);

  // Section completion
  const section1Fields: (keyof FormData)[] = ["rmaNumber", "customer", "dateOpened", "initial", "rmaType"];
  const section2Fields: (keyof FormData)[] = ["productName", "modelNumber", "productLine", "quantityReturned", "serialLotNumber"];
  const section3Fields: (keyof FormData)[] = ["customerDescription"];

  const s1done = section1Fields.every(filled);
  const s2done = section2Fields.every(filled);
  const s1active = section1Fields.some((f) => f === active);
  const s2active = section2Fields.some((f) => f === active);
  const s3active = active === "customerDescription";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rma/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit RMA");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
    } catch (err) {
      setError("An error occurred while submitting. Please try again.");
      setLoading(false);
      console.error("[v0] Submit error:", err);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setSubmitted(false);
    setActive(null);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center p-6">
        {/* Toggle on success screen */}
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          aria-label={dark ? "Switch to day mode" : "Switch to night mode"}
          className="fixed top-3 right-6 w-8 h-8 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all duration-200 z-20"
        >
          {dark ? <Sun className="w-3.5 h-3.5" strokeWidth={2} /> : <Moon className="w-3.5 h-3.5" strokeWidth={2} />}
        </button>
        <div className="w-full max-w-lg">
          {/* Success header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-7">
              <LogoMark className="w-8 h-8 text-accent" />
              <div className="h-px flex-1 bg-border" />
              <span className="text-[9px] font-mono font-semibold tracking-[0.14em] text-accent">SUBMITTED</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight leading-tight text-balance">
              RMA Request<br />Received
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Your return authorization has been logged. A confirmation will be sent shortly.
            </p>
          </div>

          {/* Summary card */}
          <div className="border-2 border-foreground/10 rounded-lg overflow-hidden">
            <div className="px-5 py-3 bg-foreground text-background flex items-center justify-between">
              <span className="text-xs font-semibold tracking-widest">SUMMARY</span>
              <span className="text-xs font-mono opacity-70">RMA #{form.rmaNumber || "—"}</span>
            </div>
            <div className="divide-y divide-border">
              {[
                { label: "Customer", value: form.customer },
                { label: "Date Opened", value: form.dateOpened },
                { label: "RMA Type", value: form.rmaType },
                { label: "Product", value: form.productName },
                { label: "Model #", value: form.modelNumber },
                { label: "Product Line", value: form.productLine },
                { label: "Qty Returned", value: form.quantityReturned },
                { label: "Serial / Lot", value: form.serialLotNumber },
              ]
                .filter((r) => r.value)
                .map((row) => (
                  <div key={row.label} className="flex justify-between items-baseline px-5 py-3">
                    <span className="text-xs text-muted-foreground tracking-wide">{row.label}</span>
                    <span className="text-sm text-foreground font-medium ml-4 text-right">{row.value}</span>
                  </div>
                ))}
              {form.customerDescription && (
                <div className="px-5 py-3">
                  <p className="text-xs text-muted-foreground tracking-wide mb-1.5">Description</p>
                  <p className="text-sm text-foreground leading-relaxed">{form.customerDescription}</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="mt-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-transform duration-300" />
            Submit another RMA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 z-20 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo + wordmark */}
          <div className="flex items-center gap-2.5">
            <LogoMark className="w-7 h-7 text-accent" />
            <div className="flex flex-col leading-none">
              <span className="text-[13px] font-bold tracking-tight text-foreground">CLARUSMED</span>
              <span className="text-[9px] font-medium tracking-[0.12em] text-muted-foreground mt-0.5">MEDICAL DEVICES</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-border mx-2" />
            <span className="hidden sm:block text-[10px] font-semibold tracking-[0.1em] text-muted-foreground">RMA PORTAL</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5">
              <StepDot done={s1done} active={s1active} />
              <StepDot done={s2done} active={s2active} />
              <StepDot done={false} active={s3active} />
            </div>
            <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
              {completedCount}/{FIELD_ORDER.length}
            </span>
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              aria-label={dark ? "Switch to day mode" : "Switch to night mode"}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all duration-200"
            >
              {dark ? <Sun className="w-3.5 h-3.5" strokeWidth={2} /> : <Moon className="w-3.5 h-3.5" strokeWidth={2} />}
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-border">
          <div
            className="h-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      <main className="pt-24 pb-20 max-w-2xl mx-auto px-6">
        {/* Page title */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-accent" />
            <p className="text-[10px] font-semibold tracking-[0.14em] text-accent">
              RETURN MERCHANDISE AUTHORIZATION
            </p>
          </div>
          <h1 className="text-[2.6rem] font-bold leading-[1.08] tracking-tight text-foreground text-balance">
            Submit a<br />Return Request
          </h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
            Complete all fields below. Use{" "}
            <kbd className="font-mono text-[11px] border border-border rounded px-1.5 py-0.5 text-foreground bg-muted">
              Tab
            </kbd>{" "}
            to move between fields.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          {/* ── Section 1: Return Information ── */}
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-8">
              <div className={cn(
                "w-0.5 h-5 transition-all duration-300",
                s1done ? "bg-accent" : s1active ? "bg-accent" : "bg-border"
              )} />
              <span className={cn(
                "text-[10px] font-bold tracking-[0.14em] transition-colors duration-200",
                s1active ? "text-accent" : s1done ? "text-foreground" : "text-muted-foreground"
              )}>RETURN INFORMATION</span>
              <div className="flex-1 h-px bg-border" />
              {s1done && <span className="text-[9px] font-mono text-accent tracking-wider">COMPLETE</span>}
            </div>

            <div className="grid grid-cols-6 gap-x-6 gap-y-8">
              <div className="col-span-2">
                <FieldWrap label="RMA #" required htmlFor={fieldId("rmaNumber")} active={active === "rmaNumber"} filled={filled("rmaNumber")}>
                  <input
                    id={fieldId("rmaNumber")}
                    type="text"
                    placeholder="1850"
                    value={form.rmaNumber}
                    onChange={set("rmaNumber")}
                    onFocus={() => setActive("rmaNumber")}
                    onBlur={() => setActive(null)}
                    className={inputCls(active === "rmaNumber")}
                    required
                  />
                </FieldWrap>
              </div>

              <div className="col-span-4">
                <FieldWrap label="Customer" required htmlFor={fieldId("customer")} active={active === "customer"} filled={filled("customer")}>
                  <input
                    id={fieldId("customer")}
                    type="text"
                    placeholder="Mayo Foundation"
                    value={form.customer}
                    onChange={set("customer")}
                    onFocus={() => setActive("customer")}
                    onBlur={() => setActive(null)}
                    className={inputCls(active === "customer")}
                    required
                  />
                </FieldWrap>
              </div>

              <div className="col-span-3">
                <FieldWrap label="Date Opened" required htmlFor={fieldId("dateOpened")} active={active === "dateOpened"} filled={filled("dateOpened")}>
                  <input
                    id={fieldId("dateOpened")}
                    type="date"
                    value={form.dateOpened}
                    onChange={set("dateOpened")}
                    onFocus={() => setActive("dateOpened")}
                    onBlur={() => setActive(null)}
                    className={inputCls(active === "dateOpened")}
                    required
                  />
                </FieldWrap>
              </div>

              <div className="col-span-1">
                <FieldWrap label="Initial" htmlFor={fieldId("initial")} active={active === "initial"} filled={filled("initial")}>
                  <input
                    id={fieldId("initial")}
                    type="text"
                    placeholder="MH"
                    maxLength={4}
                    value={form.initial}
                    onChange={set("initial")}
                    onFocus={() => setActive("initial")}
                    onBlur={() => setActive(null)}
                    className={cn(inputCls(active === "initial"), "uppercase")}
                  />
                </FieldWrap>
              </div>

              <div className="col-span-2">
                <FieldWrap label="RMA Type" required htmlFor={fieldId("rmaType")} active={active === "rmaType"} filled={filled("rmaType")}>
                  <div className="relative">
                    <select
                      id={fieldId("rmaType")}
                      value={form.rmaType}
                      onChange={set("rmaType")}
                      onFocus={() => setActive("rmaType")}
                      onBlur={() => setActive(null)}
                      className={selectCls(active === "rmaType", !form.rmaType)}
                      required
                    >
                      <option value="" disabled>Select...</option>
                      {RMA_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2} />
                  </div>
                </FieldWrap>
              </div>
            </div>
          </section>

          {/* ── Section 2: Product Details ── */}
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-8">
              <div className={cn(
                "w-0.5 h-5 transition-all duration-300",
                s2done ? "bg-accent" : s2active ? "bg-accent" : "bg-border"
              )} />
              <span className={cn(
                "text-[10px] font-bold tracking-[0.14em] transition-colors duration-200",
                s2active ? "text-accent" : s2done ? "text-foreground" : "text-muted-foreground"
              )}>PRODUCT DETAILS</span>
              <div className="flex-1 h-px bg-border" />
              {s2done && <span className="text-[9px] font-mono text-accent tracking-wider">COMPLETE</span>}
            </div>

            <div className="grid grid-cols-6 gap-x-6 gap-y-8">
              <div className="col-span-6">
                <FieldWrap label="Product Name" required htmlFor={fieldId("productName")} active={active === "productName"} filled={filled("productName")}>
                  <input
                    id={fieldId("productName")}
                    type="text"
                    placeholder="Clarus Digital Inspection Scope, 1mm x 110cm"
                    value={form.productName}
                    onChange={set("productName")}
                    onFocus={() => setActive("productName")}
                    onBlur={() => setActive(null)}
                    className={inputCls(active === "productName")}
                    required
                  />
                </FieldWrap>
              </div>

              <div className="col-span-3">
                <FieldWrap label="Model #" required htmlFor={fieldId("modelNumber")} active={active === "modelNumber"} filled={filled("modelNumber")}>
                  <input
                    id={fieldId("modelNumber")}
                    type="text"
                    placeholder="CB1-110"
                    value={form.modelNumber}
                    onChange={set("modelNumber")}
                    onFocus={() => setActive("modelNumber")}
                    onBlur={() => setActive(null)}
                    className={cn(inputCls(active === "modelNumber"), "font-mono")}
                    required
                  />
                </FieldWrap>
              </div>

              <div className="col-span-3">
                <FieldWrap label="Product Line" htmlFor={fieldId("productLine")} active={active === "productLine"} filled={filled("productLine")}>
                  <input
                    id={fieldId("productLine")}
                    type="text"
                    placeholder="Clarus Inspection"
                    value={form.productLine}
                    onChange={set("productLine")}
                    onFocus={() => setActive("productLine")}
                    onBlur={() => setActive(null)}
                    className={inputCls(active === "productLine")}
                  />
                </FieldWrap>
              </div>

              <div className="col-span-2">
                <FieldWrap label="Qty Returned" required htmlFor={fieldId("quantityReturned")} active={active === "quantityReturned"} filled={filled("quantityReturned")}>
                  <input
                    id={fieldId("quantityReturned")}
                    type="number"
                    min={1}
                    placeholder="1"
                    value={form.quantityReturned}
                    onChange={set("quantityReturned")}
                    onFocus={() => setActive("quantityReturned")}
                    onBlur={() => setActive(null)}
                    className={inputCls(active === "quantityReturned")}
                    required
                  />
                </FieldWrap>
              </div>

              <div className="col-span-4">
                <FieldWrap label="Serial / Lot Number" htmlFor={fieldId("serialLotNumber")} active={active === "serialLotNumber"} filled={filled("serialLotNumber")}>
                  <input
                    id={fieldId("serialLotNumber")}
                    type="text"
                    placeholder="SN 7487"
                    value={form.serialLotNumber}
                    onChange={set("serialLotNumber")}
                    onFocus={() => setActive("serialLotNumber")}
                    onBlur={() => setActive(null)}
                    className={cn(inputCls(active === "serialLotNumber"), "font-mono")}
                  />
                </FieldWrap>
              </div>
            </div>
          </section>

          {/* ── Section 3: Description ── */}
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-8">
              <div className={cn(
                "w-0.5 h-5 transition-all duration-300",
                filled("customerDescription") ? "bg-accent" : s3active ? "bg-accent" : "bg-border"
              )} />
              <span className={cn(
                "text-[10px] font-bold tracking-[0.14em] transition-colors duration-200",
                s3active ? "text-accent" : filled("customerDescription") ? "text-foreground" : "text-muted-foreground"
              )}>CUSTOMER DESCRIPTION</span>
              <div className="flex-1 h-px bg-border" />
              {filled("customerDescription") && <span className="text-[9px] font-mono text-accent tracking-wider">COMPLETE</span>}
            </div>

            <FieldWrap
              label="Description of Problem"
              required
              htmlFor={fieldId("customerDescription")}
              active={active === "customerDescription"}
              filled={filled("customerDescription")}
              hint="Include any relevant context, complaint details, or handling instructions."
            >
              <textarea
                id={fieldId("customerDescription")}
                rows={4}
                placeholder="e.g. Complaint: Per Andy, please scrap."
                value={form.customerDescription}
                onChange={set("customerDescription")}
                onFocus={() => setActive("customerDescription")}
                onBlur={() => setActive(null)}
                className={cn(
                  "w-full bg-transparent font-sans text-sm text-foreground resize-none",
                  "border-0 border-b-2 outline-none transition-all duration-200 pt-1 pb-2 leading-relaxed",
                  "placeholder:text-muted-foreground/40",
                  active === "customerDescription"
                    ? "border-accent"
                    : "border-border hover:border-foreground/30"
                )}
                required
              />
            </FieldWrap>
          </section>

          {/* Error message */}
          {error && (
            <div className="mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-destructive hover:text-destructive/80 transition-colors"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Clear all
            </button>
            <button
              type="submit"
              disabled={loading || !allComplete}
              className={cn(
                "inline-flex items-center gap-2 px-6 h-11 rounded-full font-semibold text-sm",
                "bg-foreground text-background",
                "hover:bg-accent hover:text-foreground",
                "active:scale-[0.97] transition-all duration-150",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {loading ? "Submitting..." : "Submit RMA"}
              {!loading && <ArrowRight className="w-4 h-4" strokeWidth={2.5} />}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
