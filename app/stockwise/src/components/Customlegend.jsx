import styles from "./navbar.module.css";


const CustomLegend = ({ chartData }) => {
    return (
        <div className={styles.customlegend}>
            <ul>
                {chartData.map((item, index) => (
                    <li key={index}>
                        <span
                            className={styles.legendcolor}
                            style={{
                                backgroundColor: getColor(index)
                            }}
                        ></span>
            {item.stock} -{" "}{item.percentage.toFixed(2)}%
                    </li>
                ))}
            </ul>
        </div>
    );
};

const getColor = (index) => {
    const chartColors = [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)'
    ];
    return chartColors[index % chartColors.length];
};

export default CustomLegend;
