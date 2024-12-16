import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  console.log("body", body?.telephoneStandard, body?.ligneDirecte);

  if (body?.telephoneStandard || body?.ligneDirecte) {
    console.log("body2", body?.telephoneStandard, body?.ligneDirecte);

    return fetch(
      `http://localhost:1337/api/fiches?filters[$or][0][telephoneStandard][$eq]=${
        body?.telephoneStandard || null
      }&filters[$or][1][ligneDirecte][$eq]=${body?.ligneDirecte || null}`,
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
        console.log("body3", res, request?.headers?.get("Authorization"));

        if (res?.data?.length) {
          console.log("body9", res.data, request?.headers?.get("Authorization"));
          return new Response(
            JSON.stringify({ message: "la fiche exite déjà avec les même numéro téléphone" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        } else{
            console.log("body6", res, request?.headers?.get("Authorization"));

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
                  console.log("body4", res.data);
                  if (res.data) {
                    return new Response(res?.data, {
                      status: 200,
                      headers: { "Content-Type": "application/json" },
                    });
                  } else {
                    return new Response(
                      JSON.stringify({ message: "Error creation" }),
                      {
                        status: 500,
                        headers: { "Content-Type": "application/json" },
                      }
                    );
                  }
                })
                .catch(() => {
                  return new Response(JSON.stringify({ message: "Error creation" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                  });
                });
            
        }
      });
  }else{
    return new Response(JSON.stringify({ message: "Error creation" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
  }
  
}
