import { NextRequest } from "next/server";
import axios from "axios";
import FormData from "form-data";

const BASE_URL = "https://api-sandbox.yousign.app/v3";
const API_KEY = process.env.YOUSIGN_API_KEY || "REPLACE_WITH_YOUR_API_KEY";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

const request = async (
  endpoint: string,
  options: any = {},
  headers: any = {}
) => {
  const url = `${BASE_URL}/${endpoint}`;
  const config = {
    url,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      ...headers,
    },
    ...options,
  };

  try {
    const res = await axios(config);
    return res.data;
  } catch (e: any) {
    console.error(`Erreur API [${endpoint}] :`, e.response?.data || e.message);
    throw new Error(`Erreur API YouSign (${endpoint})`);
  }
};

export async function POST(req: NextRequest) {
  try {
    const { fileName, signerEmail, signerName, currentLm } = await req.json();

    if (!fileName || !signerEmail || !signerName) {
      return new Response(JSON.stringify({ message: "Champs manquants" }), {
        status: 400,
      });
    }

    // Chemin absolu vers le fichier dans /public/assets
    const url = `${process.env.NEXT_PUBLIC_FRONT_API_URL}/api/pdf/${fileName}`;
    const res = await fetch(url);
    
    if (!res.ok) throw new Error("Erreur lors de la récupération du PDF");
    
    const arrayBuffer = await res.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 1. Créer la demande de signature
    const signatureRequest = await request(
      "signature_requests",
      {
        method: "POST",
        data: JSON.stringify({
          name: `Lettre de mission ${currentLm}`,
          delivery_mode: "email",
          timezone: "Europe/Paris",
        }),
      },
      {
        "Content-Type": "application/json",
      }
    );

    const signatureRequestId = signatureRequest.id;

    // 2. Uploader le fichier dans la signature request
    const form = new FormData();
    form.append("file", fileBuffer, {
      filename: fileName,
      contentType: "application/pdf",
    });
    form.append("nature", "signable_document");
    form.append("parse_anchors", "true");

    const uploadedDocument = await request(
      `signature_requests/${signatureRequestId}/documents`,
      {
        method: "POST",
        data: form,
      },
      form.getHeaders()
    );

    const documentId = uploadedDocument.id;

    // 3. Ajouter le signataire
    const [first_name, last_name] = signerName.split(" ");

    await request(
      `signature_requests/${signatureRequestId}/signers`,
      {
        method: "POST",
        data: JSON.stringify({
          info: {
            first_name,
            last_name,
            email: signerEmail,
            locale: "fr",
          },
          signature_level: "electronic_signature",
          signature_authentication_mode: "no_otp",
          fields: [
            {
              document_id: documentId,
              type: "signature",
              page: 1,
              x: 100,
              y: 600,
            },
          ],
        }),
      },
      { "Content-Type": "application/json" }
    );

    // 4. Activer la demande
    await request(`signature_requests/${signatureRequestId}/activate`, {
      method: "POST",
    });

    return new Response(
      JSON.stringify({ message: "Signature demandée", id: signatureRequestId }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        },
      }
    );
  } catch (error) {
    console.error("Erreur globale :", error);
    return new Response(
      JSON.stringify({ message: "Erreur dans la signature" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        },
      }
    );
  }
}

export async function GET() {
  return new Response("Méthode GET non autorisée.", {
    status: 405,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}
