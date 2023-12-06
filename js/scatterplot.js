class ScatterPlot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 830,
      containerHeight: 390,
      margin: {top: 75, right: 20, bottom: 70, left: 35},
      contextMargin: {top: 290, right: 10, bottom: 20, left: 35},
      contextHeight: 75,
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

    // Calculate inner chart size.console Margin specifies the space around the actual chart.
    vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom - vis.config.contextHeight;

    // Initialize scales

    vis.xScale = d3.scaleLinear();
    vis.yScale = d3.scaleLinear();
    vis.xScaleBrush = d3.scaleLinear()
        .range([0, vis.config.width]);
    vis.yScaleBrush = d3.scaleLinear()
        .range([vis.config.contextHeight, 0]);

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

    // Append focus group with x- and y-axes
    vis.brushGroup = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.contextMargin.left},${vis.config.contextMargin.top})`);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('height', 200)
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis');

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('y', 100)
        .attr('class', 'axis y-axis');

    // Brush axis
    vis.xAxisBrush = d3.axisBottom(vis.xScaleBrush)
        .tickSizeOuter(0)
        .ticks(6)
        .tickPadding(10)
        .tickFormat(d => d + vis.config.xTick);

    vis.title = vis.svg.append('text')
        .attr('class', 'chart-title')
        .attr('dy', '.71em')
        .attr('x', 0)
        .attr('y', 5)
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

    vis.xAxisBrushG = vis.brushGroup.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.config.contextHeight})`);

    vis.brushG = vis.brushGroup.append('g')
        .attr('class', 'brush x-brush');

    dispatcher.on('selectMovie.scatterplot', movieName => {
      this.highlightPoints(movieName.name);
    });

      vis.updateVis();

  }

  /**
   * Set the size of the SVG container, and prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

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

    vis.xScaleBrush
        .domain([0, d3.max(vis.data, vis.config.xValue)]);
    vis.yScaleBrush
        .domain([0, d3.max(vis.data, vis.config.yValue)]);


    vis.renderVis();
  }

  /**
   * Bind data to visual elements.
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

    // Add circles
    vis.circles = vis.chart.selectAll('.point')
        .data(vis.data, d => d.name)
      .join('circle')
        .attr('class', 'point')
        .attr('r', 4)
        .attr('cy', d => vis.yScale(vis.config.yValue(d)))
        .attr('cx', d => vis.xScale(vis.config.xValue(d)))
        .attr("fill", (d) => {
          return genreColour[d.genre] || "#dbdb8d"
        })
        .on('click', d => {
          dispatcher.call('selectMovie', null, d);
        });

    // Tooltip event listeners
    vis.circles
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
                <li>Revenue: ${d.gross.toFixed(2) + " M"}</li>
                <li>Score: ${d.score}</li>
              </ul>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        })
        .on('click', (event, d) => {
          dispatcher.call('selectMovie', null, d);  
        });

    //draw points on slider
    vis.brushGroup.selectAll('.pointBrush')
        .data(vis.data, d => d.name)
        .join('circle')
        .attr('class', 'pointBrush')
        .attr('r', 2)
        .attr("fill", (d) => {
          return genreColour[d.genre] || "#dbdb8d"
        })
        .attr('cy', d => vis.yScaleBrush(vis.config.yValue(d)))
        .attr('cx', d => vis.xScaleBrush(vis.config.xValue(d)));

    // Initialize brush component
    vis.brush = d3.brushX()
        .extent([[-2, 0], [vis.config.width, vis.config.contextHeight]])
        .on('brush', function({selection}) {
          if (selection) vis.brushed(selection);
        })
        .on('end', function({selection}) {
          if (!selection) vis.brushed(null);
        });

    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG
        .call(vis.xAxis)
        .call(g => g.select('.domain').remove());

    vis.yAxisG
        .call(vis.yAxis)
        .call(g => g.select('.domain').remove())

    vis.xAxisBrushG.call(vis.xAxisBrush);

    // Update the brush and define a default position
    const defaultBrushSelection = [vis.xScale(0) -2, vis.xScaleBrush.range()[1] + 2];
    vis.brushG
        .call(vis.brush)
        .call(vis.brush.move, defaultBrushSelection);
  }
  
  highlightPoints(movieNames) {
    this.chart.selectAll('.point')
      .classed('highlighted', d => movieNames.includes(d));

    this.chart.selectAll('.highlighted')
        .raise();
  }

  unhighlightPoints() {
    this.chart.selectAll('.point')
      .classed('highlighted', false);
  }


  brushed(selection) {
    let vis = this;

    // Check if the brush is still active or if it has been removed
    if (selection) {
      // Convert given pixel coordinates
      const selectedDomain = selection.map(vis.xScaleBrush.invert, vis.xScaleBrush);

      // Update x-scale of the focus view accordingly
      vis.xScale.domain(selectedDomain);
    } else {
      // Reset x-scale of the focus view (full time period)
      vis.xScale.domain(vis.xScaleBrush.domain());
    }

    // Redraw circles and update x-axis labels
    vis.circles
        .attr('cy', d => vis.yScale(vis.config.yValue(d)))
        .attr('cx', d => vis.xScale(vis.config.xValue(d)));
    vis.xAxisG.call(vis.xAxis);
  }
}