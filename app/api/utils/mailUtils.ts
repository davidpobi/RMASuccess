const DEFAULT_SENDER_MAIL = "noreply@rmasuccess.com";

export const getBusinessMails = (): string[] => {
  return (process.env.BUSINESS_MAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
};

export const getSenderMail = (): string => {
  return process.env.SENDER_MAIL || DEFAULT_SENDER_MAIL;
};

export const isMailConfigured = (): boolean => {
  return Boolean(process.env.RESEND_API_KEY) && getBusinessMails().length > 0;
};
