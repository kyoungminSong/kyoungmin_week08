import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
// svg
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height")); //너비와 높이 정의
const margin = { top: 20, right: 10, bottom: 100, left: 10 };

// scale
const xScale = d3
  .scaleBand()
  .range([margin.left, width - margin.right])
  .paddingInner(0.1); //바 차트 사이의 간격

const colorScale = d3
  .scaleSequential()
  .domain([-0.8, 0.8])
  .interpolator(d3.interpolatePuOr);

const xLegendScale = d3
  .scaleBand()
  .range([width / 2 - 140, width / 2 + 140])
  .paddingInner(0.1);

// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
// data
let rects, legendRects, legendLabels;
let data = [];
let legendData;
let xAxis;

d3.csv("data/temperature-anomaly-data.csv") //데이터 불러오기
  .then((raw_data) => {
    // console.log(raw_data);

    //DATA PARSING
    data = raw_data
      .filter((d) => d.Entity === "Global")
      .map((d) => {
        const obj = {};
        obj.year = parseInt(d.Year);
        obj.avg =
          +d["Global average temperature anomaly relative to 1961-1990"];
        return obj;
      });

    legendData = d3.range(
      d3.min(data, (d) => d.avg),
      d3.max(data, (d) => d.avg),
      0.2
    );
    // console.log(legendData);

    //XSCALE UPDATE
    xScale.domain(data.map((d) => d.year));

    xAxis = d3
      .axisBottom(xScale)
      .tickValues(xScale.domain().filter((d) => !(d % 10)));
    //10으로 나눴을 때의 나머지 값, 나눴을 때 0(거짓)인 수만 나올 수 있도록, !는 반대라는 의미

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .attr("class", "x-axis")
      .call(xAxis);

    // HEATMAP
    rects = svg
      .selectAll("rects")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.year))
      .attr("y", margin.top)
      .attr("width", xScale.bandwidth())
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", (d) => colorScale(d.avg));

    //LEGEND
    xLegendScale.domain(legendData.map((d, i) => i)); //i는 데이터의 순서 의미

    legendRects = svg
      .selectAll("legend-rects")
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", (d, i) => xLegendScale(i))
      .attr("y", height - margin.bottom + 50)
      .attr("width", xLegendScale.bandwidth())
      .attr("height", 20)
      .attr("fill", (d) => colorScale(d));
  });
