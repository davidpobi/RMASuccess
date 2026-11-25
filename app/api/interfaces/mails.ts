import type { ReactElement } from "react";

export interface ISendEmailParams {
  to: string | string[];
  subject: string;
  mailTemplate: ReactElement;
  text?: string;
}

export interface ISendEmailResponse {
  success: boolean;
  data: { id: string } | null;
  error: string | null;
}
