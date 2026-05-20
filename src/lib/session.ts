import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "super-secret-key";

export function createSessionToken({
  userId,
  hospitalId,
  rememberMe,
}: {
  userId: string;
  hospitalId: string;
  rememberMe?: boolean;
}) {
  return jwt.sign(
    {
      userId,
      hospitalId,
    },

    JWT_SECRET,

    {
      expiresIn: rememberMe
        ? "30d"
        : "60m",
    }
  );
}

export function verifySessionToken(
  token: string
) {
  try {
    return jwt.verify(
      token,
      JWT_SECRET
    ) as {
      userId: string;
      hospitalId: string;
    };
  } catch {
    return null;
  }
}
