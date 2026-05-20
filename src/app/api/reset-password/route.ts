import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/db";

import {
  hashPassword,
  validatePasswordStrength,
} from "@/lib/password";

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const {
      token,
      password,
      confirmPassword,
    } = body;

    if (
      !token ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          error:
            "Token, new password, and confirmation are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          error:
            "Passwords do not match.",
        },
        {
          status: 400,
        }
      );
    }

    const validation =
      validatePasswordStrength(
        password
      );

    if (!validation.valid) {
      return NextResponse.json(
        {
          error:
            "Password must contain minimum 8 characters, 1 uppercase letter, 1 number, and 1 symbol.",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      await prisma.user.findFirst({
        where: {
          resetPasswordToken:
            token,

          resetPasswordExpiry: {
            gt: new Date(),
          },
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "This reset link is invalid or has expired. Please request a new one.",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword =
      await hashPassword(password);

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        password:
          hashedPassword,

        resetPasswordToken:
          null,

        resetPasswordExpiry:
          null,

        failedLoginAttempts: 0,

        accountLockedUntil:
          null,
      },
    });

    return NextResponse.json({
      success: true,

      message:
        "Your password has been updated. Please sign in with your new password.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Password reset failed.",
      },
      {
        status: 500,
      }
    );
  }
}
