"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  RotateCcw,
} from "lucide-react";

const RMA_TYPES = ["Comp.", "Repair", "Replace", "Credit", "Evaluation", "Other"];

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

interface FieldProps {
  id: keyof FormData;
  label: string;
  badge?: string;
  children: React.ReactNode;
  required?: boolean;
}

function Field({ id, label, badge, children, required }: FieldProps) {
  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-1.5">
        <label
          htmlFor={id}
          className="text-xs font-semibold tracking-widest uppercase text-muted-foreground"
        >
          {label}
        </label>
        {required && (
          <span className="text-destructive text-xs leading-none">*</span>
        )}
        {badge && (
          <span className="ml-auto text-[10px] font-medium bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function RmaForm() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [activeField, setActiveField] = useState<keyof FormData | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = useCallback(
    (field: keyof FormData) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
      },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setSubmitted(false);
    setActiveField(null);
  };

  const inputClass = (field: keyof FormData) =>
    cn(
      "w-full h-11 px-3.5 rounded-md border text-sm font-sans bg-card text-card-foreground",
      "transition-all duration-150 outline-none",
      "placeholder:text-muted-foreground/50",
      activeField === field
        ? "border-primary ring-2 ring-primary/20 shadow-sm"
        : "border-border hover:border-primary/40"
    );

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-10 max-w-md w-full text-center">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">RMA Submitted</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Your return authorization request has been received. A confirmation
            will be sent shortly.
          </p>

          <div className="bg-muted rounded-xl p-4 text-left space-y-2 mb-8">
            {[
              { label: "RMA #", value: form.rmaNumber },
              { label: "Customer", value: form.customer },
              { label: "Product", value: form.productName },
              { label: "Model #", value: form.modelNumber },
              { label: "Qty Returned", value: form.quantityReturned },
              { label: "Serial / Lot", value: form.serialLotNumber },
            ]
              .filter((r) => r.value)
              .map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="text-foreground font-medium">{row.value}</span>
                </div>
              ))}
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-4 h-4" />
            Submit Another RMA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold text-foreground tracking-tight">
              RMA Submission
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Fields marked <span className="text-destructive">*</span> are required
          </span>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1 text-balance">
            Return Merchandise Authorization
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Complete all fields below to submit your RMA request. Use{" "}
            <kbd className="text-xs bg-muted border border-border rounded px-1.5 py-0.5 font-mono">Tab</kbd>{" "}
            to move between fields.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

            {/* Section: Return Info */}
            <div className="px-6 pt-6 pb-2">
              <p className="text-[10px] font-bold tracking-widest uppercase text-primary mb-4">
                Return Information
              </p>
              <div className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4">
                <div className="sm:col-span-1">
                  <Field id="rmaNumber" label="RMA #" required>
                    <input
                      id="rmaNumber"
                      type="text"
                      placeholder="e.g. 1850"
                      value={form.rmaNumber}
                      onChange={handleChange("rmaNumber")}
                      onFocus={() => setActiveField("rmaNumber")}
                      onBlur={() => setActiveField(null)}
                      className={inputClass("rmaNumber")}
                      required
                    />
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field id="customer" label="Customer" required>
                    <input
                      id="customer"
                      type="text"
                      placeholder="e.g. Mayo Foundation"
                      value={form.customer}
                      onChange={handleChange("customer")}
                      onFocus={() => setActiveField("customer")}
                      onBlur={() => setActiveField(null)}
                      className={inputClass("customer")}
                      required
                    />
                  </Field>
                </div>

                <div className="sm:col-span-1">
                  <Field id="dateOpened" label="Date Opened" required>
                    <input
                      id="dateOpened"
                      type="date"
                      value={form.dateOpened}
                      onChange={handleChange("dateOpened")}
                      onFocus={() => setActiveField("dateOpened")}
                      onBlur={() => setActiveField(null)}
                      className={inputClass("dateOpened")}
                      required
                    />
                  </Field>
                </div>

                <div className="sm:col-span-1">
                  <Field id="initial" label="Initial">
                    <input
                      id="initial"
                      type="text"
                      placeholder="e.g. MH"
                      maxLength={4}
                      value={form.initial}
                      onChange={handleChange("initial")}
                      onFocus={() => setActiveField("initial")}
                      onBlur={() => setActiveField(null)}
                      className={cn(inputClass("initial"), "uppercase")}
                    />
                  </Field>
                </div>

                <div className="sm:col-span-3">
                  <Field id="rmaType" label="RMA Type" required>
                    <div className="relative">
                      <select
                        id="rmaType"
                        value={form.rmaType}
                        onChange={handleChange("rmaType")}
                        onFocus={() => setActiveField("rmaType")}
                        onBlur={() => setActiveField(null)}
                        className={cn(
                          inputClass("rmaType"),
                          "appearance-none pr-9",
                          !form.rmaType && "text-muted-foreground/50"
                        )}
                        required
                      >
                        <option value="" disabled>
                          Select type...
                        </option>
                        {RMA_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                        strokeWidth={2}
                      />
                    </div>
                  </Field>
                </div>
              </div>
            </div>

            <div className="mx-6 my-5 border-t border-border" />

            {/* Section: Product Details */}
            <div className="px-6 pb-2">
              <p className="text-[10px] font-bold tracking-widest uppercase text-primary mb-4">
                Product Details
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field id="productName" label="Product Name" required>
                    <input
                      id="productName"
                      type="text"
                      placeholder="e.g. Clarus Digital Inspection Scope, 1mm x 110cm"
                      value={form.productName}
                      onChange={handleChange("productName")}
                      onFocus={() => setActiveField("productName")}
                      onBlur={() => setActiveField(null)}
                      className={inputClass("productName")}
                      required
                    />
                  </Field>
                </div>

                <div>
                  <Field id="modelNumber" label="Model #" required>
                    <input
                      id="modelNumber"
                      type="text"
                      placeholder="e.g. CB1-110"
                      value={form.modelNumber}
                      onChange={handleChange("modelNumber")}
                      onFocus={() => setActiveField("modelNumber")}
                      onBlur={() => setActiveField(null)}
                      className={inputClass("modelNumber")}
                      required
                    />
                  </Field>
                </div>

                <div>
                  <Field id="productLine" label="Product Line">
                    <input
                      id="productLine"
                      type="text"
                      placeholder="e.g. Clarus Inspection"
                      value={form.productLine}
                      onChange={handleChange("productLine")}
                      onFocus={() => setActiveField("productLine")}
                      onBlur={() => setActiveField(null)}
                      className={inputClass("productLine")}
                    />
                  </Field>
                </div>

                <div>
                  <Field id="quantityReturned" label="Quantity Returned" required>
                    <input
                      id="quantityReturned"
                      type="number"
                      min={1}
                      placeholder="1"
                      value={form.quantityReturned}
                      onChange={handleChange("quantityReturned")}
                      onFocus={() => setActiveField("quantityReturned")}
                      onBlur={() => setActiveField(null)}
                      className={inputClass("quantityReturned")}
                      required
                    />
                  </Field>
                </div>

                <div>
                  <Field id="serialLotNumber" label="Serial / Lot Number">
                    <input
                      id="serialLotNumber"
                      type="text"
                      placeholder="e.g. SN 7487"
                      value={form.serialLotNumber}
                      onChange={handleChange("serialLotNumber")}
                      onFocus={() => setActiveField("serialLotNumber")}
                      onBlur={() => setActiveField(null)}
                      className={inputClass("serialLotNumber")}
                    />
                  </Field>
                </div>
              </div>
            </div>

            <div className="mx-6 my-5 border-t border-border" />

            {/* Section: Problem Description */}
            <div className="px-6 pb-6">
              <p className="text-[10px] font-bold tracking-widest uppercase text-primary mb-4">
                Customer Description of Problem
              </p>
              <Field id="customerDescription" label="Description" required badge="Highlighted">
                <textarea
                  id="customerDescription"
                  rows={4}
                  placeholder="e.g. Complaint: Per Andy, please scrap."
                  value={form.customerDescription}
                  onChange={handleChange("customerDescription")}
                  onFocus={() => setActiveField("customerDescription")}
                  onBlur={() => setActiveField(null)}
                  className={cn(
                    "w-full px-3.5 py-3 rounded-md border text-sm font-sans bg-card text-card-foreground",
                    "transition-all duration-150 outline-none resize-none leading-relaxed",
                    "placeholder:text-muted-foreground/50",
                    activeField === "customerDescription"
                      ? "border-primary ring-2 ring-primary/20 shadow-sm"
                      : "border-border hover:border-primary/40"
                  )}
                  required
                />
              </Field>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none sm:min-w-[160px] h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
            >
              Submit RMA
            </button>
          </div>

          {/* Field counter */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            {
              FIELD_ORDER.filter((f) => form[f] !== "").length
            }{" "}
            of {FIELD_ORDER.length} fields completed
          </p>
        </form>
      </main>
    </div>
  );
}
