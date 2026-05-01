import { Resend } from "resend";

type ResendError = {
  message?: string;
  name?: string;
  statusCode?: number | null;
};

type InviteEmailInput = {
  loanId: string;
  to: string;
  personName: string;
  purpose: string;
  amount: string;
  targetDate: string;
  confirmationToken: string;
};

export function getInviteEmailErrorMessage(error: ResendError) {
  const message = `${error.name ?? ""} ${error.message ?? ""}`.toLowerCase();

  if (message.includes("api key") || message.includes("unauthorized")) {
    return "Email is not configured correctly. Please check the Resend API key.";
  }

  if (
    message.includes("from") ||
    message.includes("sender") ||
    message.includes("domain")
  ) {
    return "The sender email is not ready yet. Please check the verified Resend sender or domain.";
  }

  if (
    message.includes("recipient") ||
    message.includes("to") ||
    message.includes("invalid email")
  ) {
    return "That email address does not look valid. Please check the person’s email.";
  }

  if (
    message.includes("testing emails") ||
    message.includes("verify a domain") ||
    message.includes("own email address")
  ) {
    return "Resend is still in test mode. Send to your verified email or verify a sending domain.";
  }

  return "Couldn’t send the email. Try again in a moment or check the email address.";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendConfirmationEmail(input: InviteEmailInput) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const appUrl = process.env.APP_URL;
  const fromEmail = process.env.INVITE_FROM_EMAIL;

  if (!resendApiKey) {
    console.error("Resend invite email error", {
      loanId: input.loanId,
      reason: "Missing RESEND_API_KEY"
    });

    return {
      ok: false,
      message: "Email is not configured correctly. Please check the Resend API key."
    };
  }

  if (!appUrl || !fromEmail) {
    console.error("Resend invite email error", {
      loanId: input.loanId,
      reason: "Missing APP_URL or INVITE_FROM_EMAIL",
      hasAppUrl: Boolean(appUrl),
      hasFromEmail: Boolean(fromEmail)
    });

    return {
      ok: false,
      message: "Email is not configured yet. Please check the app URL and sender email."
    };
  }

  const confirmationUrl = `${appUrl.replace(/\/$/, "")}/confirm/${
    input.confirmationToken
  }`;
  const personName = escapeHtml(input.personName);
  const purpose = escapeHtml(input.purpose);
  const targetDate = escapeHtml(input.targetDate);
  const safeConfirmationUrl = escapeHtml(confirmationUrl);
  const resend = new Resend(resendApiKey);

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: input.to,
    subject: "Please review this UtangTrack record",
    text: [
      `Hi ${input.personName},`,
      "",
      "Someone shared an utang record with you in UtangTrack.",
      `Purpose: ${input.purpose}`,
      `Amount: ${input.amount}`,
      `Target date: ${input.targetDate}`,
      "",
      "Open this private link to confirm or correct the details:",
      confirmationUrl
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #10231d; line-height: 1.5;">
        <h1 style="font-size: 20px;">Please review this utang record</h1>
        <p>Hi ${personName},</p>
        <p>Someone shared this record with you so both sides can stay clear.</p>
        <ul>
          <li><strong>Purpose:</strong> ${purpose}</li>
          <li><strong>Amount:</strong> ${input.amount}</li>
          <li><strong>Target date:</strong> ${targetDate}</li>
        </ul>
        <p>
          <a href="${safeConfirmationUrl}" style="display: inline-block; background: #0f7a5f; color: white; padding: 10px 14px; text-decoration: none; border-radius: 4px; font-weight: 700;">
            Review and confirm/correct
          </a>
        </p>
        <p>If the button does not work, open this link:</p>
        <p><a href="${safeConfirmationUrl}">${safeConfirmationUrl}</a></p>
      </div>
    `
  });

  if (error) {
    console.error("Resend invite email error", {
      loanId: input.loanId,
      to: input.to,
      from: fromEmail,
      error
    });

    return {
      ok: false,
      message: getInviteEmailErrorMessage(error)
    };
  }

  return {
    ok: true,
    message: "Confirmation email sent."
  };
}
