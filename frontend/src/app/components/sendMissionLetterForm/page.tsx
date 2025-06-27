"use client";
/* eslint-disable */

import { useState, SetStateAction, Dispatch, useEffect } from "react";
import CustomModal from "../Modal/page";
import { defaultValues, deleteFile, handleAddTextToSpecificPage } from "@/app/utils";
import {
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import Swal from "sweetalert2";

interface FormData {
  fileName: string;
  signerEmail: string;
  signerName: string;
  currentLm: string;
}

interface sendMissionLetterFormProps {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setValues: Dispatch<any>;
  data: any;
  pdfSrc?: string;
  setPdfSrc: any;
  currentLm: string;
  setCurrentLm: any;
};

export default function SendMissionLetterForm({
  data,
  openModal,
  setOpenModal,
  setValues,
  pdfSrc,
  setPdfSrc,
  currentLm,
  setCurrentLm,
}: any) {
  const [formData, setFormData] = useState<FormData>({
    fileName: "",
    signerEmail: "",
    signerName: "",
    currentLm: "",
  });
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [loading,setLoading]=useState<boolean>(false);

  useEffect(() => {
    if (data && pdfSrc && currentLm) {
      const normalizedPath = pdfSrc.replace(/\\/g, "/");
      const fileName = normalizedPath?.split("/").pop();

      setFormData((prev) => ({
        ...prev,
        fileName: fileName || "",
        signerEmail: data.email,
        signerName: `${data.responsable} - ${currentLm}`,
        currentLm: currentLm.toUpperCase(),
      }));
    }
  }, [data, pdfSrc, currentLm]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setLoading(true)

    setStatusMessage("Envoi en cours...");

    try {
      // Appel à l'API Next.js pour envoyer la demande de signature à Yousign
      const response = await fetch(`${process.env.NEXT_PUBLIC_FRONT_API_URL}/api/sendToSign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Document envoyé à signer",
          text: `Document envoyé à signer, ID de la demande : ${data.id}`,
          icon: "success"
        });
        setFormData({
          fileName: "",
          signerEmail: "",
          signerName: "",
          currentLm: "",
        })
        setOpenModal(false)

        setStatusMessage(
          `Document envoyé à signer, ID de la demande : ${data.id}`
        );
        deleteFile(pdfSrc)
      } else {
        Swal.fire({
          title: "Document non envoyé",
          text: "Erreur lors de l'envoi du document à signer.",
          icon: "error"
        });
        setOpenModal(false)
        setStatusMessage("Erreur lors de l'envoi du document à signer.");
      }

      setCurrentLm('access')
      setLoading(false)

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
          onChange={(e) => {
                deleteFile(pdfSrc)
                handleAddTextToSpecificPage({
                  dataForm: data,
                  currentLm: e.target.value,
                }).then((res: any) => {
                  setPdfSrc(res.filePath);
                });
                setCurrentLm(e.target.value);
             
          }}
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

      <Button sx={{ mt: "20px" }} disabled={loading} variant="contained" onClick={handleSubmit}>
        Envoyer à signer
      </Button>

      <Typography variant="body2">{statusMessage}</Typography>
    </CustomModal>
  );
}
