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

//////////////////////////////////////  //////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
// data
let rects, legendRects, legendLabels, unit;
let data = [];
let legendData;
let xAxis;
let yAxis;
let location;

let lowSelected = false;
let highSelected = false;

d3.csv("data/final_data_update.csv") //데이터 불러오기
  .then((raw_data) => {
    // console.log(raw_data);
    data = raw_data.map((d) => {
      d.year = parseInt(d.year);
      d.emissions = parseInt(d.emissions);
      return d;
    });
    // console.log(data);

    location = [...new Set(data.map((d) => d.location))];

    // console.log(location);

    legendData = d3.range(
      d3.min(data, (d) => d.emissions),
      d3.max(data, (d) => d.emissions)
    );

    // console.log(legendData);

    // parsing&formatting
    // const formatColorScale = d3.format("~s");

    // scale

    const xScale = d3
      .scaleBand()
      .range([margin.left, width - margin.right])
      .paddingInner(0.1);

    const yScale = d3
      .scaleBand()
      .domain(location)
      .range([height - margin.bottom, 0])
      .padding(0.15);

    const colorScale = d3
      .scaleSequential()
      .range([d3.extent])
      .domain([0, 30])
      .interpolator(d3.interpolateGnBu);

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
    yScale.domain(location);

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

    // legendLabels = svg
    //   .selectAll("legend-labels")
    //   .data(legendData)
    //   .enter()
    //   .append("text")
    //   .attr("x", (d, i) => xLegendScale(i) + xLegendScale.bandwidth() / 2) //텍스트가 중앙에 오도록
    //   .attr("y", height - margin.bottom + 75)
    //   .text((d) => d3.format("~s")(d))
    //   .attr("class", "legend-labels")
    //   .style("fill", (d) => (d >= 16.0 ? "lightgray" : "black")); // 0.5보다 작으면 텍스트 흰색으로

    // unit //
    unit = svg
      .append("text")
      .text("(ton)")
      .attr("x", xLegendScale(legendData.length - 1) + 45)
      .attr("y", height - margin.bottom + 75)
      .attr("fill", "gray")
      .attr("class", "legend-labels");

    //Button//

    //1.low-income//
    d3.select("#button-low").on("click", () => {
      lowSelected = !lowSelected;
      highSelected = false;

      d3.select("#text-desc").text("Low-income countries selected");

      d3.select("#button-low").classed("button-clicked", lowSelected);
      d3.select("#button-high").classed("button-clicked", false);

      rects.attr("fill", (d) => {
        if (lowSelected) {
          return d.group == "low" ? colorScale(d.emissions) : "rgba(0,0,0,0.1)";
        } else {
          return colorScale(d.emissions);
        }
      });
    });

    //2.high//
    d3.select("#button-high").on("click", () => {
      highSelected = !highSelected;
      lowSelected = false;

      d3.select("#text-desc").text("High-income countries selected");

      d3.select("#button-high").classed("button-clicked", highSelected);
      d3.select("#button-low").classed("button-clicked", false);

      rects.attr("fill", (d) => {
        if (highSelected) {
          return d.group == "high"
            ? colorScale(d.emissions)
            : "rgba(0,0,0,0.1)";
        } else {
          return colorScale(d.emissions);
        }
      });
      s;
    });

    ///mouseover//
    // const tooltip = d3
    //   .select("#svg-container")
    //   .append("div")
    //   .style("opacity", 0.5)
    //   .attr("class", "tooltip")
    //   .style("position", "absolute")
    //   .style("background", "white")
    //   .style("border", "solid")
    //   .style("border-width", "2px")
    //   .style("padding", "5px");

    // const mouseover = function (event, d) {
    //   tooltip.style("opacity", 1);
    // };

    // const mousemove = function (event, d) {
    //   tooltip
    //     .html("The exact value of<br>this cell is: " + d.emissions)
    //     .style("left", event.x / 2 + "px")
    //     .style("top", event.y / 2 + "px");
    // };
    // const mouseleave = function (d) {
    //   tooltip.style("opacity", 0);
    // };
  });

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
