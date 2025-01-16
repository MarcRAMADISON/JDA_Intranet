"use client";

/*import { Box } from "@mui/material";
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

      
    if (chart) {
      chart.destroy(); // Détruisez l'ancien graphique
    }
    

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

export default CustomChart;*/

"use client";

import { Box } from "@mui/material";
import Chart from "chart.js/auto";
import { useEffect, useRef } from "react";

interface CustomChartProps {
  type?: "bar" | "line" | "pie" | "doughnut" | "radar"; 
  data: { label: string; nbFiche: number }[]; 
  options?: any; 
  width?: string | number; 
  height?: string | number; 
}

function CustomChart({
  type = "bar",
  data,
  options = {},
  width = "500px",
  height = "300px",
}: CustomChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null); 

  useEffect(() => {
    const ctx = chartRef.current;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx as HTMLCanvasElement, {
      type,
      data: {
        labels: (data || []).map((row) => row.label),
        datasets: [
          {
            label: "Nombre de fiche",
            data: (data || []).map((row) => row.nbFiche),
            borderColor: "#000",
            backgroundColor: "#384959",
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true, // Démarre à 0 par défaut
            max: data.length + 200, // Définit une valeur minimale personnalisée
          },
        },
        plugins: {
          legend: {
            display: type !== "bar",
          },
          ...options.plugins, 
        },
        ...options,
      },
    });

    return () => {
      chartInstance.current?.destroy(); 
    };
  }, [type, data, options]); 

  return (
    <Box>
      <Box sx={{ width, height }}>
        <canvas ref={chartRef}></canvas>
      </Box>
    </Box>
  );
}

export default CustomChart;

