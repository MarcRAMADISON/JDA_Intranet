import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body?.telephoneStandard || body?.ligneDirecte) {
    return fetch(
      `http://localhost:1337/api/fiches?filters[$or][0][telephoneStandard][$eq]=${
        body?.telephoneStandard || null
      }&filters[$or][1][ligneDirecte][$eq]=${
        body?.ligneDirecte || null
      }&filters[$or][2][ligneDirecte][$eq]=${
        body?.telephoneStandard || null
      }&filters[$or][3][telephoneStandard][$eq]=${body?.ligneDirecte || null}`,
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
          
          return fetch("http://localhost:1337/api/fiches", {
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
