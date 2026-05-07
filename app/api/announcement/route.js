import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";

const DEFAULT_ANNOUNCEMENT = {
  enabled: true,
  text: "Free Delivery Across India on Orders Above ₹2000",
};

function normalizeAnnouncement(value) {
  return {
    enabled: typeof value?.enabled === "boolean" ? value.enabled : DEFAULT_ANNOUNCEMENT.enabled,
    text:
      typeof value?.text === "string" && value.text.trim().length > 0
        ? value.text.trim().slice(0, 180)
        : DEFAULT_ANNOUNCEMENT.text,
  };
}

export async function GET() {
  try {
    await dbConnect();
    const settings = await StoreSettings.findOne({ key: "announcement_bar" }).lean();
    return NextResponse.json({ success: true, data: normalizeAnnouncement(settings?.value) });
  } catch {
    return NextResponse.json({ success: true, data: DEFAULT_ANNOUNCEMENT });
  }
}
