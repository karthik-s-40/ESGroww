import { NextRequest, NextResponse } from "next/server";

import crypto from "crypto";

import { prisma } from "@/lib/db";

import {
  hashPassword,
  validatePasswordStrength,
} from "@/lib/password";

import {
  validateEmail,
  SECTOR_OPTIONS,
} from "@/lib/validation";

import { sendVerificationEmail } from "@/lib/email";

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const {
      fullName,
      email,
      password,
      confirmPassword,
      organizationName,
      sectorCode,
      country,
      state,
      acceptTerms,
    } = body;

    // REQUIRED

    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword ||
      !organizationName ||
      !sectorCode ||
      !country ||
      !state
    ) {
      return NextResponse.json(
        {
          error:
            "All mandatory fields are required.",
        },
        {
          status: 400,
        }
      );
    }

    // TERMS

    if (!acceptTerms) {
      return NextResponse.json(
        {
          error:
            "Please accept Terms & Privacy Policy.",
        },
        {
          status: 400,
        }
      );
    }

    // EMAIL

    if (!validateEmail(email)) {
      return NextResponse.json(
        {
          error:
            "Invalid email format.",
        },
        {
          status: 400,
        }
      );
    }

    const trimmedName =
      String(fullName).trim();

    const trimmedOrg =
      String(organizationName).trim();

    if (trimmedName.length < 2) {
      return NextResponse.json(
        {
          error:
            "Full name must be at least 2 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (trimmedOrg.length < 2) {
      return NextResponse.json(
        {
          error:
            "Organization name must be at least 2 characters.",
        },
        {
          status: 400,
        }
      );
    }

    // PASSWORD MATCH

    if (
      password !== confirmPassword
    ) {
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

    // PASSWORD STRENGTH

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

    // SECTOR

    const sectorExists =
      SECTOR_OPTIONS.find(
        (s) =>
          s.code === sectorCode
      );

    if (!sectorExists) {
      return NextResponse.json(
        {
          error:
            "Invalid sector selected.",
        },
        {
          status: 400,
        }
      );
    }

    // DUPLICATE EMAIL

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Please log in or use a different email.",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword =
      await hashPassword(password);

    const verificationToken =
      crypto.randomBytes(32).toString(
        "hex"
      );

    const verificationExpiry =
      new Date(
        Date.now() +
          1000 * 60 * 60 * 24
      );

    // CREATE HOSPITAL

    const hospital =
      await prisma.hospital.create({
        data: {
          hospitalName:
            trimmedOrg,

          sectorCode,

          industry:
            sectorExists.label,

          country: String(country).trim(),

          state: String(state).trim(),

          accountStatus:
            "Pending Verification",
        },
      });

    // CREATE USER

    const user =
      await prisma.user.create({
        data: {
          fullName: trimmedName,

          email,

          password:
            hashedPassword,

          hospitalId:
            hospital.id,

          emailVerified: false,

          emailVerificationToken:
            verificationToken,

          emailVerificationExpiry:
            verificationExpiry,
        },
      });

    try {
      await sendVerificationEmail({
        email,

        token:
          verificationToken,
      });
    } catch (mailErr) {
      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });

      await prisma.hospital.delete({
        where: {
          id: hospital.id,
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
        "Registration successful. We sent a verification link to your email — please confirm within 24 hours.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Registration failed.",
      },
      {
        status: 500,
      }
    );
  }
}
