"use client";

import { useState, SetStateAction, Dispatch, useEffect } from "react";
import CustomModal from "../Modal/page";
import { defaultValues } from "@/app/utils";
import {
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { PDFDocument, rgb } from "pdf-lib";
import moment from "moment";

interface FormData {
  fileUrl: string;
  signerEmail: string;
  signerName: string;
}

const handleAddTextToSpecificPage = async ({dataForm,currentLm}:{dataForm:any,currentLm:string}) => {
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
    y: 270,
    font,
    size: textSize,
    color: rgb(0, 0, 0),
  });

  endPage.drawText(`${moment().format("DD/MM/YYYY")}`, {
    x: 240,
    y: 210,
    font,
    size: textSize,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();

  const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

  const response = await fetch(`/api/save-pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pdf: pdfBase64 }),
  })

  const data = await response.json();
  
  return data
};

export default function SendMissionLetterForm({
  data,
  openModal,
  setOpenModal,
  setValues,
}: {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setValues: Dispatch<SetStateAction<any>>;
  data: any;
}) {
  const [formData, setFormData] = useState<FormData>({
    fileUrl:
      "https://drive.google.com/file/d/1xNgg1kAfhZWbdJb-m8JD_1Y4taCKsATo/view?usp=drive_link",
    signerEmail: "",
    signerName: "",
  });
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [currentLm, setCurrentLm] = useState<string>("access");
  const [pdfSrc,setPdfSrc]=useState<string>();

    

  useEffect(() => {
    if (data)
      setFormData((prev) => ({
        ...prev,
        signerEmail: data.email,
        signerName: data.responsable,
      }));
  }, [data]);

  useEffect(() => {
    if (data.status) {
      handleAddTextToSpecificPage({dataForm:data,currentLm:currentLm}).then((res)=>{
          setPdfSrc(res.filePath)
      });
    }
  }, [data,currentLm]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    setStatusMessage("Envoi en cours...");

    try {
      // Appel à l'API Next.js pour envoyer la demande de signature à Yousign
      const response = await fetch("/api/sendToSign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage(
          `Document envoyé à signer, ID de la demande : ${data.requestId}`
        );
        await fetch('/api/delete-pdf', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: 'modified13062025120905.pdf' }),
        });
      } else {
        setStatusMessage("Erreur lors de l'envoi du document à signer.");
      }

      setValues(defaultValues);
    } catch (error) {
      console.error(error);
      setStatusMessage("Erreur lors de l'envoi du document à signer.");
    }
  };


  return (
    <CustomModal
      style={{ width: "700px", height: "fit-content" }}
      open={openModal}
      setOpen={setOpenModal}
    >
      <FormControl>
        <RadioGroup
          row
          aria-labelledby="demo-row-radio-buttons-group-label"
          name="controlled-radio-buttons-group"
          value={currentLm}
          onChange={(e) => setCurrentLm(e.target.value)}
        >
          <FormControlLabel
            sx={{ color: "#000" }}
            value="access"
            control={<Radio />}
            label="Access"
          />
          <FormControlLabel
            sx={{ color: "#000" }}
            value="premium"
            control={<Radio />}
            label="Premium"
          />
        </RadioGroup>
      </FormControl>

      <iframe
        src={`${pdfSrc}`} 
        width="100%"
        height="750px"
        style={{ border: "none" }}
      ></iframe>

      <Button sx={{ mt: "20px" }} variant="contained" onClick={handleSubmit}>
        Envoyer à signer
      </Button>

      <Typography variant="body2">{statusMessage}</Typography>
    </CustomModal>
  );
}
