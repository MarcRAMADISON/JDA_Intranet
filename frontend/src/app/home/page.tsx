"use client";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
} from "@mui/material";
import MenuBar from "../components/MenuBar/page";
import CustomTable from "../components/Table/page";
import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import AddFiche from "../components/AddFiche/page";

async function getData({filter,start,limit}:{filter?: string,start?:number,limit?:number}) {
  const token = Cookies.get("auth-token");
  let rows;

  if (filter) {
    rows = await fetch(
      `http://localhost:1337/api/fiches?filters[statut][$eq]=${filter}&pagination[start]=${start || 0}&pagination[limit]=${limit || 20}`,
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
    rows = await fetch(`http://localhost:1337/api/fiches?pagination[start]=${start || 0}&pagination[limit]=${limit || 5}`, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        accept: "application/json",
        Authorization: "bearer " + token,
      },
    });
  }

  return rows;
}

function Home() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [rows, setRows] = useState<any>([]);
  const [statut, setStatut] = useState<string>("");

  useEffect(() => {
    getData({start:0,limit:20})
      .then((res) => res.json())
      .then((res) => {
        const data = (res?.data || []).map((d) => ({
          id: d.id,
          ...d.attributes,
        }));
        setRows(data);
      });
  }, [reload]);

  const handleOpenModal = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleChangeFilter = useCallback((event: any) => {
    event.preventDefault();
    setStatut(event.target.value);
    if (event.target.value === "TOUT") {
      getData({start:0,limit:5})
        .then((res) => res.json())
        .then((res) => {
          const data = (res?.data || []).map((d) => ({
            id: d.id,
            ...d.attributes,
          }));
          setRows(data);
        });
    } else {
      getData({filter:event.target.value})
        .then((res) => res.json())
        .then((res) => {
          const data = (res?.data || []).map((d) => ({
            id: d.id,
            ...d.attributes,
          }));
          setRows(data);
        });
    }
  }, []);

  const handleChangePagination=useCallback((event:any,page:number)=>{
    console.log('event',page)
  },[])

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <MenuBar />
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
            gridTemplateColumns: "repeat(2,1fr)",
            gap: "20px",
            width: "500px",
            mb: "10px",
          }}
        >
          <Button variant="contained" onClick={handleOpenModal}>
            Nouvelle fiche
          </Button>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">
              Filtrer par statut
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={statut}
              name="statut"
              label="Type d'établissement"
              onChange={handleChangeFilter}
              sx={{ width: "90%", mb: "10px" }}
            >
              <MenuItem value="TOUT">Afficher tout</MenuItem>
              <MenuItem value="Injoignable">Injoignable</MenuItem>
              <MenuItem value="Ne répond pas">Ne répond pas</MenuItem>
              <MenuItem value="A rappeler">A rappeler</MenuItem>
              <MenuItem value="Ne plus appeler">Ne plus appeler</MenuItem>
              <MenuItem value="Hors cible">Hors cible</MenuItem>
              <MenuItem value="Faux numéro">Faux numéro</MenuItem>
              <MenuItem value="Vente OK">Vente OK</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <CustomTable rows={rows} setReload={setReload} />
        <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Pagination count={rows?.length} color="primary" onChange={handleChangePagination}/>
      </Box>
      </Box>
    </Box>
  );
}

export default Home;
