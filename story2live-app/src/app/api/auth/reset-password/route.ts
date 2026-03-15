import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-utils";
import { z } from "zod";
import crypto from "crypto";

const requestResetSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Step 1: Request reset token
    if (body.action === "request") {
      const parsed = requestResetSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
      });

      // Always return success to prevent email enumeration
      if (!user) {
        return NextResponse.json({
          message: "If that email exists, a reset link has been sent.",
        });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry: expiry },
      });

      // In production, send email with reset link
      // For MVP, return token directly (dev mode)
      const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

      return NextResponse.json({
        message: "If that email exists, a reset link has been sent.",
        // Only expose token in development for testing
        ...(process.env.NODE_ENV === "development" && { resetLink }),
      });
    }

    // Step 2: Reset password with token
    if (body.action === "reset") {
      const parsed = resetSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Invalid input" },
          { status: 400 }
        );
      }

      const { token, password } = parsed.data;
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: { gt: new Date() },
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Invalid or expired reset token" },
          { status: 400 }
        );
      }

      const hashedPassword = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return NextResponse.json({ message: "Password reset successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
