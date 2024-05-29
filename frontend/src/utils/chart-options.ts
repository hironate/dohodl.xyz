import { ApexOptions } from "apexcharts";

export const areaChartOptions: ApexOptions = {
  legend: {
    show: false,
  },
  colors: ["#3C50E0", "#80CAEE"],
  chart: {
    fontFamily: "Satoshi, sans-serif",
    height: 335,
    type: "area",
    dropShadow: {
      enabled: true,
      color: "#623CEA14",
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1,
    },

    toolbar: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          height: 300,
        },
      },
    },
    {
      breakpoint: 1366,
      options: {
        chart: {
          height: 350,
        },
      },
    },
  ],
  stroke: {
    width: [2, 2],
    curve: "straight",
  },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 4,
    colors: "#fff",
    strokeColors: ["#3056D3", "#80CAEE"],
    strokeWidth: 3,
    strokeOpacity: 0.9,
    strokeDashArray: 0,
    fillOpacity: 1,
    discrete: [],
    hover: {
      size: undefined,
      sizeOffset: 5,
    },
  },
  xaxis: {
    type: "datetime",

    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    title: {
      style: {
        fontSize: "0px",
      },
    },
  },
};

export const tickColors = [
  "#6577F3",
  "#3C50E0",
  "#0FADCF",
  "#0096c7",
  "#3a86ff",
  "#8FD0EF",
];

export const ResponsivPieChartOpetionForCard: ApexOptions = {
  responsive: [
    {
      breakpoint: 770,
      options: {
        chart: {
          width: 300,
        },
        legend: {
          offsetY: 0,
        },
      },
    },
    {
      breakpoint: 2600,
      options: {
        chart: {
          width: 150,
        },
      },
    },
  ],
};

export const PieChartOption: ApexOptions = {
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "donut",
    width: "fit",
  },
  colors: tickColors,
  legend: {
    show: false,
  },

  plotOptions: {
    pie: {
      donut: {
        size: "65%",
        background: "transparent",
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 2600,
      options: {
        chart: {
          width: 350,
        },
      },
    },
    {
      breakpoint: 1700,
      options: {
        chart: {
          width: 300,
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 200,
        },
      },
    },
  ],
  grid: {
    padding: {
      left: 0,
      right: 0,
    },
  },
};
