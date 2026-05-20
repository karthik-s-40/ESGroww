import crypto from "crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/db";

import { sendVerificationEmail } from "@/lib/email";

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const { email } = body;

    if (
      !email ||
      typeof email !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Email address is required.",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email: email.trim(),
        },
      });

    if (
      !user ||
      user.emailVerified
    ) {
      return NextResponse.json({
        success: true,

        message:
          "If this email is registered and not yet verified, we sent a new verification link.",
      });
    }

    const verificationToken =
      crypto.randomBytes(32).toString(
        "hex"
      );

    const verificationExpiry =
      new Date(
        Date.now() +
          1000 * 60 * 60 * 24
      );

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        emailVerificationToken:
          verificationToken,

        emailVerificationExpiry:
          verificationExpiry,
      },
    });

    try {
      await sendVerificationEmail({
        email: user.email,

        token:
          verificationToken,
      });
    } catch (mailErr) {
      await prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          emailVerificationToken:
            null,

          emailVerificationExpiry:
            null,
        },
      });

      console.error(mailErr);

      const message =
        mailErr instanceof Error
          ? mailErr.message
          : "Could not send verification email.";

      return NextResponse.json(
        {
          error: message,
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Verification email sent. Check your inbox.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not send verification email.",
      },
      {
        status: 500,
      }
    );
  }
}
