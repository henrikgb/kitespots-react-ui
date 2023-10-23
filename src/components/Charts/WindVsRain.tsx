import {EChartsOption} from "echarts";
import React from "react";
import {EChartsBase} from "@/components/Charts/EChartsBase";

interface DataObject {
    time: string;
    windSpeed: number;
    windDirection: number;
    rainProbability: number;
}

interface WindVsRainProps extends EChartsOption {
    data?: DataObject[];
}

const WindVsRain = ({ data, ...opts }: WindVsRainProps) => {
  const options: EChartsOption = {
    title: {
      text: 'Rainfall and Wind',
      left: 'center'
    },
    grid: {
      bottom: 80,
      right: "15%"
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        restore: {},
        saveAsImage: {}
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        animation: false,
        label: {
          backgroundColor: '#505765'
        }
      }
    },
    legend: {
      data: ['Wind', 'Rain Probability'],
      left: 1
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
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisLine: { onZero: false },
        // prettier-ignore
        data: data?.map((item) => item.time) || [],
        axisLabel: {
          formatter: (value: string) => value.replace(' ', '\n'), // Format the xAxis labels
        },
      }
    ],
    yAxis: [
      {
        name: 'Wind Speed(m/s)',
        type: 'value'
      },
      {
        name: 'Rain Probability',
        nameLocation: 'start',
        alignTicks: true,
        type: 'value',
        inverse: true
      }
    ],
    series: [
      {
        name: 'Wind',
        type: 'line',
        areaStyle: {},
        lineStyle: {
          width: 1
        },
        emphasis: {
          focus: 'series'
        },
        color: "#5f9ea0",
        // prettier-ignore
        data: data?.map((item) => item.windSpeed) || [],
      },
      {
        name: 'Rain Probability',
        type: 'line',
        yAxisIndex: 1,
        areaStyle: {},
        lineStyle: {
          width: 1
        },
        emphasis: {
          focus: 'series'
        },
        color: "#80ccff",
        // prettier-ignore
        data: data?.map((item) => item.rainProbability) || [],
      }
    ],
    ...opts,
  };

  return (
    <>
      <EChartsBase option={options} style={{ width: "100%", height: "100%" }} />
    </>
  );
};

export default WindVsRain;