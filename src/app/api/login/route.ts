import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/db";

import {
  comparePassword,
} from "@/lib/password";

import {
  createSessionToken,
} from "@/lib/session";

export async function POST(
  request: NextRequest
) {
  try {
    const clientIp =
      request.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim() ||
      request.headers.get(
        "x-real-ip"
      ) ||
      null;

    const body =
      await request.json();

    const {
      email,
      password,
      rememberMe,
    } = body;

    // REQUIRED

    if (!email || !password) {

      return NextResponse.json(
        {
          error:
            "Email and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    // FIND USER

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },

        include: {
          hospital: true,
        },
      });

    // USER NOT FOUND

    if (!user) {

      return NextResponse.json(
        {
          error:
            "No account found with this email address.",
        },
        {
          status: 404,
        }
      );
    }

    // LOCKED ACCOUNT

    if (
      user.accountLockedUntil &&
      user.accountLockedUntil >
        new Date()
    ) {

      return NextResponse.json(
        {
          error:
            "Account locked due to multiple failed attempts. Try again later.",
        },
        {
          status: 403,
        }
      );
    }

    // EMAIL VERIFICATION

    

// EMAIL VERIFICATION FALLBACK



   
  if (!user.emailVerified) {

  if (
    process.env.NODE_ENV ===
    "development"
  ) {

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        emailVerified: true,
      },
    });

  } else {

    return NextResponse.json(
      {
        error:
          "Please verify your email before logging in. Use \"Resend verification email\" if you did not receive the link.",

        requiresVerification: true,
      },
      {
        status: 403,
      }
    );
  }
}
    // ACCOUNT STATUS

   // ACCOUNT STATUS

// ACCOUNT STATUS

if (
  process.env.NODE_ENV ===
    "production" &&
  user.hospital.accountStatus !==
    "Active"
) {

  return NextResponse.json(
    {
      error:
        "Your account is not active.",
    },
    {
      status: 403,
    }
  );
}

    // PASSWORD CHECK

    const validPassword =
      await comparePassword(
        password,
        user.password
      );

    // WRONG PASSWORD

    if (!validPassword) {

      const newAttempts =
        user.failedLoginAttempts + 1;

      let lockUntil = null;

      if (newAttempts >= 5) {

        lockUntil = new Date(
          Date.now() +
            1000 *
              60 *
              15
        );
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          failedLoginAttempts:
            newAttempts,

          accountLockedUntil:
            lockUntil,
        },
      });

      return NextResponse.json(
        {
          error:
            newAttempts >= 5
              ? "Account locked for 15 minutes due to multiple failed attempts."
              : "Incorrect password.",
        },
        {
          status: 401,
        }
      );
    }

    // SUCCESS LOGIN

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        failedLoginAttempts: 0,

        accountLockedUntil: null,

        lastLoginAt:
          new Date(),

        lastLoginIp:
          clientIp,

        rememberMeEnabled:
          rememberMe || false,
      },
    });

    // CREATE TOKEN

    const token =
      createSessionToken({
        userId: user.id,

        hospitalId:
          user.hospitalId,

        rememberMe,
      });

    // RESPONSE

    const response =
      NextResponse.json({
        success: true,
      });

    // SESSION COOKIE

    response.cookies.set({
      name: "session",

      value: token,

      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge: rememberMe
        ? 60 * 60 * 24 * 30
        : 60 * 60,
    });

    return response;

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Login failed.",
      },
      {
        status: 500,
      }
    );
  }
}