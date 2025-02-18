import React, {useEffect, useState} from 'react';
import { EChartsOption } from 'echarts';
import { EChartsBase } from '@/components/dataCharts/EChartsBase';
import {useTranslation} from 'next-i18next';
import useThemeStore from "@/store/themeStore";

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
  const {theme} = useThemeStore();
  const { t } = useTranslation();
  const [gridRight, setGridRight] = useState('15%');
  const [gridLeft, setGridLeft] = useState('10%');
  const [textColour, setTextColour] = useState<string>();

  useEffect(() => {
    if(theme === "normal-mode"){
      setTextColour("black");
    }
    else{
      setTextColour("white");
    }
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      setGridRight(window.innerWidth <= 850 ? '10%' : '10%');
      setGridLeft(window.innerWidth <= 850 ? "20%" : "10%");
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
      text: t('windAndRain'),
      left: 'center',
      top: "7%",
      textStyle: {
        color: textColour,
      },
    },
    grid: {
      left: gridLeft,
      bottom: '30%',
      right: gridRight,
    },
    toolbox: {
      feature: {
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
      data: [t("gust"), t("wind"), t("rain")],
      left: 1,
      textStyle: {
        color: textColour,
      },
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
          formatter: (value: string) => value.replace(' ', '\n'),
        },
        nameTextStyle: {
          color: textColour,
        },
      },
    ],
    yAxis: [
      {
        name: "[m/s]",
        type: 'value',
        max: 18,
        nameTextStyle: {
          color: textColour,
        },
      },
      {
        name: "[mm]",
        nameLocation: 'start',
        alignTicks: true,
        type: 'value',
        inverse: true,
        max: 3,
        nameTextStyle: {
          color: textColour,
        },
      },
    ],
    series: [
      {
        name: t("gust"),
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
        name: t("wind"),
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
        name: t("rain"),
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
