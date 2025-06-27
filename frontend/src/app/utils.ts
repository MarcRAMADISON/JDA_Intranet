import Cookies from "js-cookie";
import moment from "moment";
import * as XLSX from "xlsx";

export const setAuthCookie = ({
  cookies,
  user,
  idEquipe,
}: {
  cookies: string;
  user: string;
  idEquipe: string;
}) => {
  Cookies.set("auth-token", cookies, {
    expires: 1, // Durée en jours
    path: "/",
    secure: false, //process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  Cookies.set("user", user, {
    expires: 1, // Durée en jours
    path: "/",
    secure: false, //process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  Cookies.set("idEquipe", idEquipe, {
    expires: 1, // Durée en jours
    path: "/",
    secure: false, //process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

export const handleExport = (data: any) => {
  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet["A1"].s = {
    font: { bold: true, color: { rgb: "000" } },
    fill: { fgColor: { rgb: "000" } },
  };

  worksheet["!cols"] = [
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 30 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 10 },
    { wch: 30 },
    { wch: 25 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Écriture du fichier
  XLSX.writeFile(workbook, "base_de_donnee.xlsx");
};

export const importExcel = () => {
  const workbook = XLSX.readFile("data.xlsx");

  // Sélectionner la première feuille
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convertir les données en JSON
  const jsonData = XLSX.utils.sheet_to_json(sheet);

  console.log("JSON_DATA", jsonData);
};

export const extractValue = (data: any, keyWord: string) => {
  const keyList = Object.keys(data);
  const keyFound = keyList.find((item) =>
    item.toLowerCase().includes(keyWord.toLowerCase())
  );
  return keyFound ? data[keyFound] : undefined;
};

export const sortData = (data: any) => {
  const priorites = [
    "Nouveau",
    "A rappeler",
    "A signer",
    "Injoignable",
    "Ne répond pas",
    "Hors cible",
    "Ne plus appeler",
    "Faux numéro",
    "Vente OK",
  ]; 
  const tableauTrie = data.sort((a: any, b: any) => {
    const indexA = priorites.indexOf(a?.statut);
    const indexB = priorites.indexOf(b?.statut);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return a?.statut && b?.statut && a?.statut.localeCompare(b?.statut);
  });

  return tableauTrie;
};

interface filterObject {
  statut: string;
  userId: number;
}

export async function getData({
  filters,
  start,
  limit,
  isAll = false,
  search,
}: {
  filters?: filterObject;
  start?: number;
  limit?: number;
  isAll?: boolean;
  search?: string;
}) {
  const token = Cookies.get("auth-token");
  const user = Cookies.get("user");
  const idEquipe = Cookies.get("idEquipe");
  const type = JSON.parse(user || "").type;
  const idUser = JSON.parse(user || "").id;
  const query =
    (type === "ADMIN" && filters?.userId === 0) ||
    (type === "ADMIN" && !filters?.userId)
      ? `?filters[user][equipe][$eq]=${idEquipe}&`
      : type === "ADMIN" && filters?.userId !== 0
      ? `?filters[$or][0][user][$eq]=${filters?.userId}&filters[$or][1][userAssigne][$eq]=${filters?.userId}&`
      : `?filters[$or][0][user][$eq]=${idUser}&filters[$or][1][userAssigne][$eq]=${idUser}&`;

  let rows;

  if (search) {
    rows = await fetch(
      `${
        process.env.NEXT_PUBLIC_URL
      }/api/fiches${query}filters[$and][0][$or][0][telephoneStandard][$containsi]=${search}&filters[$and][0][$or][1][ligneDirecte][$containsi]=${search}&filters[$and][0][$or][2][etablissement][$containsi]=${search}&filters[$and][0][$or][3][localisation][$containsi]=${search}&pagination[start]=${
        start || 0
      }&pagination[limit]=${
        limit || 20
      }&populate=user,venduePar,userAssigne&sort=createdAt:desc`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          accept: "application/json",
          Authorization: "bearer " + token,
        },
      }
    );

    return rows;
  }

  if (filters?.statut && filters?.statut !== "TOUT" && !isAll) {
    rows = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/fiches${query}filters[statut][$eq]=${
        filters.statut
      }&pagination[start]=${start || 0}&pagination[limit]=${
        limit || 20
      }&populate=user,venduePar,userAssigne&sort=createdAt:desc`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          accept: "application/json",
          Authorization: "bearer " + token,
        },
      }
    );
  } else if (isAll && (!filters?.statut || filters?.statut === "TOUT")) {
    rows = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/fiches${query}populate=user,venduePar,userAssigne&pagination[limit]=-1&sort=createdAt:desc`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          accept: "application/json",
          Authorization: "bearer " + token,
        },
      }
    );
  } else if (isAll && filters?.statut) {
    rows = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/fiches${query}filters[statut][$eq]=${filters?.statut}&populate=user,venduePar,userAssigne&pagination[limit]=-1&sort=createdAt:desc`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          accept: "application/json",
          Authorization: "bearer " + token,
        },
      }
    );
  } else {
    rows = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/fiches${query}pagination[start]=${
        start || 0
      }&pagination[limit]=${
        limit || 20
      }&populate=user,venduePar,userAssigne&sort=createdAt:desc`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          accept: "application/json",
          Authorization: "bearer " + token,
        },
      }
    );
  }

  return rows;
}

