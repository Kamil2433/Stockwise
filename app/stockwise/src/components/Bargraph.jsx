import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const BarChart = ({ data }) => {
  // Format average return to 2 decimal places
  const formattedData = data.map(item => ({
    ...item,
    average_return: parseFloat(item.average_return.toFixed(2))
  }));

  const colors = [
    'rgba(75, 192, 192, 0.2)',
    'rgba(255, 99, 132, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)'
  ];

  const borderColors = [
    'rgba(75, 192, 192, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
  ];

  const chartData = {
    labels: formattedData.map(item => item.stock),
    datasets: [
      {
        label: 'Average Return',
        data: formattedData.map(item => item.average_return),
        backgroundColor: formattedData.map((_, index) => colors[index % colors.length]),
        borderColor: formattedData.map((_, index) => borderColors[index % borderColors.length]),
        borderWidth: 1,
      },
    ],
  };

  const options = {
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
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}%`;
          },
        },
      },
      datalabels: {
        display: true,
        align: 'end',
        anchor: 'end',
        formatter: function(value) {
          return `${value}%`;
        }
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ width: '100%', height: '400px' , border:"2px solid rgb(202, 202, 240)"}}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
