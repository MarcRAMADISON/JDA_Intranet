"use client";

import * as React from "react";
import Paper from "@mui/material/Paper";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Delete, Edit, Share } from "@mui/icons-material";
import Cookies from "js-cookie";
import CustomModal from "../Modal/page";
import AddFiche from "../AddFiche/page";
import moment from "moment";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

export default function CustomTable({
  rows,
  setReload,
  userList,
  selectedRows,
  setSelectedRows,
  openAssign,
  setOpenAssign,
}: any) {
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [currentRow, setCurrentRow] = React.useState<any>({});
  const [openUpdateModal, setOpenUpdateModal] = React.useState<boolean>(false);
  const [selectedUser, setSelectedUser] = React.useState<number>(0);

  const handleDelete = React.useCallback(
    (event: any) => {
      event.preventDefault();
      const token = Cookies.get("auth-token");

      fetch(`${process.env.NEXT_PUBLIC_URL}/api/fiches/` + currentRow?.id, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          Authorization: "Bearer " + token,
        },
      });

      setReload((prev: any) => !prev);
      setOpenModal(false);
    },
    [setReload, currentRow?.id]
  );

  const handleConfirm = React.useCallback((row: any) => {
    setOpenModal(true);
    setCurrentRow(row);
  }, []);

  const handleChange = (e: any) => {
    e.preventDefault();
    setSelectedUser(e.target.value);
  };

  const handleAssign = React.useCallback(() => {
    const user = Cookies.get("user");

    if (selectedRows.length) {
      const token = Cookies.get("auth-token");

      Promise.all(
        selectedRows.map(async(row: any) => {
          if (
            (JSON.parse(user || "").id !== row?.userAssigne &&
              JSON.parse(user || "").id === row?.createdBy) ||
            JSON.parse(user || "").type === "ADMIN"
          ) {
            await fetch(`${process.env.NEXT_PUBLIC_URL}/api/fiches/${row?.id}`, {
              method: "PUT",
              headers: {
                "Content-type": "application/json; charset=UTF-8",
                accept: "application/json",
                Authorization: "bearer " + token,
              },
              body: JSON.stringify({
                data: {
                  userAssigne: selectedUser,
                },
              }),
            });
          }
        })
      ).then(() => {
        setReload((prev: any) => !prev);
        setOpenAssign(false);
      });
    } else if (currentRow && selectedUser) {
      const token = Cookies.get("auth-token");

      fetch(`${process.env.NEXT_PUBLIC_URL}/api/fiches/${currentRow.id}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          accept: "application/json",
          Authorization: "bearer " + token,
        },
        body: JSON.stringify({
          data: {
            userAssigne: selectedUser,
          },
        }),
      });

      setReload((prev: any) => !prev);
      setOpenAssign(false);
    }
  }, [currentRow, selectedUser, setReload, setOpenAssign, selectedRows]);

  return (
    <Box sx={{ height: "100%", width: "100%", mt: "50px", mb: "50px" }}>
      <CustomModal open={openModal} setOpen={setOpenModal}>
        <Typography>Voulez-vous vraiment supprimer cette fiche?</Typography>
        <Button
          variant="contained"
          color="error"
          sx={{ mt: "30px" }}
          onClick={handleDelete}
        >
          Confirmer
        </Button>
      </CustomModal>
      <CustomModal open={openAssign} setOpen={setOpenAssign}>
        <Typography variant="body1" sx={{ textAlign: "center", mb: "30px" }}>
          Assigner la fiche à une autre personne de votre groupe
        </Typography>
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label"></FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="female"
            name="radio-buttons-group"
            sx={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)" }}
            onChange={handleChange}
            value={selectedUser}
          >
            {(userList || []).map((user: any, index: number) => {
              return (
                <FormControlLabel
                  value={user.id}
                  control={<Radio />}
                  label={user.username}
                  key={index}
                />
              );
            })}
          </RadioGroup>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: "30px" }}
          onClick={() => handleAssign()}
        >
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
              <TableCell onClick={() => {}}>
                <Checkbox
                  {...label}
                  checked={rows.length === selectedRows.length || false}
                  sx={{
                    "&.Mui-checked": {
                      color: "white",
                    },
                  }}
                  onClick={() => {
                    setSelectedRows((prev: any) => {
                      if (prev.length && prev.length === rows.length) {
                        return [];
                      }
                      return rows.map((r: any) => ({
                        id: r.id,
                        userAssigne: r?.userAssigne?.data?.id,
                        createdBy: r?.user?.data?.id,
                      }));
                    });
                  }}
                />
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Date création
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Créé par
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Vendue par
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Assignée à
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Responsable
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Etablissement
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Secteur d&apos;activité
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Localisation
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Téléphone standard
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Ligne direct
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Adresse e-mail
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Réseaux sociaux
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Nb étoile
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Nb followers
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Site web
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Siren
              </TableCell>
              <TableCell
                style={{
                  fontSize: "0.9rem",
                  color: "#fff",
                  fontWeight: "bold",
                  minWidth: "150px",
                }}
              >
                Statut
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rows || []).map((row: any, index: number) => {
              const statusStyle =
                row.statut === "Vente OK"
                  ? { backgroundColor: "green", color: "#fff" }
                  : row.statut === "Faux numéro" ||
                    row.statut === "Ne plus appeler"
                  ? { backgroundColor: "#ff3c33", color: "#fff" }
                  : { backgroundColor: "#1976d2", color: "#fff" };

              const user = Cookies.get("user");
              const type = JSON.parse(user || "").type;

              return (
                <TableRow
                  key={row.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff",
                    cursor: "pointer",
                    zIndex: 9,
                    width: "90%",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                  }}
                >
                  <TableCell>
                    <Checkbox
                      {...label}
                      checked={
                        selectedRows.find((r: any) => r.id === row.id) || false
                      }
                      onChange={() => {
                        setCurrentRow(row);
                        setSelectedRows((prev: any) => {
                          const alreadyExists = prev.find(
                            (p: any) => p.id === row?.id
                          );

                          const result = prev.filter(
                            (p: any) => p.id !== row.id
                          );
                          if (!alreadyExists)
                            result.push({
                              id: row.id,
                              userAssigne: row?.userAssigne?.data?.id,
                              createdBy: row?.user?.data?.id,
                            });
                          return result;
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                  >
                    {moment(row.createdAt).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                  >
                    {row.user.data.attributes.username}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                  >
                    {row?.venduePar?.data?.attributes?.username || ""}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                  >
                    {row?.userAssigne?.data?.attributes?.username || ""}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                  >
                    {row.responsable}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                  >
                    {row.etablissement}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                  >
                    {row.secteurActivite}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                  >
                    {row.localisation}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                  >
                    {row.telephoneStandard}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                  >
                    {row.ligneDirecte}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                  >
                    {row.email}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                    sx={{ maxWidth: "100px", overflow: "hidden" }}
                  >
                    {row.reseauxSociaux}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                    sx={{ textAlign: "center" }}
                  >
                    {row.nbEtoile}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                  >
                    {row.nbFollowers}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                  >
                    {row.siteWeb}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                    sx={{
                      cursor: "pointer",
                      minWidth: "100px",
                    }}
                  >
                    {row.siren}
                  </TableCell>
                  <TableCell
                    onClick={() => {
                      setCurrentRow(row);
                      setOpenUpdateModal(true);
                    }}
                    sx={{
                      ...statusStyle,
                      cursor: "pointer",
                      minWidth: "100px",
                    }}
                  >
                    {row.statut}
                  </TableCell>
                  <TableCell sx={{ display: "flex", zIndex: 99 }}>
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
                    {(!row?.userAssigne?.data ||
                      JSON.parse(user || "").id === row?.user?.data?.id ||
                      JSON.parse(user || "").id !==
                        row?.userAssigne?.data?.id) && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ ml: "10px" }}
                        onClick={() => {
                          setCurrentRow(row);
                          setOpenAssign(true);
                        }}
                      >
                        <Share />
                      </Button>
                    )}
                    {type === "ADMIN" && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        sx={{ ml: "10px" }}
                        onClick={() => handleConfirm(row)}
                      >
                        <Delete />
                      </Button>
                    )}
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
