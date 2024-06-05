import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const data = {
  labels: ["January", "February", "March", "April", "May"],
  datasets: [
    {
      label: "Sales",
      data: [12, 19, 3, 5, 2],
      borderColor: "rgba(75,192,192,1)",
      backgroundColor: "rgba(75,192,192,0.2)",
    },
  ],
};

const StyledComponent = () => (
  <div className="styled">
    <h3>Styled Component with Chart</h3>
    <div className="chart-container">
      <Line data={data} />
    </div>
  </div>
);

export default StyledComponent;
