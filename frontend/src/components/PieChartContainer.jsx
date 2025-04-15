import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { getNepaliMonthArray } from "../utils/dateConverter";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const PieChartContainer = ({
  type,
  totalIncome = 0,
  totalExpenses = 0,
  totalSavings = 0,
  monthlyData = { labels: [], incomeData: [], expenseData: [] },
}) => {
  const Piedata = {
    labels: ["Income", "Expenses", "Savings"],
    datasets: [
      {
        label: "Financial Distribution",
        data: [totalIncome, totalExpenses, totalSavings],
        backgroundColor: [
          "rgba(117, 117, 117, 0.6)",
          "rgba(29, 87, 126, 0.6)",
          "rgba(84, 74, 49, 0.6)",
        ],
        borderColor: [
          "rgb(255, 255, 255)",
          "rgb(255, 255, 255)",
          "rgb(255, 255, 255)",
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 206, 86, 0.8)",
        ],
        hoverBorderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        hoverBorderWidth: 2,
      },
    ],
  };
  const Pieoptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#ffffff",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };
  const barData = {
    labels: monthlyData.labels || getNepaliMonthArray(),
    datasets: [
      {
        label: "Monthly Income",
        data: monthlyData.incomeData,
        backgroundColor: "rgba(117, 117, 117, 0.6)",
        borderColor: "rgb(255, 255, 255)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(54, 162, 235, 0.8)",
        hoverBorderColor: "rgba(54, 162, 235, 1)",
      },
      {
        label: "Monthly Expenses",
        data: monthlyData.expenseData,
        backgroundColor: "rgba(29, 87, 126, 0.6)",
        borderColor: "rgb(255, 255, 255)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(255, 99, 132, 0.8)",
        hoverBorderColor: "rgba(255, 99, 132, 1)",
      },
    ],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#ffffff",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
          },
        },
      },
      zoom: {},
    },
    scales: {
      x: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
        },
      },
      y: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
        },
      },
    },
  };

  return (
    <>
      {type === "pie" ? (
        <div className='pieChartContainer'>
          <div className='pieChartContainerHeader'>
            <h3>Financial Distribution</h3>
            <p>Income vs Expenses vs Savings</p>
          </div>
          <div className='pieChartContainerBody'>
            <Pie
              data={Piedata}
              options={Pieoptions}
            />
          </div>
        </div>
      ) : type === "bar" ? (
        <div className='pieChartContainer'>
          <div className='pieChartContainerHeader'>
            <h3>Monthly Overview</h3>
            <p>Income vs Expenses</p>
          </div>
          <div className='pieChartContainerBody'>
            <Bar
              data={barData}
              options={barOptions}
            />
          </div>
        </div>
      ) : (
        <p>No chart type specified</p>
      )}
    </>
  );
};

export default PieChartContainer;