export const getUsers = async () => {
  const token = Cookies.get("auth-token");
  const idEquipe = Cookies.get("idEquipe");

  return fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/users?filters[equipe]=${idEquipe}&fields[0]=username&fields[1]=type`,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        accept: "application/json",
        Authorization: "bearer " + token,
      },
    }
  );
};

const months = [
  { label: "Jan.", index: 0 },
  { label: "Fev.", index: 1 },
  { label: "Mar.", index: 2 },
  { label: "Avr.", index: 3 },
  { label: "Mai.", index: 4 },
  { label: "Jui.", index: 5 },
  { label: "Juil.", index: 6 },
  { label: "Aoû.", index: 7 },
  { label: "Sept.", index: 8 },
  { label: "Oct.", index: 9 },
  { label: "Nov.", index: 10 },
  { label: "Dec.", index: 11 },
];
export const statuts = [
  "Nouveau",
  "Injoignable",
  "Ne répond pas",
  "A rappeler",
  "Ne plus appeler",
  "Hors cible",
  "Faux numéro",
  "A signer",
  "Vente OK",
];

export const statutsAgent= [
  "A rappeler",
  "A signer"
]

export const getAnnualStat = ({
  year,
  type,
  idUser,
}: {
  year: number;
  type?: string;
  idUser?: number;
}) => {
  const token = Cookies.get("auth-token");
  const idEquipe = Cookies.get("idEquipe");

  const requestURL =
    type === "INDIVIDUAL" && idUser
      ? `${process.env.NEXT_PUBLIC_URL}/api/fiches?filters[$or][0][user][$eq]=${idUser}&filters[$or][1][userAssigne][$eq]=${idUser}&filters[$or][2][venduePar][$eq]=${idUser}&filters[createdAt][$gte]=${year}-01-01&filters[createdAt][$lte]=${year}-12-31&pagination[limit]=-1&populate=user,venduePar,userAssigne`
      : `${process.env.NEXT_PUBLIC_URL}/api/fiches?filters[user][equipe][$eq]=${idEquipe}&filters[createdAt][$gte]=${year}-01-01&filters[createdAt][$lte]=${year}-12-31&pagination[limit]=-1`;

  return fetch(requestURL, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      accept: "application/json",
      Authorization: "bearer " + token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data?.data?.length) {
        const filtredData = months.map((month) => {
          const monthlyData = (data.data || []).filter((d: any) => {
            return moment(d.attributes.createdAt).month() === month.index;
          });

          const filtredMonthlyData= (monthlyData || []).filter((d: any) => {
            if(d?.attributes?.venduePar?.data){
              return d?.attributes?.venduePar?.data?.id === idUser
            }else if(d?.attributes?.userAssigne?.data){
              return d?.attributes?.userAssigne?.data?.id === idUser
            }else {
              return true;
            }
         })

          const statutData = statuts.map((statut) => {
            return {
              statut,
              nbFiche: (filtredMonthlyData || []).filter((d: any) => {
                return d.attributes.statut === statut;
              }).length,
            };
          });

          return {
            ...month,
            nbFiche: filtredMonthlyData.length,
            statuts: statutData,
          };
        });

        const filtredGlobalData= (data.data || []).filter((d: any) => {
          if(d?.attributes?.venduePar?.data){
            return d?.attributes?.venduePar?.data?.id === idUser
          }else if(d?.attributes?.userAssigne?.data){
            return d?.attributes?.userAssigne?.data?.id === idUser
          }else{
            return true
          } 
       })

        const filtredByStatut = statuts.map((statut) => {
          return {
            statut,
            nbFiche: (filtredGlobalData || []).filter((d: any) => {
              return d.attributes.statut === statut;
            }).length,
          };
        });

        return {
          global: {
            totalAnnuel: filtredGlobalData.length,
            monthData: filtredData,
            statuts: filtredByStatut,
          },
        };
      }

    });
};

export const defaultValues = {
  responsable: "",
  localisation: "",
  secteurActivite: "",
  etablissement: "",
  email: "",
  ligneDirecte: "",
  statut: "",
  telephoneStandard: "",
  nbEtoile: 0,
  reseauxSociaux: "",
  nbFollowers: "",
  siteWeb: "",
  siren: "",
  comment: "",
  siret: "",
  statutJuridique: "",
  codePostal:"",
  ville:""
};

import { PDFDocument, rgb } from "pdf-lib";

 export const handleAddTextToSpecificPage = async ({dataForm,currentLm}:{dataForm:any,currentLm:string}) => {
  const file= currentLm === "access"? `/assets/lmAccess.pdf` : `/assets/lmPremium.pdf`
  const existingPdfBytes = await fetch(file).then((res) =>
    res.arrayBuffer()
  );

  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const secondPage = pdfDoc.getPages()[1];
  const endPage = pdfDoc.getPages()[7];

  const keys: any = Object.keys(dataForm);

  const font = await pdfDoc.embedFont("Helvetica");
  const textSize = 12;

  const listForm = [
    "etablissement",
    "statutJuridique",
    "localisation",
    "siret",
    "responsable",
    "email",
    "ligneDirecte",
    "codePostal",
    "ville",
  ];

  (keys || [])
    .filter((k: string) => listForm.includes(k))
    .map(async (key: string) => {
      let xPosition;
      let yPosition;
      let dbXPosition;
      let dbYPosition;

      switch (key) {
        case "etablissement":
          xPosition = 130;
          yPosition = 730;
          break;
        case "statutJuridique":
          xPosition = 180;
          yPosition = 700;
          break;
        case "localisation":
          xPosition = 220;
          yPosition = 670;
          break;
        case "ville":
          xPosition = 130;
          yPosition = 645;
          break;
        case "codePostal":
          xPosition = 170;
          yPosition = 615;
          break;
        case "siret":
          xPosition = 200;
          yPosition = 585;
          break;
        case "responsable":
          xPosition = 130;
          yPosition = 455;
          dbXPosition = 145;
          dbYPosition = 425;
          break;
        case "email":
          xPosition = 170;
          yPosition = 397;
          break;
        case "ligneDirecte":
          xPosition = 220;
          yPosition = 370;
          break;
      }

      if (dbXPosition && dbYPosition) {
        secondPage.drawText(`${dataForm[key]}`, {
          x: dbXPosition,
          y: dbYPosition,
          font,
          size: textSize,
          color: rgb(0, 0, 0),
        });
      }

      secondPage.drawText(`${dataForm[key]}`, {
        x: xPosition,
        y: yPosition,
        font,
        size: textSize,
        color: rgb(0, 0, 0),
      });
    });

  secondPage.drawText(
    `${moment().add(1, "M").startOf("M").format("DD/MM/YYYY")}`,
    {
      x: 240,
      y: 240,
      font,
      size: textSize,
      color: rgb(0, 0, 0),
    }
  );

  endPage.drawText(`${dataForm["responsable"]}`, {
    x: 220,
    y: currentLm === 'access'? 270 : 295,
    font,
    size: textSize,
    color: rgb(0, 0, 0),
  });

  endPage.drawText(`${moment().format("DD/MM/YYYY")}`, {
    x: 240,
    y: currentLm === "access"? 210 : 230,
    font,
    size: textSize,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();

  const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

  const response = await fetch(`${process.env.NEXT_PUBLIC_FRONT_API_URL}/api/save-pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pdf: pdfBase64 }),
  })

  const data = await response.json();
  
  return data
};

export const deleteFile=(pdfSrc:string | undefined)=>{
  const normalizedPath = pdfSrc?.replace(/\\/g, "/");
  const fileName = normalizedPath?.split("/").pop();

  fetch(`${process.env.NEXT_PUBLIC_FRONT_API_URL}/api/delete-pdf`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: fileName }),
  })
}
