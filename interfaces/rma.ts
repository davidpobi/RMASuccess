export enum RmaType {
  COMP = "Comp.",
  REPAIR = "Repair",
  REPLACE = "Replace",
  CREDIT = "Credit",
  EVALUATION = "Evaluation",
  OTHER = "Other",
}

export interface IRmaSubmission {
  rmaNumber: string;
  customer: string;
  dateOpened: string;
  initial: string;
  rmaType: RmaType;
  productName: string;
  modelNumber: string;
  productLine: string;
  quantityReturned: string;
  serialLotNumber: string;
  customerDescription: string;
}

export type RmaField = keyof IRmaSubmission;

// Raw form state: every field is an editable string until validated
export type IRmaFormValues = Record<RmaField, string>;

export type IRmaFieldErrors = Partial<Record<RmaField, string>>;

export type IRmaValidationResult =
  | { success: true; data: IRmaSubmission }
  | { success: false; errors: IRmaFieldErrors };

export interface ISubmitRmaResponse {
  success: boolean;
  data: { id?: string; fieldErrors?: IRmaFieldErrors } | null;
  message?: string;
  error?: string;
}
