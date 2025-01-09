"use client";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Typography,
} from "@mui/material";
import MenuBar from "../components/MenuBar/page";
import CustomTable from "../components/Table/page";
import { useCallback, useEffect, useState } from "react";
import AddFiche from "../components/AddFiche/page";
import { getData, getUsers, handleExport, sortData } from "../utils";
import { Delete, Download, Edit, Share } from "@mui/icons-material";
import Cookies from "js-cookie";
import CustomModal from "../components/Modal/page";

interface filterObject {
  statut: string;
  userId: number;
  multiSelectStatut?: string;
  multiSelectUserId?: number;
}

interface selectedRowObject {
  id: string;
  userAssign: string;
  createdBy: string;
}

interface loadinObject {
  assign: boolean;
  delete: boolean;
  change: boolean;
}

const defaultFilter = {
  statut: "",
  userId: 0,
  multiSelectUserId: 0,
  multiSelectStatut: "Nouveau",
};

function Home() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [rows, setRows] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [userType, setUserType] = useState<"ADMIN" | "AGENT">("AGENT");
  const [userList, setUserList] =
    useState<{ id: number; username: string; type: string }[]>();
  const [filters, setFilters] = useState<filterObject>(defaultFilter);
  const [selectedRows, setSelectedRows] = useState<selectedRowObject[]>([]);
  const [openAssign, setOpenAssign] = useState<boolean>(false);
  const [openChangeMultiple, setOpenChangeMultiple] = useState<boolean>(false);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const [loading, setLoading] = useState<loadinObject>({
    assign: false,
    delete: false,
    change: false,
  });

  useEffect(() => {
    getData({ start: 20 * (currentPage - 1), limit: 20 })
      .then((res) => res.json())
      .then((res) => {
        const data = (res?.data || []).map((d: any) => ({
          id: d.id,
          ...d.attributes,
          total: res?.meta?.pagination?.total || 0,
        }));
        setRows(sortData(data));
      });

    const user = Cookies.get("user");
    const dataUser = user && JSON.parse(user);

    if (dataUser?.type === "ADMIN") {
      setUserType("ADMIN");
    }

    getUsers()
      .then((res) => res.json())
      .then((res) => {
        setUserList(res.filter((r: any) => r.id !== dataUser?.id));
      });
  }, [reload, currentPage]);

  const handleOpenModal = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleChangeFilter = useCallback(
    (event: any) => {
      event.preventDefault();

      setFilters((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
      }));

      if (event.target.value === "TOUT") {
        getData({ start: 0, limit: 20 })
          .then((res) => res.json())
          .then((res) => {
            const data = (res?.data || []).map((d: any) => ({
              id: d.id,
              ...d.attributes,
              total: res?.meta?.pagination?.total || 0,
            }));
            setRows(sortData(data));
          });
      } else {
        getData({
          filters: { ...filters, [event.target.name]: event.target.value },
        })
          .then((res) => res.json())
          .then((res) => {
            const data = (res?.data || []).map((d: any) => ({
              id: d.id,
              ...d.attributes,
              total: res?.meta?.pagination?.total || 0,
            }));
            setRows(sortData(data));
          });
      }
    },
    [filters]
  );

  const handleChangePagination = useCallback(
    (event: any, page: number) => {
      event.preventDefault();
      getData({ filters, start: 20 * (page - 1), limit: 20 })
        .then((res) => res.json())
        .then((res) => {
          const data = (res?.data || []).map((d: any) => ({
            id: d.id,
            ...d.attributes,
            total: res?.meta?.pagination?.total || 0,
          }));
          setRows(sortData(data));
          setCurrentPage(page);
        });
    },
    [filters]
  );

  const handleExportAction = useCallback(
    (event: any) => {
      event.preventDefault();
      if (filters.statut) {
        getData({ filters, isAll: true })
          .then((res) => res.json())
          .then((res) => {
            const newData = (res.data || []).map((d: any) => ({
              Responsable: d.attributes.responsable,
              Localisation: d.attributes.localisation,
              "Secteur activite": d.attributes.secteurActivite,
              Etablissement: d.attributes.etablissement,
              Email: d.attributes.email,
              "Ligne directe": d.attributes.ligneDirecte,
              "Telephone standard": d.attributes.telephoneStandard,
              Statut: d.attributes.statut,
              nbEtoile: d.attributes.nbEtoile,
              "reseaux sociaux": d.attributes.reseauxSociaux,
              nbFollowers: d.attributes.nbFollowers,
              "Site web": d.attributes.siteWeb,
            }));
            handleExport(sortData(newData));
          });
      } else {
        getData({ isAll: true })
          .then((res) => res.json())
          .then((res) => {
            const newData = (res.data || []).map((d: any) => ({
              Responsable: d.attributes.responsable,
              Localisation: d.attributes.localisation,
              "Secteur activite": d.attributes.secteurActivite,
              Etablissement: d.attributes.etablissement,
              Email: d.attributes.email,
              "Ligne directe": d.attributes.ligneDirecte,
              "Telephone standard": d.attributes.telephoneStandard,
              Statut: d.attributes.statut,
              nbEtoile: d.attributes.nbEtoile,
              "reseaux sociaux": d.attributes.reseauxSociaux,
              nbFollowers: d.attributes.nbFollowers,
              "Site web": d.attributes.siteWeb,
            }));
            handleExport(sortData(newData));
          });
      }
    },
    [filters]
  );

  const handleChangeStatutMultiRows = useCallback(() => {

    setLoading((prev)=>({...prev,change:true}))

    if (selectedRows.length && filters.multiSelectStatut) {
      const token = Cookies.get("auth-token");

      Promise.all(
        selectedRows.map(async (row) => {
          await fetch(`${process.env.NEXT_PUBLIC_URL}/api/fiches/${row.id}`, {
            method: "PUT",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
              accept: "application/json",
              Authorization: "bearer " + token,
            },
            body: JSON.stringify({
              data: {
                statut: filters.multiSelectStatut,
              },
            }),
          });
        })
      ).then(() => {
        setSelectedRows([]);
        setOpenChangeMultiple(false);
        setReload((prev) => !prev);
        setLoading((prev)=>({...prev,change:false}))

      });
    }

  }, [filters.multiSelectStatut, selectedRows,setLoading]);

  const handleDelete = useCallback(
    (event: any) => {
      event.preventDefault();
      setLoading((prev)=>({...prev,delete:true}))
      const token = Cookies.get("auth-token");

      if (selectedRows.length) {
        Promise.all(
          selectedRows.map(async (row) => {
            await fetch(
              `${process.env.NEXT_PUBLIC_URL}/api/fiches/` + row?.id,
              {
                method: "DELETE",
                headers: {
                  accept: "application/json",
                  Authorization: "Bearer " + token,
                },
              }
            );
          })
        ).then(() => {
          setSelectedRows([]);
          setReload((prev: any) => !prev);
          setOpenModalDelete(false);
          setLoading((prev)=>({...prev,delete:false}))
        });
      }
    },
    [selectedRows]
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mb: "100px",
      }}
    >
      <MenuBar setReload={setReload} />
      <CustomModal open={openModalDelete} setOpen={setOpenModalDelete}>
        <Typography>Voulez-vous vraiment supprimer cette fiche?</Typography>
        <Button
          variant="contained"
          color="error"
          sx={{ mt: "30px" }}
          onClick={handleDelete}
          disabled={loading.delete}
        >
          Confirmer
        </Button>
      </CustomModal>
      <CustomModal open={openChangeMultiple} setOpen={setOpenChangeMultiple}>
        <FormControl sx={{ minWidth: "250px", mt: "30px" }}>
          <InputLabel id="demo-simple-select-label">Statut</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={filters.multiSelectStatut}
            name="multiSelectStatut"
            label="Type d'établissement"
            onChange={(e: any) => {
              setFilters((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
              }));
            }}
            sx={{ width: "90%", mb: "10px" }}
          >
            <MenuItem value="Nouveau">Nouveau</MenuItem>
            <MenuItem value="Injoignable">Injoignable</MenuItem>
            <MenuItem value="Ne répond pas">Ne répond pas</MenuItem>
            <MenuItem value="A rappeler">A rappeler</MenuItem>
            <MenuItem value="Ne plus appeler">Ne plus appeler</MenuItem>
            <MenuItem value="Hors cible">Hors cible</MenuItem>
            <MenuItem value="Faux numéro">Faux numéro</MenuItem>
            <MenuItem value="Vente OK">Vente OK</MenuItem>
          </Select>
        </FormControl>
        <Button
          sx={{ mt: "20px" }}
          variant="contained"
          color="primary"
          onClick={handleChangeStatutMultiRows}
          disabled={loading.change}
        >
          Modifier
        </Button>
      </CustomModal>
      <AddFiche
        openModal={openModal}
        setOpenModal={setOpenModal}
        setReload={setReload}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: "95%",
          mt: "100px",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "20px",
            mb: "10px",
          }}
        >
          <Button variant="contained" onClick={handleOpenModal}>
            Nouvelle fiche
          </Button>
          <FormControl sx={{ minWidth: "250px" }}>
            <InputLabel id="demo-simple-select-label">
              Filtrer par statut
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={filters.statut}
              name="statut"
              label="Type d'établissement"
              onChange={(e) => handleChangeFilter(e)}
              sx={{ width: "90%", mb: "10px" }}
            >
              <MenuItem value="TOUT">Afficher tout</MenuItem>
              <MenuItem value="Nouveau">Nouveau</MenuItem>
              <MenuItem value="Injoignable">Injoignable</MenuItem>
              <MenuItem value="Ne répond pas">Ne répond pas</MenuItem>
              <MenuItem value="A rappeler">A rappeler</MenuItem>
              <MenuItem value="Ne plus appeler">Ne plus appeler</MenuItem>
              <MenuItem value="Hors cible">Hors cible</MenuItem>
              <MenuItem value="Faux numéro">Faux numéro</MenuItem>
              <MenuItem value="Vente OK">Vente OK</MenuItem>
            </Select>
          </FormControl>
          {userType === "ADMIN" && (
            <FormControl sx={{ minWidth: "250px" }}>
              <InputLabel id="demo-simple-select-label">
                Filtrer par utilisateur
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={filters.userId}
                name="userId"
                label="Filtrer par utilisateur"
                onChange={(e) => handleChangeFilter(e)}
                sx={{ width: "90%", mb: "10px" }}
              >
                <MenuItem value={0}>Afficher tout</MenuItem>
                {(userList || []).map((user, key) => {
                  return (
                    <MenuItem key={key} value={user.id}>
                      {user.username}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}
          <Button
            sx={{ maxWidth: "120px" }}
            startIcon={<Download />}
            size="small"
            onClick={handleExportAction}
            variant="contained"
          >
            Exporter
          </Button>
        </Box>
        {selectedRows.length ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "20px",
              mt: "50px",
              mb: "-30px",
            }}
          >
            <Button
              size="small"
              variant="outlined"
              color="primary"
              sx={{ ml: "10px" }}
              startIcon={<Share />}
              onClick={() => {
                setOpenAssign(true);
              }}
            >
              Assigner
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              sx={{ ml: "10px" }}
              onClick={() => {
                setOpenChangeMultiple(true);
              }}
              startIcon={<Edit />}
            >
              Modifier statut
            </Button>
            {userType === "ADMIN" && (
              <Button
                startIcon={<Delete />}
                size="small"
                variant="outlined"
                color="error"
                sx={{ ml: "10px" }}
                onClick={() => {
                  setOpenModalDelete(true);
                }}
              >
                Supprimer
              </Button>
            )}
            <Typography variant="body2" color="text.secondary">{selectedRows.length} fiches sélectionnées</Typography>
          </Box>
        ) : (
          <></>
        )}

        <CustomTable
          rows={rows}
          setReload={setReload}
          userList={userList}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          openAssign={openAssign}
          setOpenAssign={setOpenAssign}
          filters={filters}
          loading={loading}
          setLoading={setLoading}
        />
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Pagination
            count={Math.ceil(rows[0]?.total / 20)}
            color="primary"
            onChange={handleChangePagination}
          />
          <Typography variant="body1" sx={{ mt: "30px" }}>
            Nombre total des fiches : {rows[0]?.total || 0}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Home;
