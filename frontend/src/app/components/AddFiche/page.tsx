"use client";

import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CustomModal from "../Modal/page";
import { useCallback, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { Check } from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";

import "dayjs/locale/fr";
import SendMissionLetterForm from "../sendMissionLetterForm/page";
import { defaultValues, handleAddTextToSpecificPage } from "@/app/utils";

interface ficheFormType {
  id?: number;
  responsable: string;
  localisation: string;
  secteurActivite: string;
  etablissement: string;
  email: string;
  ligneDirecte: string;
  statut: string;
  telephoneStandard: string;
  nbEtoile: number;
  reseauxSociaux: string;
  nbFollowers: string;
  siteWeb: string;
  siren: string;
  comment: string;
  siret: string;
  statutJuridique: string;
  codePostal: string;
  ville:string;
}



/*interface AddFicheProps {
  row?: ficheFormType;
  setReload: (value: boolean | ((prev: boolean) => boolean)) => void;
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
}*/

function AddFiche({ setReload, openModal, setOpenModal, row }: any) {
  const [values, setValues] = useState<ficheFormType>(defaultValues);
  const [showMessage, setShowMessage] = useState<
    "HIDE" | "ERROR" | "SUCCESS" | "ALREADY_EXISTS"
  >("HIDE");
  const [userType, setUserType] = useState<"ADMIN" | "AGENT">("AGENT");
  const [date, setDate] = useState<Dayjs | null>(null);
  const [openModalSendLM, setOpenModalSendLM] = useState<boolean>(false);
  const [pdfSrc,setPdfSrc]=useState<string>();
  const [currentLm, setCurrentLm] = useState<string>("access");



  useEffect(() => {
    const user = Cookies.get("user");

    if (JSON.parse(user || "")?.type === "ADMIN") {
      setUserType("ADMIN");
    }

    if (row) {
      setValues({
        responsable: row?.responsable || "",
        localisation: row?.localisation || "",
        secteurActivite: row?.secteurActivite || "",
        etablissement: row?.etablissement || "",
        email: row?.email || "",
        ligneDirecte: row?.ligneDirecte || "",
        statut: row?.statut || "",
        telephoneStandard: row?.telephoneStandard || "",
        nbEtoile: row?.nbEtoile || 0,
        reseauxSociaux: row?.reseauxSociaux || "",
        nbFollowers: row?.nbFollowers || "0",
        siteWeb: row?.siteWeb || "",
        siren: row?.siren || "",
        comment: row?.comment || "",
        siret: row?.siret || "",
        statutJuridique: row?.statutJuridique || "",
        codePostal: row?.codePostal || "",
        ville: row?.ville || ''
      });

      dayjs.extend(customParseFormat);

      setDate(
        row?.dateHeureRappel
          ? dayjs(row?.dateHeureRappel, "DD/MM/YYYY HH:mm")
          : null
      );

      setShowMessage("HIDE");
    }

    dayjs.locale("fr");
  }, [row, setValues]);

  const handleChange = useCallback((event: any) => {
    setValues((prev) => ({
      ...prev,
      [event?.target.name]: event?.target.value,
    }));
  }, []);

  const handleSave = (event: any) => {
    event.preventDefault();

    handleAddTextToSpecificPage({dataForm:data,currentLm:currentLm}).then((res:any)=>{
      setPdfSrc(res.filePath)
    });

    if (
      values.etablissement &&
      values.secteurActivite &&
      (values.telephoneStandard || values.ligneDirecte)
    ) {
      const token = Cookies.get("auth-token");
      const user = Cookies.get("user");
      const idUser = JSON.parse(user || "").id;

      if (JSON.parse(user || "")?.type === "ADMIN") {
        setUserType("ADMIN");
      }

      if (row) {
        fetch(`${process.env.NEXT_PUBLIC_URL}/api/fiches/${row.id}`, {
          method: "PUT",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            accept: "application/json",
            Authorization: "bearer " + token,
          },
          body: JSON.stringify({
            data: {
              responsable: values.responsable,
              localisation: values.localisation,
              secteurActivite: values.secteurActivite,
              etablissement: values.etablissement,
              email: values.email,
              ligneDirecte: values.ligneDirecte,
              statut: values.statut,
              telephoneStandard: values.telephoneStandard,
              nbEtoile: values.nbEtoile,
              reseauxSociaux: values.reseauxSociaux,
              nbFollowers: values.nbFollowers,
              siteWeb: values.siteWeb,
              siren: values.siren,
              siret: values.siret,
              venduePar: values.statut === "Vente OK" ? idUser : null,
              comment: values.comment,
              dateHeureRappel:
                date && dayjs(date).isValid()
                  ? date.format("DD/MM/YYYY HH:mm")
                  : null,
              statutJuridique: values.statutJuridique,
              codePostal: values.codePostal,
              ville: values.ville
            },
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.data) {
              setShowMessage("SUCCESS");
              setReload((prev: any) => !prev);
              setOpenModal(false);
              if (values?.statut === "A signer") {
                setOpenModalSendLM(true);
              }
              //setValues(defaultValues);
            } else {
              setShowMessage("ERROR");
            }
          })
          .catch(() => setShowMessage("ERROR"));

        return;
      }

      fetch(`${process.env.NEXT_PUBLIC_FRONT_API_URL}/api/createFiche`, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: "bearer " + token,
        },
        body: JSON.stringify({
          user: idUser,
          venduePar: values.statut === "Vente OK" ? idUser : null,
          dateHeureRappel: date ? date.format("DD/MM/YYYY HH:mm") : "",
          ...values,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.type === "ALREADY_EXISTS") {
            setShowMessage("ALREADY_EXISTS");
          } else if (res.status === "500") {
            setShowMessage("ERROR");
          } else {
            setShowMessage("SUCCESS");
            setReload((prev: any) => !prev);
            if (values?.statut === "A signer") {
              setOpenModalSendLM(true);
            }
            //setValues(defaultValues);
          }
        });
       
       

    }

    
  };

  const validateEmail = useCallback((email: string) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return pattern.test(email);
  }, []);

  const data: ficheFormType = useMemo(() => {
    let intermediateData: ficheFormType = defaultValues;

    const keys = Object.keys(row || {});

    if (keys.length) {
      keys.map((key: string) => {
        if (values && (values as any)[key]) {
          intermediateData = {
            ...intermediateData,
            [key]: (values as any)[key],
          };
        }
      });
    } else if (
      values.etablissement &&
      values.secteurActivite &&
      (values.telephoneStandard || values.ligneDirecte)
    ) {
      intermediateData = values;
    }

    return intermediateData;
  }, [row, values]);

  const checkValidity= !values.etablissement ||
  !values.secteurActivite ||
  !values.statut ||
  !values.codePostal ||
  !values.email || 
  !values.localisation ||
  !values.responsable ||
  (!values.telephoneStandard && !values.ligneDirecte)

  return (
    <>
      <SendMissionLetterForm
        data={data}
        openModal={openModalSendLM}
        setOpenModal={setOpenModalSendLM}
        setValues={setValues}
        pdfSrc={pdfSrc}
        currentLm={currentLm}
        setCurrentLm={setCurrentLm}
        setPdfSrc={setPdfSrc}
      />
      <CustomModal
        style={{ width: "920px", height: "fit-content" }}
        open={openModal}
        setOpen={setOpenModal}
      >
        <Typography
          sx={{ mb: "50px" }}
          id="modal-modal-title"
          variant="h4"
          component="h1"
          color="primary"
        >
          {row ? "Modifier fiche" : "Nouvelle fiche"}
        </Typography>
        {showMessage === "SUCCESS" ? (
          <Alert severity="success" sx={{ mb: "20px" }}>
            Fiche enregistrée
          </Alert>
        ) : showMessage === "ERROR" ? (
          <Alert severity="error" sx={{ mb: "20px" }}>
            Problème lors de l&apos;enregistrement du fiche
          </Alert>
        ) : showMessage === "ALREADY_EXISTS" ? (
          <Alert severity="error" sx={{ mb: "20px" }}>
            La fiche existe déjà dans la base de donnée
          </Alert>
        ) : (
          <></>
        )}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "30px",
            width: "100%",
          }}
        >
          <TextField
            value={values.responsable}
            name="responsable"
            sx={{ width: "90%", mb: "10px" }}
            id="filled-basic"
            label="Responsable *"
            variant="standard"
            onChange={handleChange}
          />
          <TextField
            value={values.etablissement}
            name="etablissement"
            sx={{ width: "90%", mb: "10px" }}
            id="filled-basic"
            label="Nom de l'établissement *"
            variant="standard"
            onChange={handleChange}
          />
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">
              Sécteur d&apos;activité *
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={values.secteurActivite}
              name="secteurActivite"
              label="Secteur d'activité *"
              onChange={handleChange}
              sx={{ width: "90%", mb: "10px" }}
            >
              <MenuItem value="Restaurant">Restaurant</MenuItem>
              <MenuItem value="Hotel">Hotel</MenuItem>
              <MenuItem value="Salon de coiffure">Salon de coiffure</MenuItem>
              <MenuItem value="Institue de bien être">
                Institue de bien être
              </MenuItem>
              <MenuItem value="Autre">Autre</MenuItem>={" "}
            </Select>
          </FormControl>
          <TextField
            value={values.localisation}
            name="localisation"
            sx={{ width: "90%", mb: "10px" }}
            id="filled-basic"
            label="Localisation ( Siège social ) *"
            variant="standard"
            onChange={handleChange}
          />
          <TextField
            value={values.ville}
            name="ville"
            sx={{ width: "90%", mb: "10px" }}
            id="filled-basic"
            label="Ville *"
            variant="standard"
            onChange={handleChange}
          />
          <TextField
            value={values.codePostal}
            name="codePostal"
            sx={{ width: "90%", mb: "10px" }}
            id="filled-basic"
            label="Code postal *"
            variant="standard"
            onChange={handleChange}
          />
          <TextField
            value={values.telephoneStandard}
            name="telephoneStandard"
            sx={{ width: "90%", mb: "10px" }}
            id="filled-basic"
            label="Numero téléphone *"
            variant="standard"
            onChange={handleChange}
          />
          <TextField
            value={values.ligneDirecte}
            name="ligneDirecte"
            sx={{ width: "90%", mb: "10px" }}
            id="filled-basic"
            label="Ligne directe *"
            variant="standard"
            onChange={handleChange}
          />
          <TextField
            value={values.email}
            name="email"
            sx={{ width: "90%", mb: "10px" }}
            id="filled-basic"
            label="Adresse e-mail *"
            variant="standard"
            onChange={handleChange}
            color={
              values.email && !validateEmail(values.email) ? "error" : undefined
            }
          />
          <TextField
            value={values.reseauxSociaux}
            name="reseauxSociaux"
            sx={{ width: "90%", mb: "10px" }}
            id="filled-basic"
            label="Réseaux sociaux"
            variant="standard"
            onChange={handleChange}
          />
          <TextField
            value={values.nbEtoile}
            name="nbEtoile"
            sx={{ width: "90%", mb: "10px" }}
            id="filled-basic"
            label="Nombre d'étoile"
            variant="standard"
            onChange={handleChange}
            type="number"
          />
          <TextField
            value={values.nbFollowers}
            name="nbFollowers"
            sx={{ width: "90%", mb: "10px" }}
            id="filled-basic"
            label="Nombre de followers"
            variant="standard"
            onChange={handleChange}
          />
          <TextField
            value={values.siteWeb}
            name="siteWeb"
            sx={{ width: "90%", mb: "10px" }}
            id="filled-basic"
            label="Site web"
            variant="standard"
            onChange={handleChange}
          />
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Statut *</InputLabel>
            {userType === "ADMIN" ? (
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={values.statut}
                name="statut"
                label="Type d'établissement"
                onChange={handleChange}
                sx={{ width: "90%", mb: "10px" }}
              >
                <MenuItem value="Nouveau">Nouveau</MenuItem>
                <MenuItem value="Injoignable">Injoignable</MenuItem>
                <MenuItem value="Ne répond pas">Ne répond pas</MenuItem>
                <MenuItem value="A rappeler">A rappeler</MenuItem>
                <MenuItem value="Ne plus appeler">Ne plus appeler</MenuItem>
                <MenuItem value="Hors cible">Hors cible</MenuItem>
                <MenuItem value="Faux numéro">Faux numéro</MenuItem>
                <MenuItem value="A signer">A signer</MenuItem>
                <MenuItem value="Vente OK">Vente OK</MenuItem>
              </Select>
            ) : (
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={values.statut}
                name="statut"
                label="Type d'établissement"
                onChange={handleChange}
                sx={{ width: "90%", mb: "10px" }}
              >
                <MenuItem value="A rappeler">A rappeler</MenuItem>
                <MenuItem value="A signer">A signer</MenuItem>
              </Select>
            )}
          </FormControl>
          {values.statut === "Vente OK" && (
            <TextField
              value={values.siren}
              name="siren"
              sx={{ width: "90%", mb: "10px" }}
              id="filled-basic"
              label="Siren *"
              variant="standard"
              onChange={handleChange}
            />
          )}
          {values.statut === "A rappeler" && (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
              <DateTimePicker
                label="Date et Heure de rappel"
                value={date}
                onChange={(newValue) => setDate(newValue)}
              />
            </LocalizationProvider>
          )}
          {values.statut === "A signer" && (
            <>
              <TextField
                value={values.siren}
                name="siren"
                sx={{ width: "90%", mb: "10px" }}
                id="filled-basic"
                label="Siren *"
                variant="standard"
                onChange={handleChange}
              />
              <TextField
                value={values.siret}
                name="siret"
                sx={{ width: "90%", mb: "10px" }}
                id="filled-basic"
                label="Siret *"
                variant="standard"
                onChange={handleChange}
              />
              <TextField
                value={values.statutJuridique}
                name="statutJuridique"
                sx={{ width: "90%", mb: "10px" }}
                id="filled-basic"
                label="Statut juridique *"
                variant="standard"
                onChange={handleChange}
              />
            </>
          )}
          <TextField
            id="outlined-multiline-static"
            label="Commentaire"
            name="comment"
            multiline
            rows={4}
            value={values.comment}
            onChange={handleChange}
          />
        </Box>

        <Button
          sx={{ mt: "50px" }}
          startIcon={<Check />}
          variant="contained"
          onClick={handleSave}
          disabled={checkValidity}
        >
          Enregistrer
        </Button>
      </CustomModal>
    </>
  );
}

export default AddFiche;
