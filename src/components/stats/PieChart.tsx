import React from 'react';
import { Chart } from 'react-google-charts';

interface PieChartProps {
  data: { label: string; value: number }[];
  title?: string;
  width?: number;
  height?: number;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  title = 'Pie Chart',
  width = 600,
  height = 400,
}) => {
  // Format the data for Google Charts
  const chartData = [
    ['Label', 'Value'],
    ...data.map(item => [item.label, item.value]),
  ];

  const options = {
    backgroundColor: 'transparent',
    pieHole: 0.4,
    slices: [
      { color: '#8AD1C2' },
      { color: '#9F8AD1' },
      { color: '#D18A99' },
      { color: '#D1C68A' },
      { color: '#8AD1A9' },
      { color: '#8A96D1' },
      { color: '#D1A68A' },
    ],
    pieSliceText: 'percentage',
    legend: {
      alignment: 'center',
      textStyle: {
        color: 'white',
        bold: false
      }
    },
    title,
    titleTextStyle: {
      fontSize: '18rem',
      bold: true,
      alignment: 'left',
      color: 'white'
    },
    tooltip: {textStyle: {color: 'black', bold: false}, showColorCode: true},
    chartArea: {
      left: '10%',
      top: '20%',
      width: '80%',
      height: '70%',
    },
  };
  return (
    <div className={`bg-login-form-card rounded-md`} style={{width: width + 'px'}}>
        <Chart  
          chartType="PieChart"
          data={chartData}
          options={options}
          width={width + 'px'}
          height={height + 'px'}
        />
    </div>
  );
};

export default PieChart;
