import React from 'react';
import { EChartsOption } from 'echarts';
import { EChartsBase } from '@/components/Charts/EChartsBase';

interface DataObjectProps {
  date: string;
  value: number;
}

interface DataObject {
  windSpeed: DataObjectProps[];
  precipitation: DataObjectProps[];
}

interface WindVsRainProps extends EChartsOption {
  data?: DataObject;
}

const WindVsRain: React.FC<WindVsRainProps> = ({ data, ...opts }) => {
  // Extracting dates for x-axis
  const dates = data?.windSpeed.map((d) => d.date) ?? [];

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
      bottom: 80,
      right: '15%',
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
      data: ['Wind', 'Rain'],
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
