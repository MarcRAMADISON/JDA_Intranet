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
import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Check } from "@mui/icons-material";

interface ficheFormType {
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
  nbFollowers: number;
  siteWeb: string;
}

const defaultValues = {
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
  nbFollowers: 0,
  siteWeb: "",
};

function AddFiche({
  setReload,
  openModal,
  setOpenModal,
  row,
}: {
  setReload: any;
  openModal: boolean;
  setOpenModal: any;
  row?: any;
}) {
  const [values, setValues] = useState<ficheFormType>(defaultValues);
  const [showMessage, setShowMessage] = useState<"HIDE" | "ERROR" | "SUCCESS">(
    "HIDE"
  );

  useEffect(() => {
    if (row) {
      setValues({
        ...row,
      });
    }
  }, [row]);

  const handleChange = useCallback((event: any) => {
    setValues((prev) => ({
      ...prev,
      [event?.target.name]: event?.target.value,
    }));
  }, []);

  const handleSave = (event: any) => {
    event.preventDefault();

    if (
      values.etablissement &&
      values.secteurActivite &&
      (values.telephoneStandard || values.ligneDirecte)
    ) {
      const token = Cookies.get("auth-token");

      if (row) {
        fetch(`http://localhost:1337/api/fiches/${row.id}`, {
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
            },
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.data) {
              setValues(defaultValues);
              setShowMessage("SUCCESS");
              setReload((prev) => !prev);
              setOpenModal(false)
            } else {
              setShowMessage("ERROR");
            }
          })
          .catch(() => setShowMessage("ERROR"));

        return;
      }

      fetch("http://localhost:1337/api/fiches", {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          accept: "application/json",
          Authorization: "bearer " + token,
        },
        body: JSON.stringify({
          data: {
            ...values,
          },
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.data) {
            setValues(defaultValues);
            setShowMessage("SUCCESS");
            setReload((prev) => !prev);
          } else {
            setShowMessage("ERROR");
          }
        })
        .catch(() => setShowMessage("ERROR"));
    }
  };

  return (
    <CustomModal
      style={{ width: "600px", height: "fit-content" }}
      open={openModal}
      setOpen={setOpenModal}
    >
      <Typography
        sx={{ mb: "30px" }}
        id="modal-modal-title"
        variant="h4"
        component="h1"
        color="primary"
      >
        {row? "Modifier fiche" : "Nouvelle fiche"}
      </Typography>
      {showMessage === "SUCCESS" ? (
        <Alert severity="success" sx={{mb:'20px'}}>Fiche enregistrée</Alert>
      ) : showMessage === "ERROR" ? (
        <Alert severity="error" sx={{mb:'20px'}}>
          Problème lors de l&apos;enregistrement du fiche
        </Alert>
      ) : (
        <></>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: "30px",
          width: "100%",
        }}
      >
        <TextField
          value={values.responsable}
          name="responsable"
          sx={{ width: "90%", mb: "10px" }}
          id="filled-basic"
          label="Responsable"
          variant="standard"
          onChange={handleChange}
        />
        <TextField
          value={values.etablissement}
          name="etablissement"
          sx={{ width: "90%", mb: "10px" }}
          id="filled-basic"
          label="Nom de l'établissement"
          variant="standard"
          onChange={handleChange}
        />
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">
            Sécteur d&apos;activité
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={values.secteurActivite}
            name="secteurActivite"
            label="Secteur d'activité"
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
          label="Localisation"
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
          label="Adresse e-mail"
          variant="standard"
          onChange={handleChange}
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
          type="number"
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
          <InputLabel id="demo-simple-select-label">Statut</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={values.statut}
            name="statut"
            label="Type d'établissement"
            onChange={handleChange}
            sx={{ width: "90%", mb: "10px" }}
          >
            <MenuItem value="Injoignable">Injoignable</MenuItem>
            <MenuItem value="Ne répond pas">Ne répond pas</MenuItem>
            <MenuItem value="A rappeler">A rappeler</MenuItem>
            <MenuItem value="Ne plus appeler">Ne plus appeler</MenuItem>
            <MenuItem value="Hors cible">Hors cible</MenuItem>
            <MenuItem value="Faux numéro">Faux numéro</MenuItem>
            <MenuItem value="Vente OK">Vente OK</MenuItem>={" "}
          </Select>
        </FormControl>
      </Box>

      <Button
        sx={{ mt: "30px" }}
        startIcon={<Check />}
        variant="contained"
        onClick={handleSave}
        disabled={
          !values.etablissement ||
          !values.secteurActivite ||
          !values.statut ||
          (!values.telephoneStandard && !values.ligneDirecte)
        }
      >
        Enregistrer
      </Button>
    </CustomModal>
  );
}

export default AddFiche;
