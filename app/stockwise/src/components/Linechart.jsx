import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';

// Register necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const LineGraph = ({ data }) => {
  // Format data values to 2 decimal places
  const formattedData = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, parseFloat(value).toFixed(2)])
  );

  const chartData = {
    labels: Object.keys(formattedData),
    datasets: [
      {
        data: formattedData,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false, // No background fill
        pointRadius: 0, // Hide points
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: false, // Disable tooltips
      },
      legend: {
        display: false, // Remove legend
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0, // Disable bezier curves
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineGraph;
