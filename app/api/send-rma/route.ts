import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface RMASubmissionData {
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

export async function POST(request: Request) {
  try {
    const data: RMASubmissionData = await request.json();

    // Parse comma-separated business emails
    const businessMails = (process.env.BUSINESS_MAILS || "")
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (businessMails.length === 0) {
      return Response.json(
        { error: "No business emails configured" },
        { status: 400 }
      );
    }

    // Format the email body
    const emailBody = `
RMA SUBMISSION RECEIVED

Return Information:
- RMA #: ${data.rmaNumber}
- Customer: ${data.customer}
- Date Opened: ${data.dateOpened}
- Initial: ${data.initial}
- RMA Type: ${data.rmaType}

Product Details:
- Product Name: ${data.productName}
- Model #: ${data.modelNumber}
- Product Line: ${data.productLine}
- Quantity Returned: ${data.quantityReturned}
- Serial / Lot Number: ${data.serialLotNumber}

Customer Description:
${data.customerDescription}
    `.trim();

    // Send email to all business addresses
    const response = await resend.emails.send({
      from: "noreply@clarusmed.com",
      to: businessMails,
      subject: `RMA Submission - ${data.rmaNumber} - ${data.customer}`,
      text: emailBody,
    });

    return Response.json({ success: true, response });
  } catch (error) {
    console.error("[v0] Email send error:", error);
    return Response.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
