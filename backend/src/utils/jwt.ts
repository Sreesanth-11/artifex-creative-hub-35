import jwt from "jsonwebtoken";
import { Response } from "express";

interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

// Generate JWT Token
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  } as jwt.SignOptions);
};

// Verify JWT Token
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};

// Send token response
export const sendTokenResponse = (
  user: any,
  statusCode: number,
  res: Response
) => {
  // Create token
  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  const options = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRE || "7") * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    data: {
      user,
    },
  });
};
