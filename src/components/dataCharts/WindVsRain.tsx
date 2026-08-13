import React, {useEffect, useState} from 'react';
import { EChartsOption } from 'echarts';
import { TooltipFormatterCallback } from 'echarts/types/dist/shared';
import { EChartsBase } from '@/components/dataCharts/EChartsBase';
import {useTranslation} from 'next-i18next';
import useThemeStore from "@/store/themeStore";
import { formatAxisDateLabel, formatTooltipDateTime, getDayBoundaryTimestamps } from '@/domain/chartDateAxis';

interface DataObjectProps {
  date: string;
  // Gust and precipitation are null wherever Yr genuinely has no value for that point
  // (see WeatherPoint) - ECharts renders those as a gap in the line, which is intentional.
  value: number | null;
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
  const { t, i18n } = useTranslation();
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

  // Dates for the day-separator markLine - the x-axis itself is a `time` axis, so series
  // data carries its own [date, value] pairs rather than indexing into a shared category list.
  const dates = data?.windSpeed.map((d) => d.date) ?? [];
  const dayBoundaries = getDayBoundaryTimestamps(dates);

  // ECharts renders `null` entries as a gap in the line (its documented mechanism for
  // missing data points), but its published series.data typings don't include null in the
  // value union - cast to bridge that gap without changing runtime behavior.
  type TimeSeriesValue = [string, number][];

  // Extracting windGust values
  const windGustValues = (data?.windGust.map((d) => [d.date, d.value]) ?? []) as unknown[] as TimeSeriesValue;

  // Extracting windSpeed values
  const windSpeedValues = (data?.windSpeed.map((d) => [d.date, d.value]) ?? []) as unknown[] as TimeSeriesValue;

  // Extracting precipitation values
  const precipitationValues = (data?.precipitation.map((d) => [d.date, d.value]) ?? []) as unknown[] as TimeSeriesValue;

  // Renders the axis-trigger tooltip header as a readable date/time instead of the raw
  // ISO timestamp category value, keeping the per-series rows ECharts renders by default.
  const tooltipFormatter: TooltipFormatterCallback<any> = (params) => {
    const items = Array.isArray(params) ? params : [params];
    if (items.length === 0) {
      return '';
    }
    const header = formatTooltipDateTime(items[0].axisValue, i18n.language);
    const rows = items
      .map((item: any) => `${item.marker}${t(item.seriesName)}: ${item.value ?? '-'}`)
      .join('<br/>');
    return `${header}<br/>${rows}`;
  };

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
      formatter: tooltipFormatter,
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
        // `time` (not `category`) so points are spaced by actual elapsed time - the
        // forecast's hourly near-term data and 6-hourly tail otherwise would have looked
        // like they cover the same width per point, squeezing later days visually.
        type: 'time',
        boundaryGap: false,
        axisLine: { onZero: false },
        axisLabel: {
          formatter: (value: number) => formatAxisDateLabel(value, i18n.language),
          hideOverlap: true,
          color: textColour,
          rich: {
            day: { fontWeight: 'bold', color: textColour, lineHeight: 16 },
            time: { color: textColour, fontSize: 10, lineHeight: 14 },
          },
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
        // Thin vertical line at the first point of each day, so days stay visually
        // distinguishable even where the axis itself only has room for a time label.
        markLine: {
          silent: true,
          symbol: 'none',
          label: { show: false },
          lineStyle: { color: 'rgba(128, 128, 128, 0.35)', width: 1 },
          data: dayBoundaries.map((value) => ({ xAxis: value })),
        },
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
