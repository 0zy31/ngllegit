import { NextRequest, NextResponse } from "next/server";
import { addMessage, getMessages, parseUserAgent } from "@/lib/store";

// IP'den konum alma
async function getLocationFromIP(ip: string) {
  try {
    if (
      ip === "::1" ||
      ip === "127.0.0.1" ||
      ip === "Bilinmiyor" ||
      ip.startsWith("192.168") ||
      ip.startsWith("10.")
    ) {
      return { country: "Yerel", city: "Localhost", region: "" };
    }

    const res = await fetch(
      `https://ip-api.com/json/${ip}?fields=country,city,regionName`
    );

    if (res.ok) {
      const data = await res.json();

      return {
        country: data.country ?? "Bilinmiyor",
        city: data.city ?? "Bilinmiyor",
        region: data.regionName ?? "",
      };
    }
  } catch (err) {
    console.log(err);
  }

  return { country: "Bilinmiyor", city: "Bilinmiyor", region: "" };
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Mesaj boş olamaz" },
        { status: 400 }
      );
    }

    const headers = request.headers;

    // 🔥 FIX: let → const (ESLint hatasını tamamen bitirir)
    const senderIP =
      headers.get("x-nf-client-connection-ip") ||
      headers.get("cf-connecting-ip") ||
      headers.get("true-client-ip") ||
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headers.get("x-real-ip") ||
      "Bilinmiyor";

    const userAgent = headers.get("user-agent") ?? "Bilinmiyor";

    const { browser, os, device } = parseUserAgent(userAgent);

    const location = await getLocationFromIP(senderIP);

    const message = addMessage({
      id: crypto.randomUUID(),
      content: content.trim(),
      senderIP,
      userAgent,
      browser,
      os,
      device,
      country: location.country,
      city: location.city,
      region: location.region,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      messageId: message.id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");

  if (auth !== "Bearer killokiswirf") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({ messages: getMessages() });
}
