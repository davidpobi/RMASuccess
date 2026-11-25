import { render } from "@react-email/components";
import { getResendClient } from "../config/resend";
import { ISendEmailParams, ISendEmailResponse } from "../interfaces/mails";
import { getSenderMail } from "../utils/mailUtils";

export const sendMail = async ({ to, subject, mailTemplate, text }: ISendEmailParams): Promise<ISendEmailResponse> => {
  const resend = getResendClient();
  if (!resend) {
    return { success: false, data: null, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const html = await render(mailTemplate);
    text ??= await render(mailTemplate, { plainText: true });

    const { data, error } = await resend.emails.send({
      from: getSenderMail(),
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[mail.service] Resend error:", error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data: data ? { id: data.id } : null, error: null };
  } catch (error) {
    console.error("[mail.service] Send error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, data: null, error: message };
  }
};
