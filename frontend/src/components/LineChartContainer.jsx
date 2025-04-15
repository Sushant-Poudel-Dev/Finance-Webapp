import React, { useState, useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { formatDateForDisplay } from "../utils/dateConverter";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Filler,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

ChartJS.register(
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  zoomPlugin,
  Filler
);

const LineChartContainer = ({
  chartData,
  showBoth = false,
  isNepaliCalendar = true,
  type = "expense", // Add default type
}) => {
  const [isPanning, setIsPanning] = useState(false);
  const [chartRange, setChartRange] = useState({
    min: 0,
    max: 7,
  });
  const chartRef = useRef(null);

  const createGradient = (ctx, color) => {
    if (!ctx) {
      return color;
    }
    const gradient = ctx.createLinearGradient(0, 400, 0, 0);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, color);
    return gradient;
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
      setChartRange({ min: 0, max: 50 });
    }
  };

  const formatXAxisLabel = (value, index) => {
    if (chartData.dates && chartData.dates[index]) {
      return formatDateForDisplay(chartData.dates[index], isNepaliCalendar);
    }
    return value;
  };

  const {
    incomeData = [],
    expenseData = [],
    labels = [],
    dates = [],
  } = chartData || {};

  const lineData = {
    labels: labels,
    datasets: showBoth
      ? [
          {
            label: "Income",
            data: incomeData,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.3)",
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor: "rgba(54, 162, 235, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(54, 162, 235, 1)",
          },
          {
            label: "Expenses",
            data: expenseData,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.3)",
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor: "rgba(255, 99, 132, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(255, 99, 132, 1)",
          },
        ]
      : [
          {
            label: type === "income" ? "Income" : "Expenses",
            data:
              type === "income"
                ? chartData?.incomeData || []
                : chartData?.expenseData || [],
            borderColor:
              type === "income"
                ? "rgba(54, 162, 235, 1)"
                : "rgba(255, 99, 132, 1)",
            backgroundColor:
              type === "income"
                ? "rgba(54, 162, 235, 0.3)"
                : "rgba(255, 99, 132, 0.3)",
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor:
              type === "income"
                ? "rgba(54, 162, 235, 1)"
                : "rgba(255, 99, 132, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor:
              type === "income"
                ? "rgba(54, 162, 235, 1)"
                : "rgba(255, 99, 132, 1)",
          },
        ],
  };

  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const datasets = chart.data.datasets;

      datasets.forEach((dataset) => {
        const color = dataset.backgroundColor;
        dataset.backgroundColor = createGradient(chart.ctx, color);
      });

      chart.update();
    }
  }, [chartData]);

  const lineOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
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
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        callbacks: {
          title: function (tooltipItems) {
            const index = tooltipItems[0].dataIndex;
            return `${labels[index]} (${dates[index]})`;
          },
          label: function (tooltipItem) {
            return `${tooltipItem.dataset.label}: Rs ${tooltipItem.raw}`;
          },
        },
      },
      zoom: {
        pan: {
          enabled: isPanning,
          mode: "x",
          modifierKey: null,
          onPan: function (ctx) {
            const chart = ctx.chart;
            const { min, max } = chart.scales.x;
            if (min < 0) {
              chart.scales.x.min = 0;
              chart.scales.x.max = max - min;
            }
            if (max > labels.length) {
              chart.scales.x.max = labels.length;
              chart.scales.x.min = min - (max - labels.length);
            }
            setChartRange({ min: chart.scales.x.min, max: chart.scales.x.max });
          },
        },
        zoom: {
          wheel: {
            enabled: !isPanning,
          },
          pinch: {
            enabled: !isPanning,
          },
          mode: "x",
          drag: {
            enabled: !isPanning,
          },
        },
        limits: {
          x: {
            min: 0,
            max: labels.length,
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: formatXAxisLabel,
          color: "#ffffff",
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
        },
        min: chartRange.min,
        max: chartRange.max,
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className='lineChartContainer'>
      <div className='lineChartContainerHeader'>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <h3>
            {showBoth
              ? "Income & Expenses Overview"
              : type === "income"
              ? "Daily Income"
              : "Daily Expenses"}
          </h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setIsPanning(!isPanning)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: isPanning
                  ? "var(--primary-color)"
                  : "transparent",
                border: "1px solid var(--primary-color)",
                borderRadius: "var(--border-radius)",
                color: isPanning ? "black" : "var(--primary-color)",
                cursor: "pointer",
              }}
            >
              {isPanning ? "Pan Mode: On" : "Pan Mode: Off"}
            </button>
            <button
              onClick={handleZoomOut}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "transparent",
                border: "1px solid var(--primary-color)",
                borderRadius: "var(--border-radius)",
                color: "white",
                cursor: "pointer",
              }}
            >
              Zoom Out
            </button>
          </div>
        </div>
        <p>
          Track your{" "}
          {showBoth ? "finances" : type === "income" ? "income" : "expenses"}{" "}
          over time
        </p>
      </div>
      <div className='lineChartContainerBody'>
        <Line
          ref={chartRef}
          data={lineData}
          options={lineOptions}
        />
      </div>
    </div>
  );
};

export default LineChartContainer;
