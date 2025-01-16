"use client";

import { Box, Typography } from "@mui/material";
import MenuBar from "../components/MenuBar/page";
import CustomChart from "../components/CustomChart/page";
import { useEffect, useState } from "react";
import { getAnnualStat } from "../utils";

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

  useEffect(() => {
    getAnnualStat({ year: 2025 }).then((res) => {
      if (res) {
        const data: monthlyDataObject[] = res.global.monthData.map((month) => ({
          label: month.label,
          nbFiche: month.nbFiche,
        }));
        console.log("res", res);
        setAnnuelData({
          data: data,
          statut: res?.global?.statuts,
          totalFicheAnnuel: res?.global?.totalAnnuel,
        });
      }
    });
  }, []);

  return (
    <Box>
      <MenuBar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "99%",
          alignItems: "center",
          mt: "70px",
        }}
      >
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
          <Box sx={{display:'flex',flexDirection:"column",alignItems:'center'}}>
            {annuelData?.totalFicheAnnuel ? (
                <Box sx={{display:'flex',alignItems:'center',mb:'20px'}}>
                <Typography variant="body1" color="primary">
                  Nombre total des fiches 2025 : 
                </Typography>
                <Typography sx={{ml:'15px'}} variant="body2" color="text.secondary">
                {annuelData?.totalFicheAnnuel}
                </Typography>
              </Box>
            ) : (
              <></>
            )}
            <CustomChart data={annuelData?.data || []} />
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
      </Box>
    </Box>
  );
}

export default Statistiques;
