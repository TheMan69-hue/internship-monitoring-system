import { NextResponse } from "next/server";
import { approveRegistration } from "@/lib/services/registration/approveRegistration";

export async function GET() {
  try {
    const result = await approveRegistration(
      "499bd74b-5fb6-401f-ad7c-5f6ff5db16ff"
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error("APPROVE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : error,
      },
      { status: 500 }
    );
  }
}