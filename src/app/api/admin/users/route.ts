import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        hospital: {
          select: {
            hospitalName: true,
            sectorCode: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, role } = body;

    if (!id || !role) {
      return NextResponse.json({ error: "User ID and Role are required" }, { status: 400 });
    }

    // Ensure we don't accidentally let them assign arbitrary strings
    const validRoles = ["ADMIN", "hospital_admin", "user"]; // Add other valid roles here if any
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      }
    });

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        action: "UPDATE_USER_ROLE",
        entityType: "User",
        entityId: id,
        summary: `Admin updated user role to ${role}`,
        metadata: { adminId: admin.id, newRole: role }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[PATCH /api/admin/users]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevent self-deletion
    if (id === admin.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    await prisma.adminAuditLog.create({
      data: {
        action: "DELETE_USER",
        entityType: "User",
        entityId: id,
        summary: `Admin deleted user ${user.email}`,
        metadata: { adminId: admin.id, deletedEmail: user.email }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/users]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

