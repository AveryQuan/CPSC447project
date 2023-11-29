let genres;
class TreeMap {
    /**
   * Class constructor with initial configuration
   * @param {Object}
   */
  constructor(_config, data, dispatcher) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 500,
      containerHeight: 380,
      tooltipPadding: 15,
      margin: {
        top: 80,
        right: 40,
        bottom: 20,
        left: 60
      }
    }
    this.data = data;
    this.dispatcher = dispatcher;
    this.initVis();
  }

  initVis() {
    let vis = this;
    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight)
      .attr('id', 'tree-map');

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.title = vis.svg.append('text')
      .attr('class', 'chart-title')
      .attr('dy', '.71em')
      .attr('x', 58)
      .attr('y', 2)
      .style('text-anchor', 'left')
      .text("Distribution of Movie Genres");
    vis.listOfGenres = ['Comedy', 'Action', 'Drama', 'Crime', 'Biography', 'Adventure', 'Animation', 'Horror', 'Fantasy', 'Mystery', 'Thriller', 'Family', 'Sci-Fi', 'Romance', 'Western', 'Musical', 'Music', 'History', 'Sport']
    vis.genreColour = {
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
    vis.colourScale = d3.scaleOrdinal()
        .domain(vis.listOfGenres)
        .range(vis.listOfGenres.map(g => vis.genreColour[g]))

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    genres = d3.rollups(vis.data, v => v.length, d => d.genre)
    vis.genresKeyValue = genres.reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
    // console.log(vis.genresKeyValue)
    genres.sort((a, b) => b[1] - a[1]);

    vis.colourScale.domain(vis.listOfGenres);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;
    const root = d3.hierarchy({ values: genres }, d => d.values).sum(d => d[1]);

    vis.treemapLayout = d3.treemap().size([vis.width, vis.height]);
    vis.treemapLayout(root)

    const rect = vis.chart.selectAll('.tree-map-rect')
    .data(root.children)
    .join('rect')
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('class', 'tree-map-rect')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('fill', d => vis.colourScale(d.data[0]))
    .attr('stroke', 'white')
    .attr('stroke-width', 2);

    rect.on('click', function(event, d) {
      const isSelected = d3.select(this).classed('selected');
      // d3.selectAll('.tree-map-rect.selected').classed('selected', false)
      d3.select(this).classed('selected', !isSelected);
      const eventData = vis.chart.selectAll('.tree-map-rect.selected').data().map(k => k.data[0])

      // console.log(eventData)

      vis.dispatcher.call('filterGenre', event, eventData)
      vis.dispatcher.call('deselectMovie', null, eventData)
    })


    rect.on('mouseover', (event,d) => {
        d3.select('#tooltip')
          .style('display', 'block')
          .html(`
            <div class="tooltip-label">Genre: ${(d.data[0])}</div>
            <i>Count: ${vis.genresKeyValue[d.data[0]]}</i>
            `);
      })
      .on('mousemove', (event) => {
        d3.select('#tooltip')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
      });

    vis.chart.selectAll('text')
    .data(root.descendants())
    .enter()
    .append('text')
    .attr('x', d => (d.x0 + d.x1) / 2)
    .attr('y', d => (d.y0 + d.y1) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(d => d.data.key);

  }
}