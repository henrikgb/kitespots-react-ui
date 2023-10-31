import {EChartsOption} from "echarts";
import React, {useEffect, useState} from "react";
import {EChartsBase} from "@/components/Charts/EChartsBase";
import {WindDirectionDescriptions} from "@/assets/beachCoordinates";

interface DataObject {
    date: string;
    value: number;
}

interface WindDirectionProps extends EChartsOption {
    data?: DataObject[];
    windDirectionDescriptions: WindDirectionDescriptions[];
}

const WindDirection = ({ data, windDirectionDescriptions, ...opts }: WindDirectionProps) => {
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

  const options: EChartsOption = {
    title: {
      text: 'Wind Direction',
      left: 'left'
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: gridLeft,
      bottom: '25%',
      right: gridRight,
    },
    xAxis: {
      data: data?.map((item) => item.date) || [],
    },
    yAxis: {},
    toolbox: {
      right: 0,
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        restore: {},
        saveAsImage: {}
      }
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 0,
        end: 100
      },
      {
        type: 'inside',
        realtime: true,
        start: 0,
        end: 100
      }
    ],
    visualMap: {
      top: 30,
      right: 0,
      pieces: windDirectionDescriptions.map((description) => ({
        gt: description.intervalStart,
        lte: description.intervalStop,
        color: description.colorCode
      })),
      outOfRange: {
        color: '#999'
      }
    },
    series: {
      name: 'Wind Direction',
      type: 'line',
      data: data?.map((item) => item.value) || [],
      markLine: {
        silent: true,
        lineStyle: {
          color: '#333'
        },
        data: windDirectionDescriptions.map((description) => ({
          yAxis: description.intervalStop
        }))
      }
    },
    ...opts,
  }

  return (
    <>
      <EChartsBase option={options} style={{ width: "100%", height: "100%" }} />
    </>
  );
};

export default WindDirection;