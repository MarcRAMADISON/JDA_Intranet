"use client";

import * as React from "react";
import Paper from "@mui/material/Paper";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import Cookies from "js-cookie";
import CustomModal from "../Modal/page";
import AddFiche from "../AddFiche/page";
import moment from "moment";

export default function CustomTable({
  rows,
  setReload,
}: {
  rows: any;
  setReload: any;
}) {
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [currentRow, setCurrentRow] = React.useState<any>();
  const [openUpdateModal, setOpenUpdateModal] = React.useState<boolean>(false);

  const handleDelete = React.useCallback(
    (event: any) => {
      event.preventDefault();
      const token = Cookies.get("auth-token");

      fetch(`http://localhost:1337/api/fiches/` + currentRow?.id, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          Authorization: "Bearer " + token,
        },
      });

      setReload((prev) => !prev);
      setOpenModal(false);
    },
    [setReload, currentRow?.id]
  );

  const handleConfirm = React.useCallback((row) => {
    setOpenModal(true);
    setCurrentRow(row);
  }, []);


  return (
    <Box sx={{ height: "100%", width: "100%", mt: "50px", mb: "50px" }}>
      <CustomModal open={openModal} setOpen={setOpenModal}>
        <Typography>Voulez-vous vraiment supprimer cette fiche?</Typography>
        <Button variant="contained" sx={{ mt: "30px" }} onClick={handleDelete}>
          Confirmer
        </Button>
      </CustomModal>
      <AddFiche
        openModal={openUpdateModal}
        setOpenModal={setOpenUpdateModal}
        setReload={setReload}
        row={currentRow}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#1976d2" }}>
            <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Date création
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Responsable
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Etablissement
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Secteur d&apos;activité
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Localisation
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Téléphone standard
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Ligne direct
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Adresse e-mail
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  maxWidth: "60px",
                }}
              >
                Réseaux sociaux
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Nb étoile
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Nb followers
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Site web
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Statut
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rows || []).map((row, index) => {
              const statusStyle =
                row.statut === "Vente OK"
                  ? { backgroundColor: "green", color: "#fff" }
                  : row.statut === "Faux numéro" ||
                    row.statut === "Ne plus appeler"
                  ? { backgroundColor: "#ff3c33", color: "#fff" }
                  : { backgroundColor: "#1976d2", color: "#fff" };

              return (
                <TableRow
                  key={row.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                  }}
                >
                  <TableCell>{moment(row.createdAt).format('HH/mm/YYYY')}</TableCell>
                  <TableCell>{row.responsable}</TableCell>
                  <TableCell>{row.etablissement}</TableCell>
                  <TableCell>{row.secteurActivite}</TableCell>
                  <TableCell>{row.localisation}</TableCell>
                  <TableCell>{row.telephoneStandard}</TableCell>
                  <TableCell>{row.ligneDirecte}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell sx={{ maxWidth: "100px", overflow: "hidden" }}>
                    {row.reseauxSociaux}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {row.nbEtoile}
                  </TableCell>
                  <TableCell>{row.nbFollowers}</TableCell>
                  <TableCell>{row.siteWeb}</TableCell>
                  <TableCell sx={statusStyle}>{row.statut}</TableCell>
                  <TableCell sx={{ display: "flex"}}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setCurrentRow(row);
                        setOpenUpdateModal(true);
                      }}
                    >
                      <Edit />
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      sx={{ ml: "10px" }}
                      onClick={() => handleConfirm(row)}
                    >
                      <Delete />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
