import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './stylesheets/barChart.css';

// Register the plugin
Chart.register(ChartDataLabels);

const parseBrandAndModel = (car) => {
  const brand = car.NameMMT.split(' ')[0];
  const model = car.Model;

  return { brand, model };
};

const colors = [
  '#4CAF50', // Green
  '#FF5722', // Orange
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#FFC107', // Amber
  '#00BCD4', // Cyan
  '#E91E63', // Pink
  '#8BC34A', // Light Green
  '#FF9800', // Deep Orange
  '#673AB7', // Deep Purple
  '#3F51B5', // Indigo
  '#FFEB3B', // Yellow
  '#795548', // Brown
  '#607D8B', // Blue Grey
];

const assignColors = (brands, models) => {
  const colorMap = new Map();
  let colorIndex = 0;

  brands.forEach(brand => {
    models.forEach(model => {
      colorMap.set(`${brand}-${model}`, colors[colorIndex % colors.length]);
      colorIndex++;
    });
    colorIndex = 0;
  });

  return colorMap;
};

const StackedBarChart = ({ cars }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    const brandModelMap = new Map();

    cars.forEach(car => {
      const { brand, model } = parseBrandAndModel(car);

      if (!brandModelMap.has(brand)) {
        brandModelMap.set(brand, {});
      }

      if (!brandModelMap.get(brand)[model]) {
        brandModelMap.get(brand)[model] = 0;
      }

      brandModelMap.get(brand)[model] += 1; // Count the occurrences
    });

    const brands = [...brandModelMap.keys()];
    const models = [...new Set(cars.map(car => parseBrandAndModel(car).model))];

    const colorMap = assignColors(brands, models);

    const datasets = models.map((model) => {
      const data = brands.map(brand => {
        const total = Object.values(brandModelMap.get(brand)).reduce((sum, count) => sum + count, 0);
        const count = brandModelMap.get(brand)[model] || 0;
        return (count / total) * 100; // Calculate percentage
      });
      // Filter out zero or undefined values
      if (data.every(value => value === 0)) {
        return null;
      }
      return {
        label: model,
        data: data,
        backgroundColor: brands.map(brand => colorMap.get(`${brand}-${model}`)), // Use assigned colors
        barPercentage: 1, // Adjust bar width
        categoryPercentage: 0.8, // Adjust bar width
      };
    }).filter(dataset => dataset !== null); // Remove null datasets

    const data = {
      labels: brands,
      datasets: datasets,
    };

    const options = {
      indexAxis: 'y',
      scales: {
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Brand',
          },
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
            padding: 5,
          },
          grace: '5%', // Add some space around the edges
        },
        x: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Percentage',
          },
          ticks: {
            stepSize: 10,
          },
          min: 0,
          max: 100, // Increase max value to provide more space
        },
      },
      plugins: {
        datalabels: {
          display: true,
          color: 'white',
          anchor: 'center', // Position the labels at the center of the bars
          align: 'center', // Align the labels at the center of the bars
          formatter: (value, context) => {
            const model = context.dataset.label;
            return value > 0 ? model : '';
          },
          font: {
            weight: 'regular',
            size: 10, // Adjust font size for better readability
          },
          padding: {
            top: 2,
            bottom: 2,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.raw || 0;
              return `${label}: ${value.toFixed(2)}%`;
            },
          },
        },
        legend: {
          display: false,
        },
      },
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10,
        },
      },
    };

    const stackedBarChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: options,
    });

    return () => {
      stackedBarChart.destroy();
    };
  }, [cars]);

  return (
    <div>
      <h2>Stacked Bar Chart</h2>
      <canvas ref={chartRef} width="1200" height="800"></canvas> {/* Increase canvas width */}
    </div>
  );
};

export default StackedBarChart;