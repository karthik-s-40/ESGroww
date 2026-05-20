import { NextResponse } from "next/server";

import { serialize } from "cookie";

export async function POST() {
  const response =
    NextResponse.json({
      success: true,
    });

  response.headers.set(
    "Set-Cookie",

    serialize(
      "session",
      "",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",

        maxAge: 0,
      }
    )
  );

  return response;
}
