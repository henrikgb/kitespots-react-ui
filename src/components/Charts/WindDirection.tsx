import {EChartsOption} from "echarts";
import React from "react";
import {EChartsBase} from "@/components/Charts/EChartsBase";

interface DataObject {
    time: string;
    windSpeed: number;
    windDirection: number;
    rainProbability: number;
}

interface WindDirectionProps extends EChartsOption {
    data?: DataObject[];
}

const WindDirection = ({ data, ...opts }: WindDirectionProps) => {
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
      data: data?.map((item) => item.time) || [],
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
      pieces: [
        {
          gt: 0,
          lte: 22,
          color: "#ffa500"
        },
        {
          gt: 22,
          lte: 150,
          color: '#FD0100'
        },
        {
          gt: 150,
          lte: 170,
          color: "#ffa500"
        },
        {
          gt: 170,
          lte: 210,
          color: "#45a3ff"
        },
        {
          gt: 210,
          lte: 240,
          color: '#00bb00'
        },
        {
          gt: 240,
          lte: 280,
          color: '#008000'
        },
        {
          gt: 280,
          lte: 330,
          color: '#00bb00'
        },
        {
          gt: 330,
          lte: 350,
          color: '#45a3ff'
        },
        {
          gt: 350,
          lte: 360,
          color: '#ffa500'
        }
      ],
      outOfRange: {
        color: '#999'
      }
    },
    series: {
      name: 'Wind Direction',
      type: 'line',
      data: data?.map((item) => item.windDirection) || [],
      markLine: {
        silent: true,
        lineStyle: {
          color: '#333'
        },
        data: [
          {
            yAxis: 22
          },
          {
            yAxis: 150
          },
          {
            yAxis: 170
          },
          {
            yAxis: 210
          },
          {
            yAxis: 240
          },
          {
            yAxis: 280
          },
          {
            yAxis: 330
          },
          {
            yAxis: 350
          }
        ]
      }
    }
  }

  return (
    <>
      <EChartsBase option={options} style={{ width: "100%", height: "100%" }} />
    </>
  );
};

export default WindDirection;