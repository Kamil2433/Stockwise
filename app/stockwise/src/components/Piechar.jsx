import { Pie } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the plugin
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export const PieChartJS = ({ chartData, title }) => {
    // Extract labels and data from the input data
    const labels = chartData.map(item => item.stock);
    const percentages = chartData.map(item => item.percentage);

    // Define the dataset
    const data = {
        labels: labels,
        datasets: [
            {
                data: percentages,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                    'rgba(255, 159, 64, 0.5)'
                ]
            }
        ]
    };

    return (
        <div style={{ height: "100%", width: "100%", border:"2px solid rgb(202, 202, 240)" }}>
            <Pie
                data={data}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        datalabels: {
                            formatter: (value, context) => {
                                return `${value.toFixed(2)}%`;
                            },
                            color: '#000',
                            font: {
                                size: 14
                            }
                        },
                        legend: {
                            display: true, // Enable the legend
                            position: 'top', // You can choose 'top', 'left', 'bottom', 'right'
                            labels: {
                                fontColor: '#000', // Customize font color
                                fontSize: 14, // Customize font size
                            }
                        },
                        title: {
                            display: true,
                            text: title, // Use the title prop
                            font: {
                                size: 20 // Customize title font size
                            }
                        }
                    }
                }}
            />
        </div>
    );
};
