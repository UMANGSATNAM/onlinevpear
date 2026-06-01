import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and merchant in a transaction
    const { user, merchant } = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash: hashedPassword,
          role: "owner", // Owner of their merchant
        },
      });

      const merchant = await tx.merchant.create({
        data: {
          businessName: `${name}'s Store`,
          email: email,
        },
      });

      await tx.merchantUser.create({
        data: {
          userId: user.id,
          merchantId: merchant.id,
          role: "owner",
          permissions: JSON.stringify(["all"]),
          acceptedAt: new Date(),
        },
      });

      return { user, merchant };
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "user_registered",
        resource: "user",
        resourceId: user.id,
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: user.id, merchantId: merchant.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
