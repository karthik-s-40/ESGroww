import crypto from "crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/db";

import {
  sendPasswordResetEmail,
} from "@/lib/email";

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
      user &&
      user.emailVerified
    ) {
      const resetToken =
        crypto.randomBytes(32).toString(
          "hex"
        );

      const resetExpiry =
        new Date(
          Date.now() +
            1000 * 60 * 60
        );

      await prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          resetPasswordToken:
            resetToken,

          resetPasswordExpiry:
            resetExpiry,
        },
      });

      try {
        await sendPasswordResetEmail({
          email: user.email,

          token:
            resetToken,
        });
      } catch (mailErr) {
        await prisma.user.update({
          where: {
            id: user.id,
          },

          data: {
            resetPasswordToken:
              null,

            resetPasswordExpiry:
              null,
          },
        });

        console.error(mailErr);

        const message =
          mailErr instanceof Error
            ? mailErr.message
            : "Could not send reset email.";

        return NextResponse.json(
          {
            error: message,
          },
          {
            status: 502,
          }
        );
      }
    }

    return NextResponse.json({
      success: true,

      message:
        "If an account exists for that email, you will receive password reset instructions shortly.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}
