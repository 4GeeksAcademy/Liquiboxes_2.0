import React from "react";
import SalesChart from "../component/Home/SalesChart";

const ShopSales= ()=> {
    const salesData = {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'], // Meses o cualquier otro período
        datasets: [
          {
            label: 'Ventas en USD',
            data: [1200, 1900, 3000, 5000, 2500, 3500], // Ventas en diferentes meses
            backgroundColor: 'rgba(75, 192, 192, 0.6)', // Color de las barras
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
      // Opciones de configuración del gráfico
      const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Ventas Mensuales del Negocio',
          },
        },
        scales: {
          y: {
            beginAtZero: true, // Inicia el eje Y desde 0
          },
        },
      };
      return (
        <div>
          <h1>Ventas del Negocio</h1>
          <SalesChart data={salesData} options={options} />
        </div>
      );
}
export default ShopSales