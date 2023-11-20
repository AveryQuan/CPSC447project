class Squarebar {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      disasterCategories: _config.disasterCategories,
      containerWidth: 800,
      containerHeight: 500,
      tooltipPadding: 15,
      margin: { top: 400, right: 20, bottom: 20, left: 45 },
      legendWidth: 170,
      legendHeight: 8,
      legendRadius: 5,
    };
    this.data = _data;
    this.selectedCategories = [];
    this.initVis();
  }

  /**
   * We initialize the arc generator, scales, axes, and append static elements
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Todo: Initialize scales and axes
    vis.yScale = d3.scaleLinear().range([vis.height, 0]);

    vis.xScale = d3.scaleBand().range([0, vis.width]).paddingInner(0.2);

    vis.xAxis = d3.axisBottom(vis.xScale);

    vis.yAxis = d3.axisLeft(vis.yScale).tickSize(-vis.width - 10);

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chartArea = vis.svg
      .append("g")
      .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Todo: Append axis groups
    vis.xAxisG = vis.chartArea.append("g").attr("class", "axis");

    vis.yAxisG = vis.chartArea.append("g").attr("class", "axis");

    // Initialize clipping mask that covers the whole chart
    vis.chartArea
      .append("defs")
      .append("clipPath")
      .attr("id", "chart-mask")
      .append("rect")
      .attr("width", vis.width)
      .attr("y", -vis.config.margin.top)
      .attr("height", vis.config.containerHeight);

    // Apply clipping mask to 'vis.chart' to clip semicircles at the very beginning and end of a year
    vis.chart = vis.chartArea.append("g");

    // Optional: other static elements
    // ...

    vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

    vis.groupedData = d3.groups(vis.data, (d) => d.year);

    vis.xValue = (d) => d[0];

    vis.xScale.domain(vis.groupedData.map(vis.xValue));

    vis.renderVis();

    vis.xAxisG.call(vis.xAxis).call((g) => g.select(".domain"));
  }

  /**
   * Bind data to visual elements (enter-update-exit) and update axes
   */
  renderVis() {
    let vis = this;

    let genreColour = {
      Comedy: "#1f77b4",
      Action: "#ff7f0e",
      Drama: "#2ca02c",
      Crime: "#d62728",
      Biography: "#9467bd",
      Adventure: "#8c564b",
      Animation: "#e377c2",
      Horror: "#7f7f7f",
      Fantasy: "#bcbd22",
      Mystery: "#17becf",
      Thriller: "#aec7e8",
      Family: "#ffbb78",
      "Sci-Fi": "#98df8a",
      Romance: "#ff9896",
      Western: "#c5b0d5",
      Musical: "#c49c94",
      Music: "#f7b6d2",
      History: "#c7c7c7",
      Sport: "#dbdb8d",
    };

    // 1. Level: columns
    const column = vis.chart.selectAll(".column").data(vis.groupedData, (d) => d[0]);

    // Enter
    const columnEnter = column.enter().append("g").attr("class", "column");

    // Update
    columnEnter.merge(column).attr("transform", (d) => `translate(${vis.xScale(vis.xValue(d))}, 0)`);

    // Exit
    column.exit().remove();

    // 2. Level: squares within each column

    // Each square
    const squares = column
      .merge(columnEnter)
      .selectAll(".square")
      .data((d) => d[1]);

    // Enter square
    const squareEnter = squares.enter().append("rect").attr("class", "square");

    // Update square attributes
    squareEnter
      .merge(squares)
      .attr("x", (d, i) => {
        let position = i % 5;
        return position * 9 + 5;
      })
      .attr("y", (d, i) => {
        return -Math.ceil((i + 1) / 5) * 8.5;
      })
      .attr("width", "8px")
      .attr("height", "8px")
      .attr("fill", (d) => genreColour[d.genre] || "#dbdb8d")
      .attr("stroke", "#333333")
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => {
        // Darken the border color on hover
        d3.select(event.currentTarget).attr("stroke", "black");
        d3.select(event.currentTarget).attr("stroke-width", 2);
        // Your existing tooltip code
        const value = d.value === null ? "No data available" : Math.round(d.value * 100) / 100;
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
            <div class='tooltip-title'>${d.name}</div>
            <div class='flex-column'>
              <strong>genre: $<strong>${d.genre || "NA"}</strong>&nbsp;</strong>
              <strong>gross: $<strong>${d.gross || "NA"}</strong>&nbsp;</strong>
            </div>
          `);
      })
      .on("mouseleave", (event, d) => {
        // Restore the original border color on mouse leave
        d3.select(event.currentTarget).attr("stroke", "#333333");
        d3.select(event.currentTarget).attr("stroke-width", 1);

        // Hide the tooltip
        d3.select("#tooltip").style("display", "none");
      });

    // Exit square
    squareEnter.exit().remove();
  }

  renderLegend() {
    let vis = this;

    // Todo: Display the disaster category legend that also serves as an interactive filter.
    // You can add the legend also to `index.html` instead and have your event listener in `main.js`.
  }
}
