import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../styles/shops/shopsales.css'; // Asumimos que crearás este archivo CSS
import Spinner from "../Spinner";

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ShopSales = ({ shopData }) => {
  const [shopSales, setShopSales] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("amount");
  const [timeRange, setTimeRange] = useState("year");

  useEffect(() => {
    if (shopData && shopData.id) {
      fetchShopSales(shopData.id);
    }
  }, [shopData]);

  const fetchShopSales = async (shopId) => {
    setLoading(true);
    setError(null);
    const token = sessionStorage.getItem('token');
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      console.error("BACKEND_URL no está definido");
      setError("Error en la configuración de la URL del backend");

      setTimeout(() => setLoading(false), 500);
      return;
    }

    try {
      const response = await axios.get(`${backendUrl}/sales/shop/${shopId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setShopSales(response.data);
    } catch (error) {
      console.error("Error al obtener las ventas de la tienda:", error);
      setError(error.response ? error.response.data : error.message);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const prepareSalesData = () => {
    const currentDate = new Date();
    let filteredSales = shopSales;
    let labels = [];
    let salesData = [];

    switch (timeRange) {
      case "week":
        filteredSales = shopSales.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return (currentDate - saleDate) / (1000 * 60 * 60 * 24) <= 7;
        });
        labels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        break;
      case "month":
        filteredSales = shopSales.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return currentDate.getMonth() === saleDate.getMonth() && currentDate.getFullYear() === saleDate.getFullYear();
        });
        labels = Array.from({ length: 31 }, (_, i) => i + 1);
        break;
      case "year":
        filteredSales = shopSales.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return currentDate.getFullYear() === saleDate.getFullYear();
        });
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        break;
    }

    if (chartType === "amount") {
      salesData = labels.map(() => 0);
      filteredSales.forEach(sale => {
        const date = new Date(sale.created_at);
        const index = timeRange === "week" ? date.getDay() :
          timeRange === "month" ? date.getDate() - 1 :
            date.getMonth();
        salesData[index] += sale.subtotal;
      });
    } else {
      salesData = labels.map(() => 0);
      filteredSales.forEach(sale => {
        const date = new Date(sale.created_at);
        const index = timeRange === "week" ? date.getDay() :
          timeRange === "month" ? date.getDate() - 1 :
            date.getMonth();
        salesData[index]++;
      });
    }

    return {
      labels,
      datasets: [{
        label: chartType === "amount" ? 'Ventas en EUR' : 'Número de Ventas',
        data: salesData,
        backgroundColor: 'rgba(106, 142, 127, 0.6)',
        borderColor: 'rgba(106, 142, 127, 1)',
        borderWidth: 1,
      }],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${chartType === "amount" ? 'Ventas en EUR' : 'Número de Ventas'} - Último ${timeRange === "week" ? "Semana" : timeRange === "month" ? "Mes" : "Año"}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grace: '10%', // Esto añade un 10% de espacio extra en la parte superior del gráfico
      },
    },
  };

  if (loading) {
    return (
      <Spinner />
    );
  }
  if (error) return <div className="error">Error: {error}</div>;

  const salesData = prepareSalesData();

  return (
    <div className="shop-sales container mt-4">
      <h1 className="mb-4">Ventas del Negocio</h1>
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <FontAwesomeIcon icon={faChartBar} />
            </span>
            <select
              className="form-select"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="amount">Ventas en EUR</option>
              <option value="count">Número de Ventas</option>
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <FontAwesomeIcon icon={faCalendarAlt} />
            </span>
            <select
              className="form-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
              <option value="year">Último Año</option>
            </select>
          </div>
        </div>
      </div>
      <Bar data={salesData} options={options} />
    </div>
  );
};

export default ShopSales;