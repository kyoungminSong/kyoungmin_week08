import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
// svg
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height")); //너비와 높이 정의
const margin = { top: 20, right: 10, bottom: 100, left: 100 };

// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
// data
let rects, legendRects, legendLabels, unit;
let data = [];
let legendData;
let xAxis;
let yAxis;

const myLocation = [
  "North America",
  "Oceania",
  "Europe",
  "World",
  "Asia",
  "South America",
  "Africa",
];

d3.csv("data/co-emissions-per-capita.csv") //데이터 불러오기
  .then(function (data) {
    console.log(data);

    legendData = d3.range(0, 20, 1);
    // (
    //   d3.min(data, (d) => d.emissions),
    //   d3.max(data, (d) => )
    // );

    console.log(legendData);

    // scale

    const xScale = d3
      .scaleBand()
      .range([margin.left, width - margin.right])
      .paddingInner(0.1); //바 차트 사이의 간격

    const yScale = d3
      .scaleBand()
      .domain(myLocation)
      .range([height - margin.bottom, 0])
      .padding(0.15); //바 차트 사이의 간격

    const colorScale = d3
      .scaleSequential()
      .domain([0, 20])
      .interpolator(d3.interpolateYlGnBu);

    const xLegendScale = d3
      .scaleBand()
      .range([width / 2 - 200, width / 2 + 300])
      .paddingInner(0.1);

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

    //YSCALE UPDATE
    // yScale.domain(data.map((d) => d.location));

    yAxis = d3.axisLeft(yScale);

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .attr("class", "y-axis")
      .call(yAxis);

    // HEATMAP //
    rects = svg
      .selectAll("rects")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(d.location))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(d.emissions));

    //LEGEND//
    xLegendScale.domain(legendData.map((d, i) => i)); //i는 데이터의 순서 의미

    legendRects = svg
      .selectAll("legend-rects")
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", (d, i) => xLegendScale(i))
      .attr("y", height - margin.bottom + 60)
      .attr("width", xLegendScale.bandwidth())
      .attr("height", 20)
      .attr("fill", (d) => colorScale(d));

    legendLabels = svg
      .selectAll("legend-labels")
      .data(legendData)
      .enter()
      .append("text")
      .attr("x", (d, i) => xLegendScale(i) + xLegendScale.bandwidth() / 2) //텍스트가 중앙에 오도록
      .attr("y", height - margin.bottom + 75)
      .text((d) => d3.format("0.0f")(d))
      .attr("class", "legend-labels")
      .style("fill", (d) => (d >= 16.0 ? "lightgray" : "black")); // 0.5보다 작으면 텍스트 흰색으로

    // unit //
    unit = svg
      .append("text")
      .text("(ton)")
      .attr("x", xLegendScale(legendData.length - 1) + 45)
      .attr("y", height - margin.bottom + 75)
      .attr("fill", "gray")
      .attr("class", "legend-labels");

    ///mouseover//
    const tooltip = d3
      .select("#svg-container")
      .append("div")
      .style("opacity", 0.5)
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("padding", "5px");

    const mouseover = function (event, d) {
      tooltip.style("opacity", 1);
    };

    const mousemove = function (event, d) {
      tooltip
        .html("The exact value of<br>this cell is: " + d.emissions)
        .style("left", event.x / 2 + "px")
        .style("top", event.y / 2 + "px");
    };
    const mouseleave = function (d) {
      tooltip.style("opacity", 0);
    };
  });

/////moseover/////

//   const mouseover = function (event, d) {
//   tooltip.style("opacity", 1);
//   d3.select(this).style("stroke", "black").style("opacity", 1);
// };
// const mousemove = function (event, d) {
//   tooltip
//     .html("Value: ${d.emissions}<br/>")
//     .style("left", event.x / 2 + "px")
//     .style("top", event.y / 2 + "px");
// };
// const mouseleave = function (event, d) {
//   tooltip.style("opacity", 0);
//   d3.select(this).style("stroke", "none").style("opacity", 0.8);
// };

///resize///
window.addEventListener("resize", () => {
  //  width, height updated
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));

  //  scale updated
  xScale.range([margin.left, width - margin.right]);
  yScale.range([height - margin.bottom, 0]);
  xLegendScale.range([width / 2 - 200, width / 2 + 300]);

  // heatmap
  rects
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.location))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth());

  // legend
  legendRects
    .attr("x", (d, i) => xLegendScale(i))
    .attr("y", height - margin.bottom + 60)
    .attr("width", xLegendScale.bandwidth())
    .attr("height", 20);

  legendLabels
    .attr("x", (d, i) => xLegendScale(i) + xLegendScale.bandwidth() / 2)
    .attr("y", height - margin.bottom + 75);

  //  unit
  unit
    .attr("x", xLegendScale(legendData.length - 1) + 50)
    .attr("y", height - margin.bottom + 75);

  //  axis updated
  d3.select(".x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  d3.select(".y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);
});
