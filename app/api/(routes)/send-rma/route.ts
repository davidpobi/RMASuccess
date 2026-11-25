import { NextRequest, NextResponse } from "next/server";
import { handleSubmitRma } from "./sendRma";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "A valid JSON request body is required" },
      { status: 400 }
    );
  }

  const { operation, ...body } = (payload && typeof payload === "object" ? payload : {}) as {
    operation?: string;
    data?: unknown;
  };

  try {
    switch (operation) {
      case "submitRma":
        return await handleSubmitRma(body);

      default:
        return NextResponse.json({ success: false, data: null, message: "Invalid operation" }, { status: 400 });
    }
  } catch (error) {
    console.error("[send-rma] Error handling request:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
