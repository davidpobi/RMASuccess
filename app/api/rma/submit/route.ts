import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    // Parse comma-separated emails from BUSINESS_MAILS env var
    const businessMails = (process.env.BUSINESS_MAILS || '')
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (!businessMails.length) {
      return Response.json(
        { error: 'No business emails configured' },
        { status: 400 }
      );
    }

    // Format the RMA data for the email
    const emailBody = `
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0f4c75; margin-bottom: 24px;">New RMA Submission</h2>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="color: #0f4c75; margin-top: 0; font-size: 14px; font-weight: 600;">RETURN INFORMATION</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;"><strong>RMA #:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${formData.rmaNumber || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;"><strong>Customer:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${formData.customer || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;"><strong>Date Opened:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${formData.dateOpened || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;"><strong>Initial:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${formData.initial || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>RMA Type:</strong></td>
            <td style="padding: 8px 0; text-align: right;">${formData.rmaType || '-'}</td>
          </tr>
        </table>
      </div>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="color: #0f4c75; margin-top: 0; font-size: 14px; font-weight: 600;">PRODUCT DETAILS</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;"><strong>Product Name:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${formData.productName || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;"><strong>Model #:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right; font-family: monospace;">${formData.modelNumber || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;"><strong>Product Line:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${formData.productLine || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;"><strong>Quantity Returned:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${formData.quantityReturned || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Serial / Lot Number:</strong></td>
            <td style="padding: 8px 0; text-align: right; font-family: monospace;">${formData.serialLotNumber || '-'}</td>
          </tr>
        </table>
      </div>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="color: #0f4c75; margin-top: 0; font-size: 14px; font-weight: 600;">CUSTOMER DESCRIPTION</h3>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${formData.customerDescription || '-'}</p>
      </div>

      <div style="border-top: 1px solid #e0e0e0; padding-top: 16px; font-size: 12px; color: #666;">
        <p style="margin: 0;">This RMA was submitted via the CLARUSMED RMA Portal</p>
      </div>
    </div>
  </body>
</html>
    `.trim();

    // Send email to all business addresses
    const response = await resend.emails.send({
      from: 'RMA Portal <noreply@clarusmed.com>',
      to: businessMails,
      subject: `New RMA Submission #${formData.rmaNumber} - ${formData.customer}`,
      html: emailBody,
    });

    if (response.error) {
      console.error('Resend error:', response.error);
      return Response.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'RMA submitted successfully',
      rmaNumber: formData.rmaNumber,
    });
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
