"use client";

import { Box } from "@mui/material";
import Chart from "chart.js/auto";
import { useEffect, useRef } from "react";

/*interface CustomChartProps {
  data: { label: string; nbFiche: number }[]; 
  type?: "bar" | "line" | "pie" | "doughnut" | "radar";
  options?: any; 
  width?: string | number; 
  height?: string | number; 
}*/

function CustomChart({
  type = "bar",
  data,
  options = {},
  width = "500px",
  height = "300px",
}: any) {
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
        labels: (data || []).map((row:any) => row.label),
        datasets: [
          {
            label: "Nombre de fiche",
            data: (data || []).map((row:any) => row.nbFiche),
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
            max: Math.max(...(data || []).map((row:any) => row.nbFiche)) + 50, // Définit une valeur minimale personnalisée
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

