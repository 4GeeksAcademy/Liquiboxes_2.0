import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesChart = ({ data, options }) => {
  console.log('SalesChart - Data:', data); // Para depuración
  console.log('SalesChart - Options:', options); // Para depuración

  if (!data || !data.labels || !data.datasets) {
    console.log('SalesChart - No hay datos suficientes para mostrar el gráfico');
    return <div>No hay datos disponibles para mostrar el gráfico.</div>;
  }
  
  return <Bar data={data} options={options} className='mx-5'/>;
};

export default SalesChart;