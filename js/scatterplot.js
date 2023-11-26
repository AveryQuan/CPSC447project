class ScatterPlot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 400,
      margin: {top: 75, right: 20, bottom: 20, left: 35},
      tooltipPadding: 15,
      xValue: _config.xValue,
      yValue: _config.yValue,
      title: _config.title,
      xTitle: _config.xTitle,
      yTitle: _config.yTitle,
      xTick: _config.xTick,
    }
    this.data = _data;
    this.initVis();
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Initialize scales

    vis.xScale = d3.scaleLinear();
    vis.yScale = d3.scaleLinear();

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(6)
        .tickPadding(10)
        .tickFormat(d => d + vis.config.xTick);

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(6)
        .tickPadding(10);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg');

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis');

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('y', 100)
        .attr('class', 'axis y-axis');

    vis.title = vis.svg.append('text')
        .attr('class', 'chart-title')
        .attr('dy', '.71em')
        .attr('x', 0)
        .attr('y', 0)
        .style('text-anchor', 'left')
        .text(vis.config.title);

    // Append both axis titles
    vis.xAxisTitle = vis.chart.append('text')
        .attr('class', 'axis-title')
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(vis.config.xTitle);

    vis.yAxisTitle = vis.chart.append('text')
        .attr('class', 'axis-title')
        .attr('x', -20)
        .attr('y', -20)
        .attr('dy', '.71em')
        .text(vis.config.yTitle);

        dispatcher.on('selectMovie.scatterplot', movieName => {
          console.log('ScatterPlot highlighting:', movieName);
          this.highlightPoint(movieName);
        });

      vis.updateVis();
  }

  /**
   * Set the size of the SVG container, and prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.svg
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.xAxisG
        .attr('transform', `translate(0,${vis.config.height})`);

    vis.xAxisTitle
        .attr('y', vis.config.height - 15)
        .attr('x', vis.config.width + 10);

    vis.xAxis
        .tickSize(-vis.config.height - 10);

    vis.yAxis
        .tickSize(-vis.config.width - 10);

    // Set the scale input domains
    vis.xScale
        .range([0, vis.config.width])
        .domain([0, d3.max(vis.data, vis.config.xValue)]);

    vis.yScale
        .range([vis.config.height, 0])
        .domain([0, d3.max(vis.data, vis.config.yValue)]);

        console.log('Example data item in ScatterPlot:', vis.data[1]); // Add this line


    vis.renderVis();
  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;

    // Add circles
    const circles = vis.chart.selectAll('.point')
        .data(vis.data, d => d.name)
      .join('circle')
        .attr('class', 'point')
        .attr('r', 4)
        .attr('cy', d => vis.yScale(vis.config.yValue(d)))
        .attr('cx', d => vis.xScale(vis.config.xValue(d)))
        .on('click', d => {
          dispatcher.call('selectMovie', null, d.name);
        });

    // Tooltip event listeners
    circles
        .on('mouseover', (event,d) => {
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
              <div class="tooltip-title">${d.name}</div>
              <div><i>${d.director}</i></div>
              <ul>
                <li>Votes: ${d.votes + " M"}</li>
                <li>Year: ${d.year}</li>
                <li>Revenue: ${d.gross.toFixed(2) + " B"}</li>
                <li>Score: ${d.score}</li>
              </ul>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        })
        .on('click', d => {
          console.log('ScatterPlot clicked:', d.name); // Logging the clicked movie name
          dispatcher.call('selectMovie', null, d.name);  // Assuming 'name' is the unique identifier
        });

    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG
        .call(vis.xAxis)
        .call(g => g.select('.domain').remove());

    vis.yAxisG
        .call(vis.yAxis)
        .call(g => g.select('.domain').remove())

  }
  highlightPoint(movieName) {
    console.log('Highlighting in ScatterPlot:', movieName);
    this.chart.selectAll('.point')
      .classed('highlighted', d => d.name === movieName);
  }
  
  unhighlightPoints() {
    this.chart.selectAll('.point')
      .classed('highlighted', false);
  }
}