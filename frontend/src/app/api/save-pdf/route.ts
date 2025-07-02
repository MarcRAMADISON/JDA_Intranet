import fs from "fs/promises";
import path from "path";
import moment from "moment";

const allowedOrigin = "https://intranet.jdadiffusion.fr";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function POST(req: Request) {
  try {
    const { pdf } = await req.json();

    if (!pdf) {
      return new Response(JSON.stringify({ error: "Aucun fichier PDF reçu" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const buffer = Buffer.from(pdf, "base64");
    const timedate = moment().format("DDMMYYYYHHmmss");

    const fileName = `lettre_de_mission${timedate}.pdf`;
    const absolutePath = path.join(process.cwd(), "public", "assets", fileName);
    const filePath = `${process.env.NEXT_PUBLIC_FRONT_API_URL}/api/pdf/${fileName}`;


    // Écriture du fichier
    await fs.writeFile(absolutePath, buffer);

    return new Response(
      JSON.stringify({
        message: "Fichier PDF sauvegardé avec succès",
        filePath,
        absolutePath,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (e) {
    console.log("❌ Erreur :", e);
    return new Response(
      JSON.stringify({ error: "Erreur lors de l'enregistrement du fichier" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
