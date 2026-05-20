import { Resend } from "resend";

function appBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function requireResendClient(): Resend {
  const key =
    process.env.RESEND_API_KEY?.trim();

  if (!key) {
    throw new Error(
      "RESEND_API_KEY is not set. Add your Resend API key to .env, restart the dev server (npm run dev), then try again. Get a key at https://resend.com/api-keys"
    );
  }

  return new Resend(key);
}

function formatResendFailure(
  error: {
    message?: string | string[];
    name?: string;
  } | null
): string {
  if (!error) {
    return "Unknown error from email provider.";
  }

  const raw =
    error.message ?? error.name;

  const base =
    typeof raw === "string"
      ? raw
      : Array.isArray(raw)
        ? raw.join(", ")
        : "Email provider rejected the request.";

  return `${base} — Tip: on Resend's free plan you can usually only send to your own account email until you verify a custom domain.`;
}

export async function sendVerificationEmail({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const verifyUrl = `${appBaseUrl()}/verify-email?token=${token}`;

  const resend =
    requireResendClient();

  const { error } =
    await resend.emails.send({
      from:
        "ESGroww <onboarding@resend.dev>",

      to: email,

      subject:
        "Verify your ESGroww account email",

      html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 560px;">
        <h2 style="color:#0f172a;">Verify your account</h2>

        <p style="color:#334155;line-height:1.6;">
          Thank you for joining <strong>ESGroww</strong>, the sustainability readiness intelligence
          platform aligned with the SAM Assessment methodology.
        </p>

        <p style="color:#334155;line-height:1.6;">
          Click the button below to verify your email. This link expires in <strong>24 hours</strong>.
        </p>

        <a
          href="${verifyUrl}"
          style="
            display:inline-block;
            background:#059669;
            color:white;
            padding:12px 22px;
            border-radius:10px;
            text-decoration:none;
            margin-top:16px;
            font-weight:600;
          "
        >
          Verify account
        </a>

        <p style="margin-top:28px;font-size:12px;color:#64748b;line-height:1.5;">
          SAM Assessment Application provides indicative sustainability and certification readiness
          intelligence. This platform does not replace official certification audits, regulatory
          reviews, accredited assessments, or legal compliance advice. All scores and recommendations
          are indicative only.
        </p>
      </div>
    `,
    });

  if (error) {

  console.error(
    "Verification email failed:",
    formatResendFailure(error)
  );

  // DEV MODE FALLBACK
  if (
    process.env.NODE_ENV ===
    "development"
  ) {

    console.warn(
      "DEV MODE: Email verification skipped."
    );

    return;
  }

  throw new Error(
    formatResendFailure(error)
  );
}
}

export async function sendPasswordResetEmail({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const resetUrl = `${appBaseUrl()}/reset-password?token=${token}`;

  const resend =
    requireResendClient();

  const { error } =
    await resend.emails.send({
      from:
        "ESGroww <onboarding@resend.dev>",

      to: email,

      subject:
        "Reset your ESGroww password",

      html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 560px;">
        <h2 style="color:#0f172a;">Password reset requested</h2>

        <p style="color:#334155;line-height:1.6;">
          We received a request to reset the password for your ESGroww account. Use the button below
          to choose a new password. This link expires in <strong>1 hour</strong>.
        </p>

        <a
          href="${resetUrl}"
          style="
            display:inline-block;
            background:#059669;
            color:white;
            padding:12px 22px;
            border-radius:10px;
            text-decoration:none;
            margin-top:16px;
            font-weight:600;
          "
        >
          Reset password
        </a>

        <p style="margin-top:24px;font-size:13px;color:#64748b;">
          If you did not request this, you can ignore this email. Your password will stay the same.
        </p>
      </div>
    `,
    });

  if (error) {
    throw new Error(
      formatResendFailure(error)
    );
  }
}
