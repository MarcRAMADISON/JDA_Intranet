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
import { Download } from "@mui/icons-material";
import Cookies from "js-cookie";

interface filterObject{
  statut:string;
  userId:number;
}

const defaultFilter={
  statut:'',
  userId:0
}

function Home() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [rows, setRows] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [userType, setUserType] = useState<"ADMIN" | "AGENT">("AGENT");
  const [userList, setUserList] =
    useState<{ id: number; username: string; type: string }[]>();
  const [filters,setFilters]=useState<filterObject>(defaultFilter)
  

  useEffect(() => {
    getData({ start: 20 * (currentPage - 1), limit: 20 })
      .then((res) => res.json())
      .then((res) => {
        const data = (res?.data || []).map((d:any) => ({
          id: d.id,
          ...d.attributes,
          total: res?.meta?.pagination?.total || 0,
        }));
        setRows(sortData(data));
      });

    const user = Cookies.get("user");
    const dataUser=user && JSON.parse(user)

    if (dataUser?.type === 'ADMIN') {
      setUserType("ADMIN");
    }

    getUsers()
    .then((res) => res.json())
    .then((res) => {
      
      setUserList(res.filter((r:any)=>r.id !== dataUser?.id));
    });
  }, [reload, currentPage]);


  const handleOpenModal = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleChangeFilter = useCallback((event: any) => {
    event.preventDefault();

    setFilters((prev)=>({...prev,[event.target.name]:event.target.value}))


    if (event.target.value === "TOUT") {
      getData({ start: 0, limit: 20 })
        .then((res) => res.json())
        .then((res) => {
          const data = (res?.data || []).map((d:any) => ({
            id: d.id,
            ...d.attributes,
            total: res?.meta?.pagination?.total || 0,
          }));
          setRows(sortData(data));
        });
    } else {
      getData({ filters:{...filters,[event.target.name]:event.target.value} })
        .then((res) => res.json())
        .then((res) => {
          const data = (res?.data || []).map((d:any) => ({
            id: d.id,
            ...d.attributes,
            total: res?.meta?.pagination?.total || 0,
          }));
          setRows(sortData(data));
        });
    }
  }, [filters]);

  const handleChangePagination = useCallback(
    (event: any, page: number) => {
      event.preventDefault();
      getData({ filters, start: 20 * (page - 1), limit: 20 })
        .then((res) => res.json())
        .then((res) => {
          const data = (res?.data || []).map((d:any) => ({
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
            const newData = (res.data || []).map((d:any) => ({
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
            const newData = (res.data || []).map((d:any) => ({
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
              onChange={(e)=>handleChangeFilter(e)}
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
                onChange={(e)=>handleChangeFilter(e)}
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

        <CustomTable rows={rows} setReload={setReload} userList={userList} />
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
