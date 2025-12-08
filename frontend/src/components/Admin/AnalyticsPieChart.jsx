import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

const AnalyticsPieChart = ({ approved, inProgress, rejected }) => {
  const data = {
    labels: ["Approved", "In Progress", "Rejected"],
    datasets: [
      {
        data: [approved, inProgress, rejected],
        backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default AnalyticsPieChart;
