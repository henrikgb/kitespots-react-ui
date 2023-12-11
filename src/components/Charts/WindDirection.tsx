import {EChartsOption} from "echarts";
import React, {useEffect, useState} from "react";
import {EChartsBase} from "@/components/Charts/EChartsBase";
import {WindDirectionDescriptions} from "@/assets/beachCoordinates";
import {useTranslation} from 'next-i18next';
import useThemeStore from "@/store/themeStore";
import {TooltipFormatterCallback} from "echarts/types/dist/shared";

interface DataObject {
    date: string;
    value: number;
}

interface WindDirectionProps extends EChartsOption {
    data?: DataObject[];
    windDirectionDescriptions: WindDirectionDescriptions[];
}

const WindDirection = ({ data, windDirectionDescriptions, ...opts }: WindDirectionProps) => {
  const {theme} = useThemeStore();
  const [textColour, setTextColour] = useState<string>();
  const [lineColour, setLineColour] = useState<string>();
  const { t } = useTranslation();
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
   * Retrieves the wind direction description based on the given value.
   *
   * This function searches through the `windDirectionDescriptions` array to find a matching
   * description where the given value falls within the defined intervals (intervalStart and intervalStop).
   * It then returns the localized category name for the found description.
   *
   * @param {number} value - The wind direction value to find the description for.
   * @returns {string} The localized description of the wind direction or an empty string if not found.
   */
  const getWindDirectionDescription = (value: number) => {
    const description = windDirectionDescriptions.find(d =>
      value >= d.intervalStart && value <= d.intervalStop
    );
    // Assuming description.category holds values like "sideOnshore", "offshore", etc.
    return description ? t(description.category) : '';
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
    const descriptionText = t("description");

    return `${param.axisValueLabel}<br/>${param.marker}${translatedSeriesName}: ${value} <br/> ${description}`;
  };


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
      bottom: '25%',
      right: gridRight,
    },
    xAxis: {
      data: data?.map((item) => item.date) || [],
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
      data: data?.map((item) => item.value) || [],
      markLine: {
        silent: true,
        lineStyle: {
          color: lineColour
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