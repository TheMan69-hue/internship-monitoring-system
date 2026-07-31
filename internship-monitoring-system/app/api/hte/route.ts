import { NextResponse } from "next/server";
import { addHTE, updateHTE, deleteHTE } from "@/lib/services/hte";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body);
    await addHTE(body);

    return NextResponse.json(
      { message: "HTE created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create HTE." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    await updateHTE(body);

    return NextResponse.json(
      { message: "HTE updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update HTE." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    await deleteHTE(id);

    return NextResponse.json(
      { message: "HTE deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete HTE." },
      { status: 500 }
    );
  }
}