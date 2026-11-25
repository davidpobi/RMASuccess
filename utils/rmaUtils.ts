import { z } from "zod";
import { IRmaFieldErrors, IRmaSubmission, IRmaValidationResult, RmaField, RmaType } from "@/interfaces/rma";

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

const isRealDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

// One day of tolerance so a client ahead of the server's timezone isn't rejected.
const isNotFuture = (value: string) => {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return value <= tomorrow.toISOString().slice(0, 10);
};

export const rmaSchema = z.object({
  rmaNumber: requiredText("RMA #", 32).regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and hyphens only"),
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
  rmaType: z.nativeEnum(RmaType, { errorMap: () => ({ message: "Select an RMA type" }) }),
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

export const validateRma = (input: unknown): IRmaValidationResult => {
  const result = rmaSchema.safeParse(input);
  if (result.success) {
    const data: IRmaSubmission = result.data;
    return { success: true, data };
  }

  const errors: IRmaFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as RmaField | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { success: false, errors };
};

export const validateRmaField = (field: RmaField, values: unknown): string | undefined => {
  const result = validateRma(values);
  return result.success ? undefined : result.errors[field];
};

export const getRmaMailSubject = (rma: IRmaSubmission) => {
  return `RMA #${rma.rmaNumber} — ${rma.customer}`;
};

export const getRmaMailText = (rma: IRmaSubmission) => {
  return [
    `RMA SUBMISSION — #${rma.rmaNumber}`,
    `Customer: ${rma.customer}`,
    `Date Opened: ${rma.dateOpened}`,
    `Initial: ${rma.initial || "—"}`,
    `RMA Type: ${rma.rmaType}`,
    `Product Name: ${rma.productName}`,
    `Model #: ${rma.modelNumber}`,
    `Product Line: ${rma.productLine || "—"}`,
    `Qty Returned: ${rma.quantityReturned}`,
    `Serial / Lot #: ${rma.serialLotNumber || "—"}`,
    ``,
    `Description:`,
    rma.customerDescription,
  ].join("\n");
};
