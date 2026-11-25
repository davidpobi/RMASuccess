import { createElement } from "react";
import { NextResponse } from "next/server";
import { RmaSubmissionMail } from "@/components/Mail/RmaSubmissionMail";
import { ISubmitRmaResponse } from "@/interfaces/rma";
import { getRmaMailSubject, getRmaMailText, validateRma } from "@/utils/rmaUtils";
import { sendMail } from "../../services/mail.service";
import { getBusinessMails, isMailConfigured } from "../../utils/mailUtils";

const respond = (body: ISubmitRmaResponse, status = 200) => NextResponse.json(body, { status });

export const handleSubmitRma = async (body: { data?: unknown }) => {
  const result = validateRma(body.data);
  if (!result.success) {
    return respond({ success: false, data: { fieldErrors: result.errors }, message: "Invalid RMA submission" }, 400);
  }

  if (!isMailConfigured()) {
    console.error("[send-rma] RESEND_API_KEY or BUSINESS_MAILS is not configured");
    return respond({ success: false, data: null, message: "RMA submissions are temporarily unavailable" }, 500);
  }

  const rma = result.data;
  const mail = await sendMail({
    to: getBusinessMails(),
    subject: getRmaMailSubject(rma),
    mailTemplate: createElement(RmaSubmissionMail, { rma }),
    text: getRmaMailText(rma),
  });

  if (!mail.success) {
    return respond({ success: false, data: null, message: "Failed to send RMA. Please try again." }, 502);
  }

  return respond({ success: true, data: { id: mail.data?.id }, message: "RMA submitted" });
};
