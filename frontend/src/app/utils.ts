import Cookies from "js-cookie";
import * as XLSX from "xlsx";

export const setAuthCookie = ({
  cookies,
  user,
  idEquipe
}: {
  cookies: string;
  user: string;
  idEquipe: string
}) => {
  Cookies.set("auth-token", cookies, {
    expires: 1, // Durée en jours
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  Cookies.set("user", user, {
    expires: 1, // Durée en jours
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  Cookies.set("idEquipe", idEquipe, {
    expires: 1, // Durée en jours
    path: "/",
    secure: process.env.NODE_ENV === "production",
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
  XLSX.writeFile(workbook, "output.xlsx");
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

interface filterObject {
  statut: string;
  userId: number;
}

export async function getData({
  filters,
  start,
  limit,
  isAll = false,
}: {
  filters?: filterObject;
  start?: number;
  limit?: number;
  isAll?: boolean;
}) {
  const token = Cookies.get("auth-token");
  const user = Cookies.get("user");
  const idEquipe = Cookies.get("idEquipe");
  const type = JSON.parse(user || "").type;
  const idUser = JSON.parse(user || "").id;
  const query = (type === "ADMIN" && filters?.userId === 0) || (type === "ADMIN" && !filters?.userId) ? `?filters[user][equipe][$eq]=${idEquipe}&` : type === "ADMIN" && filters?.userId !== 0
        ? `?filters[user][$eq]=${filters?.userId}&`
      : `?filters[user][$eq]=${idUser}&`;


  let rows;


  if (filters?.statut && filters?.statut !== 'TOUT' && !isAll) {
    rows = await fetch(
      `http://localhost:1337/api/fiches${query}filters[statut][$eq]=${
        filters.statut
      }&pagination[start]=${start || 0}&pagination[limit]=${
        limit || 20
      }&populate=user,venduePar`,
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
      `http://localhost:1337/api/fiches${query}populate=user,venduePar&pagination[limit]=999`,
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
      `http://localhost:1337/api/fiches${query}filters[statut][$eq]=${filters?.statut}&populate=user,venduePar&pagination[limit]=999`,
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
      `http://localhost:1337/api/fiches${query}pagination[start]=${
        start || 0
      }&pagination[limit]=${limit || 20}&populate=user,venduePar`,
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
      `http://localhost:1337/api/users?filters[equipe]=${idEquipe}&fields[0]=username&fields[1]=type`,
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
