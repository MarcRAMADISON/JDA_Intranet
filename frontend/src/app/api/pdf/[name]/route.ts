import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  context: any
) {
  const { name } = context.params;
  const filePath = path.join(process.cwd(), "public", "assets", name);

  try {
    const file = await fs.readFile(filePath);
    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${name}"`,
      },
    });
  } catch (error) {
    console.log(error)
    return new NextResponse("Fichier introuvable", { status: 404 });
  }
}
