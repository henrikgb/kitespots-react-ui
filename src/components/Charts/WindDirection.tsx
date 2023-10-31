import {EChartsOption} from "echarts";
import React from "react";
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
  const options: EChartsOption = {
    title: {
      text: 'Wind Direction',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '10%',
      right: '15%',
      bottom: '30%'
    },
    xAxis: {
      data: data?.map((item) => item.date) || [],
    },
    yAxis: {},
    toolbox: {
      right: 10,
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
      right: 10,
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