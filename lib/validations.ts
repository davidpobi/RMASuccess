import { z } from "zod";

export const RMA_TYPES = [
  "Comp.",
  "Repair",
  "Replace",
  "Credit",
  "Evaluation",
  "Other",
] as const;

const SINGLE_LINE = /^[^\r\n]*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const requiredText = (label: string, max: number) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`)
    .regex(SINGLE_LINE, `${label} must be a single line`);

const optionalText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer`)
    .regex(SINGLE_LINE, `${label} must be a single line`)
    .default("");

function isRealDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// One day of tolerance so a client ahead of the server's timezone isn't rejected.
function isNotFuture(value: string) {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return value <= tomorrow.toISOString().slice(0, 10);
}

export const rmaSchema = z.object({
  rmaNumber: requiredText("RMA #", 32).regex(
    /^[A-Za-z0-9-]+$/,
    "Use letters, numbers and hyphens only"
  ),
  customer: requiredText("Customer", 120),
  dateOpened: z
    .string({ required_error: "Date opened is required" })
    .trim()
    .min(1, "Date opened is required")
    .regex(ISO_DATE, "Enter a valid date")
    .refine(isRealDate, "Enter a valid date")
    .refine(isNotFuture, "Date can't be in the future"),
  initial: optionalText("Initial", 4)
    .refine((v) => /^[A-Za-z]*$/.test(v), "Use letters only")
    .transform((v) => v.toUpperCase()),
  rmaType: z.enum(RMA_TYPES, {
    errorMap: () => ({ message: "Select an RMA type" }),
  }),
  productName: requiredText("Product name", 200),
  modelNumber: requiredText("Model #", 64),
  productLine: optionalText("Product line", 120),
  quantityReturned: z
    .string({ required_error: "Quantity is required" })
    .trim()
    .min(1, "Quantity is required")
    .regex(/^\d+$/, "Enter a whole number")
    .refine((v) => Number(v) >= 1, "Quantity must be at least 1")
    .refine((v) => Number(v) <= 10000, "Quantity must be 10,000 or fewer"),
  serialLotNumber: optionalText("Serial / lot number", 120),
  customerDescription: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(1, "Description is required")
    .max(2000, "Description must be 2,000 characters or fewer"),
});

export type RmaFormData = z.input<typeof rmaSchema>;
export type RmaSubmission = z.output<typeof rmaSchema>;
export type RmaFieldErrors = Partial<Record<keyof RmaFormData, string>>;

export type RmaValidationResult =
  | { success: true; data: RmaSubmission }
  | { success: false; errors: RmaFieldErrors };

export function validateRma(input: unknown): RmaValidationResult {
  const result = rmaSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  const errors: RmaFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof RmaFormData | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { success: false, errors };
}

export function validateRmaField(
  field: keyof RmaFormData,
  form: unknown
): string | undefined {
  const result = validateRma(form);
  return result.success ? undefined : result.errors[field];
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
