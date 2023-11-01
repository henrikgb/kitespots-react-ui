import React, {useEffect, useState} from 'react';
import { EChartsOption } from 'echarts';
import { EChartsBase } from '@/components/Charts/EChartsBase';

interface DataObjectProps {
  date: string;
  value: number;
}

interface DataObject {
  windGust: DataObjectProps[];
  windSpeed: DataObjectProps[];
  precipitation: DataObjectProps[];
}

interface WindVsRainProps extends EChartsOption {
  data?: DataObject;
}

const WindVsRain: React.FC<WindVsRainProps> = ({ data, ...opts }) => {
  const [gridRight, setGridRight] = useState('15%');
  const [gridLeft, setGridLeft] = useState('10%');

  useEffect(() => {
    const handleResize = () => {
      setGridRight(window.innerWidth <= 850 ? '25%' : '15%');
      setGridLeft(window.innerWidth <= 850 ? "15%" : "10%");
    };

    // Set the grid right value on component mount
    handleResize();

    // Add event listener for screen resize
    window.addEventListener('resize', handleResize);

    // Remove event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Extracting dates for x-axis
  const dates = data?.windSpeed.map((d) => d.date) ?? [];

  // Extracting windGust values
  const windGustValues = data?.windGust.map((d) => d.value) ?? [];

  // Extracting windSpeed values
  const windSpeedValues = data?.windSpeed.map((d) => d.value) ?? [];

  // Extracting precipitation values
  const precipitationValues = data?.precipitation.map((d) => d.value) ?? [];

  const options: EChartsOption = {
    title: {
      text: 'Wind and Rain',
      left: 'center',
    },
    grid: {
      left: gridLeft,
      bottom: '25%',
      right: gridRight,
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none',
        },
        restore: {},
        saveAsImage: {},
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        animation: false,
        label: {
          backgroundColor: '#505765',
        },
      },
    },
    legend: {
      data: ['Gust', 'Wind', 'Rain'],
      left: 1,
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 0,
        end: 100,
      },
      {
        type: 'inside',
        realtime: true,
        start: 0,
        end: 100,
      },
    ],
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisLine: { onZero: false },
        data: dates,
        axisLabel: {
          formatter: (value: string) => value.replace(' ', '\n'), // Format the xAxis labels
        },
      },
    ],
    yAxis: [
      {
        name: 'Wind Speed (m/s)',
        type: 'value',
      },
      {
        name: 'Rain (mm)',
        nameLocation: 'start',
        alignTicks: true,
        type: 'value',
        inverse: true,
      },
    ],
    series: [
      {
        name: 'Gust',
        type: 'line',
        areaStyle: {},
        lineStyle: {
          width: 1,
        },
        emphasis: {
          focus: 'series',
        },
        color: '#ff6666',
        data: windGustValues,
      },
      {
        name: 'Wind',
        type: 'line',
        areaStyle: {},
        lineStyle: {
          width: 1,
        },
        emphasis: {
          focus: 'series',
        },
        color: '#5f9ea0',
        data: windSpeedValues,
      },
      {
        name: 'Rain',
        type: 'line',
        yAxisIndex: 1,
        areaStyle: {},
        lineStyle: {
          width: 1,
        },
        emphasis: {
          focus: 'series',
        },
        color: '#80ccff',
        data: precipitationValues,
      },
    ],
    ...opts,
  };

  return <EChartsBase option={options} style={{ width: '100%', height: '100%' }} />;
};

export default WindVsRain;
