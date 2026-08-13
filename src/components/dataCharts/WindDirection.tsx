import {EChartsOption} from "echarts";
import React, {useEffect, useState} from "react";
import {EChartsBase} from "@/components/dataCharts/EChartsBase";
import {WindDirectionDescription} from "@/types/model/Location";
import {findWindConditionForDirection} from "@/domain/windCondition";
import {useTranslation} from 'next-i18next';
import useThemeStore from "@/store/themeStore";
import {TooltipFormatterCallback} from "echarts/types/dist/shared";
import {formatAxisDateLabel, formatTooltipDateTime, getDayBoundaryTimestamps} from "@/domain/chartDateAxis";

interface DataObject {
    date: string;
    value: number | null;
}

interface WindDirectionProps extends EChartsOption {
    data?: DataObject[];
    windDirectionDescriptions: WindDirectionDescription[];
}

const WindDirection = ({ data, windDirectionDescriptions, ...opts }: WindDirectionProps) => {
  const {theme} = useThemeStore();
  const [textColour, setTextColour] = useState<string>();
  const [lineColour, setLineColour] = useState<string>();
  const { t, i18n } = useTranslation();
  const [gridRight, setGridRight] = useState('15%');
  const [gridLeft, setGridLeft] = useState('10%');

  useEffect(() => {
    if(theme === "normal-mode"){
      setTextColour("black");
      setLineColour("black");
    }
    else{
      setTextColour("white");
      setLineColour("#d9d9d9");
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

  /**
   * Retrieves the localized wind-condition label for the given wind direction value, via
   * the single canonical category->label mapping in @/domain/windCondition.
   *
   * @param {number} value - The wind direction value to find the description for.
   * @returns {string} The localized description of the wind direction or an empty string if not found.
   */
  const getWindDirectionDescription = (value: number) => {
    const condition = findWindConditionForDirection(value, windDirectionDescriptions);
    return condition ? t(condition.id) : '';
  };

  /**
   * Tooltip formatter function for the ECharts chart.
   *
   * This function formats the tooltip content to be displayed when hovering over the chart.
   * It uses the first parameter of the tooltip data to obtain the value and then fetches the
   * corresponding wind direction description. The tooltip displays the series name, value, and
   * the localized description of the wind direction on separate lines.
   *
   * @param {any[]} params - Array of parameters for the tooltip, provided by ECharts.
   * @returns {string} Formatted HTML string for the tooltip content.
   */
  const tooltipFormatter: TooltipFormatterCallback<any> = (params) => {
    const param = params[0];
    const value = param.value as number;
    const description = getWindDirectionDescription(value);

    // Translate series name and other static texts if needed
    const translatedSeriesName = t(param.seriesName);
    const header = formatTooltipDateTime(param.axisValue, i18n.language);

    return `${header}<br/>${param.marker}${translatedSeriesName}: ${value} <br/> ${description}`;
  };


  // Dates for the day-separator markLine - the x-axis itself is a `time` axis, so the
  // series carries its own [date, value] pairs rather than indexing into a category list.
  const dates = data?.map((item) => item.date) ?? [];
  const dayBoundaries = getDayBoundaryTimestamps(dates);

  const options: EChartsOption = {
    title: {
      text: t('windDirection'),
      left: 'center',
      top: "7%",
      textStyle: {
        color: textColour,
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: tooltipFormatter
    },
    grid: {
      left: gridLeft,
      bottom: '30%',
      right: gridRight,
    },
    xAxis: {
      // `time` (not `category`) so points are spaced by actual elapsed time - the
      // forecast's hourly near-term data and 6-hourly tail otherwise would have looked like
      // they cover the same width per point, squeezing later days visually.
      type: 'time',
      axisLabel: {
        formatter: (value: number) => formatAxisDateLabel(value, i18n.language),
        hideOverlap: true,
        color: textColour,
        rich: {
          day: { fontWeight: 'bold', color: textColour, lineHeight: 16 },
          time: { color: textColour, fontSize: 10, lineHeight: 14 },
        },
      },
    },
    yAxis: {
      name: "[" + t('degrees') + "]",
      max: 360,
      nameTextStyle: {
        color: textColour,
      },
    },
    toolbox: {
      right: 0,
      textStyle: {
        color: textColour,
      },
      feature: {
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
      textStyle: {
        color: textColour,
      },
      top: 30,
      right: 0,
      pieces: windDirectionDescriptions.map((description) => ({
        gt: description.intervalStart,
        lte: description.intervalStop,
        color: description.colorCode
      })),
      outOfRange: {
        color: '#999'
      },
      show: false,
    },
    series: {
      name: 'Wind Direction',
      type: 'line',
      // ECharts renders `null` entries as a gap in the line (its documented mechanism for
      // missing data points), but its published series.data typings don't include null in
      // the value union - cast to bridge that gap without changing runtime behavior.
      data: (data?.map((item) => [item.date, item.value]) || []) as unknown[] as [string, number][],
      markLine: {
        silent: true,
        lineStyle: {
          color: lineColour
        },
        data: [
          ...windDirectionDescriptions.map((description) => ({
            yAxis: description.intervalStop
          })),
          // Thin vertical line at the first point of each day, so days stay visually
          // distinguishable even where the axis itself only has room for a time label.
          ...dayBoundaries.map((value: number) => ({
            xAxis: value,
            symbol: 'none',
            label: { show: false },
            lineStyle: { color: 'rgba(128, 128, 128, 0.35)', width: 1 },
          })),
        ],
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