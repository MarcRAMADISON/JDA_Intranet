import { NextRequest } from "next/server";

// Fonction pour créer une réponse d'erreur uniforme
const createErrorResponse = (message: string,type:string) => {
  return new Response(
    JSON.stringify({ message, status: "500",type:type }),
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

export async function POST(request: NextRequest) {
  const body = await request.json();


  if (body?.telephoneStandard || body?.ligneDirecte) {
    const telephoneStandard = encodeURIComponent(body?.telephoneStandard);
    const ligneDirecte = encodeURIComponent(body?.ligneDirecte);


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


    if (searchData?.data?.length) {
      return createErrorResponse("La fiche existe déjà avec les mêmes numéros de téléphone","ALREADY_EXISTS");
    } else {
      
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
      
        return createErrorResponse("Erreur lors de la création de la fiche","ERROR");
      }
    }
  } else {
    
    return createErrorResponse("Erreur lors de la création : informations manquantes","ERROR");
  }
}
