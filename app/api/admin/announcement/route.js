import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import StoreSettings from "@/models/StoreSettings";

const FALLBACK_SECRET = "fallback_secret_for_development_purposes";
const DEFAULT_ANNOUNCEMENT = {
  enabled: true,
  text: "Free Delivery Across India on Orders Above ₹2000",
};

async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || FALLBACK_SECRET);
    const user = await User.findById(decoded.id).select("role");
    if (!user || user.role !== "admin") return null;
    return user;
  } catch {
    return null;
  }
}

function normalizeAnnouncement(value) {
  return {
    enabled: typeof value?.enabled === "boolean" ? value.enabled : DEFAULT_ANNOUNCEMENT.enabled,
    text:
      typeof value?.text === "string" && value.text.trim().length > 0
        ? value.text.trim().slice(0, 180)
        : DEFAULT_ANNOUNCEMENT.text,
  };
}

export async function GET(req) {
  try {
    await dbConnect();

    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await StoreSettings.findOne({ key: "announcement_bar" }).lean();
    return NextResponse.json({
      success: true,
      data: normalizeAnnouncement(settings?.value),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();

    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const nextValue = normalizeAnnouncement(body);

    const settings = await StoreSettings.findOneAndUpdate(
      { key: "announcement_bar" },
      { value: nextValue },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: normalizeAnnouncement(settings.value) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
