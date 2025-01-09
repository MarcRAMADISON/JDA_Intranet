"use client";

import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import Cookies from "js-cookie";
import { extractValue } from "../utils";

const ExcelFileUploader = () => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState<{ fiche: number; doublon: number }>({
    fiche: 0,
    doublon: 0,
  });
  const [disabled,setDisabled]=useState<boolean>(false)

  // Fonction pour gérer l'importation du fichier
  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      // Lecture du fichier comme ArrayBuffer
      reader.onload = (e: any) => {
        const binaryStr = e.target.result;

        // Conversion en objet workbook
        const workbook = XLSX.read(binaryStr, { type: "binary" });

        // Sélectionner la première feuille
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convertir la feuille en JSON
        const jsonData: any = XLSX.utils.sheet_to_json(sheet);
        setData(jsonData); // Stocker les données dans l'état
      };

      reader.readAsBinaryString(file);
    }
  };

  const handleImport = () => {
    if (data.length) {
      const token = Cookies.get("auth-token");
      const user = Cookies.get("user");
      const idUser = JSON.parse(user || "").id;

      setDisabled(true)

      data.map((d) => {
        fetch(`${process.env.NEXT_PUBLIC_FRONT_API_URL}/api/createFiche`, {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            accept: "application/json",
            Authorization: "bearer " + token,
          },
          body: JSON.stringify({
            user: idUser,
            responsable: extractValue(d, "responsable")
              ? extractValue(d, "responsable")
              : "",
            localisation: extractValue(d, "localisation")
              ? extractValue(d, "localisation")
              : "",
            secteurActivite: extractValue(d, "secteur")
              ? extractValue(d, "secteur")
              : "",
            etablissement: extractValue(d, "etablissement")
              ? extractValue(d, "etablissement")
              : "",
            email: extractValue(d, "email") ? extractValue(d, "email") : "",
            ligneDirecte: extractValue(d, "directe")
              ? extractValue(d, "directe").toString()
              : "",
            statut: extractValue(d, "statut") ? extractValue(d, "statut") : "Nouveau",
            telephoneStandard: extractValue(d, "standard")
              ? extractValue(d, "standard").toString()
              : "",
            nbEtoile: extractValue(d, "étoile") ? extractValue(d, "étoile") : 0,
            reseauxSociaux: extractValue(d, "sociaux")
              ? extractValue(d, "sociaux").toString()
              : "",
            nbFollowers: extractValue(d, "follower")
              ? extractValue(d, "follower").toString()
              : "0",
            siteWeb: extractValue(d, "site") ? extractValue(d, "site") : "",
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.type === "ALREADY_EXISTS") {
              setCount((prev) => {
                return{ ...prev, doublon: prev.doublon + 1 }
              });
              
            } else {
              setCount((prev) => {
                return { ...prev, fiche: prev.fiche + 1 }
              });
            }
            
          });
      })

    }
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography sx={{ mb: "20px" }} variant="h5">
        Importer un fichier Excel
      </Typography>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {data.length > 0 && (
        <>
          <Button
            sx={{ margin: "30px 0px" }}
            variant="contained"
            onClick={handleImport}
            disabled={disabled}
          >
            Importer dans la base de donnée
          </Button>
          <Typography variant='body2' color='text.secondary'>{count.fiche} fiches enregistrées</Typography>
          <Typography variant='body2' color='text.secondary'>{count.doublon} doublons détéctés</Typography>
        </>
      )}
    </Box>
  );
};

export default ExcelFileUploader;
