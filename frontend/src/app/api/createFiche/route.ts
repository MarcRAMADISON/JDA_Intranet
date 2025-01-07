import { NextRequest } from "next/server";

// Fonction pour créer une réponse d'erreur uniforme
const createErrorResponse = (message: string) => {
  return new Response(
    JSON.stringify({ message, status: "500" }),
    {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
};

// Fonction pour gérer la méthode OPTIONS (CORS)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// Fonction pour gérer la méthode POST (création de la fiche)
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Vérification des paramètres nécessaires dans le corps de la requête
  if (body?.telephoneStandard || body?.ligneDirecte) {
    const telephoneStandard = encodeURIComponent(body?.telephoneStandard);
    const ligneDirecte = encodeURIComponent(body?.ligneDirecte);

    // Recherche d'une fiche existante avec les mêmes numéros de téléphone
    const searchUrl = `${
      process.env.NEXT_PUBLIC_URL
    }/api/fiches?filters[$or][0][telephoneStandard][$eq]=${
      telephoneStandard || null
    }&filters[$or][1][ligneDirecte][$eq]=${
      ligneDirecte || null
    }&filters[$or][2][ligneDirecte][$eq]=${
      telephoneStandard || null
    }&filters[$or][3][telephoneStandard][$eq]=${ligneDirecte || null}`;

    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        accept: "application/json",
        Authorization: request?.headers?.get("Authorization") || "",
      },
    });

    const searchData = await searchResponse.json();

    // Si une fiche existe déjà, renvoyer une erreur
    if (searchData?.data?.length) {
      return createErrorResponse("La fiche existe déjà avec les mêmes numéros de téléphone");
    } else {
      // Sinon, créer une nouvelle fiche
      const createResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/fiches`, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          accept: "application/json",
          Authorization: request?.headers?.get("Authorization") || "",
        },
        body: JSON.stringify({ data: { ...body } }),
      });

      const createData = await createResponse.json();

      // Si la création réussit, renvoyer la réponse de la fiche créée
      if (createData?.data) {
        return new Response(JSON.stringify({ ...createData?.data }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        });
      } else {
        // En cas d'erreur lors de la création
        return createErrorResponse("Erreur lors de la création de la fiche");
      }
    }
  } else {
    // Si les informations requises ne sont pas présentes
    return createErrorResponse("Erreur lors de la création : informations manquantes");
  }
}
