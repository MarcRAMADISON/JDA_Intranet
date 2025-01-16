"use client";

import { Box, Button, TextField, Typography } from "@mui/material";
import MenuBar from "../components/MenuBar/page";
import CustomChart from "../components/CustomChart/page";
import { useEffect, useState } from "react";
import { getAnnualStat, statuts } from "../utils";
import { Search } from "@mui/icons-material";

interface monthlyDataObject {
  label: string;
  nbFiche: number;
}

interface annuelDataObject {
  data: monthlyDataObject[];
  statut: { statut: string; nbFiche: number }[];
  totalFicheAnnuel: number;
}

function Statistiques() {
  const [annuelData, setAnnuelData] = useState<annuelDataObject | undefined>();
  const [detailStatut, setDetailStatut] = useState<any>();
  const [search, setSearch] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    getAnnualStat({ year: new Date().getFullYear() }).then((res) => {
      if (res) {
        const data: monthlyDataObject[] = res.global.monthData.map((month) => ({
          label: month.label,
          nbFiche: month.nbFiche,
        }));

        const detailData = statuts.map((s) => {
          const data = res.global.monthData.map((month) => ({
            label: month.label,
            nbFiche: month.statuts.find((statut) => statut.statut === s)
              ?.nbFiche,
          }));

          return { statut: s, data };
        });
        setDetailStatut(detailData);

        setAnnuelData({
          data: data,
          statut: res?.global?.statuts,
          totalFicheAnnuel: res?.global?.totalAnnuel,
        });
      }
    });
  }, []);

  const handleSearch = () => {
    setDetailStatut([]);
    setAnnuelData({ data: [], statut: [], totalFicheAnnuel: 0 });

    getAnnualStat({ year: search }).then((res) => {
      if (res) {
        const data: monthlyDataObject[] = res.global.monthData.map((month) => ({
          label: month.label,
          nbFiche: month.nbFiche,
        }));

        const detailData = statuts.map((s) => {
          const data = res.global.monthData.map((month) => ({
            label: month.label,
            nbFiche: month.statuts.find((statut) => statut.statut === s)
              ?.nbFiche,
          }));

          return { statut: s, data };
        });
        setDetailStatut(detailData);

        setAnnuelData({
          data: data,
          statut: res?.global?.statuts,
          totalFicheAnnuel: res?.global?.totalAnnuel,
        });
      }
    });
  };

  return (
    <Box>
      <MenuBar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "99%",
          alignItems: "center",
          mt: "50px",
        }}
      >
        <Box sx={{ display: "flex", height: "100px", mb:'50px' }}>
          <TextField
            id="outlined-basic"
            label="Année"
            variant="outlined"
            type="number"
            value={search}
            onChange={(e) => setSearch(e.target.value as unknown as number)}
          />
          <Button sx={{ height: "60px" }} variant="text" onClick={handleSearch}>
            <Search />
          </Button>
        </Box>
        <Typography color="primary" variant="h5" sx={{ fontWeight: "bold" }}>
          Statistique globale annuelle
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "60% 40%",
            gap: "10px",
            mt: "70px",
            width: "60%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {annuelData?.totalFicheAnnuel ? (
              <Box sx={{ display: "flex", alignItems: "center", mb: "20px" }}>
                <Typography variant="body1" color="primary">
                  Nombre total des fiches {search} :
                </Typography>
                <Typography
                  sx={{ ml: "15px" }}
                  variant="body2"
                  color="text.secondary"
                >
                  {annuelData?.totalFicheAnnuel}
                </Typography>
              </Box>
            ) : (
              <></>
            )}
            <CustomChart type="line" data={annuelData?.data || []} />
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              columnGap: "10px",
              rowGap: "20px",
            }}
          >
            {annuelData?.statut.map((statut, index) => {
              return (
                <Box key={`statut-${index}`}>
                  <Typography variant="body1" color="primary">
                    {statut.statut}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {statut.nbFiche}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Typography
          color="primary"
          variant="h5"
          sx={{ mt: "100px", mb: "70px", fontWeight: "bold" }}
        >
          Détail statistique globale annuelle par statut
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            columnGap: "10px",
            rowGap: "20px",
            width: "70%",
          }}
        >
          {detailStatut?.length ? (
            statuts.map((statut) => {
              return (
                <Box
                  sx={{ display: "flex", flexDirection: "column" }}
                  key={statut}
                >
                  <Box sx={{ mb: "20px" }}>
                    <Typography variant="body1" color="primary">
                      {statut}
                    </Typography>
                  </Box>
                  <CustomChart
                    data={
                      (detailStatut || []).find(
                        (detail: any) => detail.statut === statut
                      ).data
                    }
                  />
                </Box>
              );
            })
          ) : (
            <></>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Statistiques;
