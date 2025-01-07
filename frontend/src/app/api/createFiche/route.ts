import { NextRequest } from "next/server";
import { NextApiResponse } from "next/types";

export async function POST(request: NextRequest,res: NextApiResponse) {

  res.setHeader('Access-Control-Allow-Origin', '*'); // Permet toutes les origines (à limiter en production)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Méthodes autorisées
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // En-têtes autorisés


  const body = await request.json();


  if (body?.telephoneStandard || body?.ligneDirecte) {

    
  const telephoneStandard=encodeURIComponent(body?.telephoneStandard)
  const ligneDirecte=encodeURIComponent(body?.ligneDirecte)

    return fetch(
      `${process.env.NEXT_PUBLIC_URL || "http://localhost/api"}/api/fiches?filters[$or][0][telephoneStandard][$eq]=${
        telephoneStandard || null
      }&filters[$or][1][ligneDirecte][$eq]=${
        ligneDirecte || null
      }&filters[$or][2][ligneDirecte][$eq]=${
        telephoneStandard || null
      }&filters[$or][3][telephoneStandard][$eq]=${ligneDirecte || null}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          accept: "application/json",
          Authorization: request?.headers?.get("Authorization") || "",
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res?.data?.length) {
          return new Response(
            JSON.stringify({
              message: "la fiche exite déjà avec les même numéro téléphone",
              status: "500",
              type: "ALREADY_EXISTS",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        } else {
          
          return fetch(`${process.env.NEXT_PUBLIC_URL || "http://localhost/api"}/api/fiches`, {
            method: "POST",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
              accept: "application/json",
              Authorization: request?.headers?.get("Authorization") || "",
            },
            body: JSON.stringify({ data: { ...body } }),
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.data) {
                return new Response(JSON.stringify({ ...res?.data }), {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                });
              } else {
                return new Response(
                  JSON.stringify({ message: "Error creation", status: "500" }),
                  {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                  }
                );
              }
            })
            .catch(() => {
              return new Response(
                JSON.stringify({ message: "Error creation", status: "500" }),
                {
                  status: 500,
                  headers: { "Content-Type": "application/json" },
                }
              );
            });
        }
      });
  } else {
    return new Response(
      JSON.stringify({ message: "Error creation", status: "500" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
