"use client";

import { Box } from "@mui/material";
import Chart from "chart.js/auto";
import { useEffect } from "react";


function CustomChart({data}:{data:{label:string,nbFiche:number}[]}) {
  useEffect(() => {
    const element = document.getElementById("dimensions");

      const chart= new Chart(element as any, {
        type: "bar",
        data: {
          labels: (data || []).map((row:any) => row.label),
          datasets: [
            {
              label: "Nombre de fiche",
              data: (data || []).map((row:any) => row.nbFiche),
              borderColor: '#000',
              backgroundColor: '#384959',
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    

    return ()=>{
      return chart.destroy()
    }
  });

  return (
    <Box>
      <Box sx={{ width: "500px" }}>
        <canvas id="dimensions"></canvas>
      </Box>
    </Box>
  );
}

export default CustomChart;
