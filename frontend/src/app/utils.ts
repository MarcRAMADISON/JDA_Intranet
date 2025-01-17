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

export const sortData = (data: any) => {
  const priorites = [
    "Nouveau",
    "A rappeler",
    "Injoignable",
    "Ne répond pas",
    "Hors cible",
    "Ne plus appeler",
    "Faux numéro",
    "Vente OK",
  ]; // Ordre de priorité pour les villes
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
  "Vente OK",
];

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

         console.log('d?.attributes?.venduePar?.data',filtredMonthlyData.length,monthlyData.length)

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
