import { Resend } from "resend";

let resend: Resend | null = null;

// Created on first use so a missing key fails the request, not the module import.
export const getResendClient = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  resend ??= new Resend(apiKey);
  return resend;
};
