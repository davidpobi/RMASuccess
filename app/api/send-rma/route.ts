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

// Helper to build alternating table rows for the email
function buildRow(label: string, value: string, shaded = false): string {
  const bg = shaded ? "#f8fafc" : "#ffffff";
  return `<tr style="background:${bg};">
    <td style="padding:11px 18px;font-size:11px;font-weight:600;color:#7a9ab0;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;border-bottom:1px solid #e4eaf0;width:38%;">${label}</td>
    <td style="padding:11px 18px;font-size:14px;color:#0e1a2b;font-weight:500;border-bottom:1px solid #e4eaf0;">${value || "—"}</td>
  </tr>`;
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

    const htmlEmail = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RMA Submission</title>
</head>
<body style="margin:0;padding:0;background:#eef1f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0e1a2b;padding:32px 40px;border-radius:8px 8px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <!-- Crosshair SVG logo inline -->
                    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-right:12px;">
                      <circle cx="16" cy="16" r="13.5" stroke="#3ab5c6" stroke-width="1.4"/>
                      <circle cx="16" cy="16" r="5" stroke="#3ab5c6" stroke-width="1.4"/>
                      <line x1="16" y1="2" x2="16" y2="10.5" stroke="#3ab5c6" stroke-width="1.4" stroke-linecap="round"/>
                      <line x1="16" y1="21.5" x2="16" y2="30" stroke="#3ab5c6" stroke-width="1.4" stroke-linecap="round"/>
                      <line x1="2" y1="16" x2="10.5" y2="16" stroke="#3ab5c6" stroke-width="1.4" stroke-linecap="round"/>
                      <line x1="21.5" y1="16" x2="30" y2="16" stroke="#3ab5c6" stroke-width="1.4" stroke-linecap="round"/>
                      <circle cx="16" cy="16" r="1.5" fill="#3ab5c6"/>
                    </svg>
                    <span style="display:inline-block;vertical-align:middle;">
                      <span style="display:block;font-size:16px;font-weight:700;color:#ffffff;letter-spacing:0.02em;line-height:1.2;">RMASuccess</span>
                      <span style="display:block;font-size:9px;font-weight:500;color:#7a9ab0;letter-spacing:0.14em;margin-top:2px;">MEDICAL DEVICES</span>
                    </span>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:9px;font-weight:600;color:#3ab5c6;letter-spacing:0.14em;font-family:monospace;">RMA SUBMISSION</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Teal accent bar -->
          <tr>
            <td style="background:#3ab5c6;height:3px;line-height:3px;font-size:0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;">

              <!-- RMA number + customer hero -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="border-left:3px solid #3ab5c6;padding-left:16px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#7a9ab0;letter-spacing:0.12em;text-transform:uppercase;">Return Merchandise Authorization</p>
                    <p style="margin:0;font-size:28px;font-weight:700;color:#0e1a2b;letter-spacing:-0.02em;line-height:1.1;">RMA #${data.rmaNumber}</p>
                    <p style="margin:6px 0 0;font-size:15px;color:#3d566e;font-weight:500;">${data.customer}</p>
                  </td>
                </tr>
              </table>

              <!-- Section: Return Information -->
              <p style="margin:0 0 12px;font-size:10px;font-weight:700;color:#3ab5c6;letter-spacing:0.14em;text-transform:uppercase;">Return Information</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4eaf0;border-radius:6px;overflow:hidden;margin-bottom:28px;">
                ${buildRow("RMA #", data.rmaNumber, true)}
                ${buildRow("Customer", data.customer)}
                ${buildRow("Date Opened", data.dateOpened, true)}
                ${buildRow("Initial", data.initial)}
                ${buildRow("RMA Type", data.rmaType, true)}
              </table>

              <!-- Section: Product Details -->
              <p style="margin:0 0 12px;font-size:10px;font-weight:700;color:#3ab5c6;letter-spacing:0.14em;text-transform:uppercase;">Product Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4eaf0;border-radius:6px;overflow:hidden;margin-bottom:28px;">
                ${buildRow("Product Name", data.productName, true)}
                ${buildRow("Model #", data.modelNumber)}
                ${buildRow("Product Line", data.productLine, true)}
                ${buildRow("Qty Returned", data.quantityReturned)}
                ${buildRow("Serial / Lot #", data.serialLotNumber, true)}
              </table>

              <!-- Section: Customer Description -->
              <p style="margin:0 0 12px;font-size:10px;font-weight:700;color:#3ab5c6;letter-spacing:0.14em;text-transform:uppercase;">Customer Description</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4eaf0;border-radius:6px;overflow:hidden;margin-bottom:8px;">
                <tr>
                  <td style="padding:16px 18px;font-size:14px;color:#1e3347;line-height:1.6;">${data.customerDescription.replace(/\n/g, "<br/>")}</td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f4f7fa;padding:20px 40px;border-radius:0 0 8px 8px;border-top:1px solid #e4eaf0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#7a9ab0;line-height:1.6;">This is an automated notification from the RMASuccess portal.<br/>Do not reply to this email.</p>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:10px;font-weight:600;color:#b0bec8;letter-spacing:0.1em;font-family:monospace;">RMASuccess</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const plainText = [
      `RMA SUBMISSION — #${data.rmaNumber}`,
      `Customer: ${data.customer}`,
      `Date Opened: ${data.dateOpened}`,
      `Initial: ${data.initial}`,
      `RMA Type: ${data.rmaType}`,
      `Product Name: ${data.productName}`,
      `Model #: ${data.modelNumber}`,
      `Product Line: ${data.productLine}`,
      `Qty Returned: ${data.quantityReturned}`,
      `Serial / Lot #: ${data.serialLotNumber}`,
      ``,
      `Description:`,
      data.customerDescription,
    ].join("\n");

    // Send email to all business addresses
    const response = await resend.emails.send({
      from: process.env.SENDER_MAIL || "noreply@rmasuccess.com",
      to: businessMails,
      subject: `RMA #${data.rmaNumber} — ${data.customer}`,
      html: htmlEmail,
      text: plainText,
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
