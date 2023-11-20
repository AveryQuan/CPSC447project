/**
 * Load data from CSV file asynchronously and render scatter plot
 */
let data, scatterplot1, scatterplot2;
d3.csv('data/movies.csv')
  .then(_data => {
    data = _data;
    data.forEach(d => {
      d.score = +d.score;
      d.votes = Math.abs(Number(+d.votes)) / 1.0e+6;
      d.runtime = +d.runtime;
      d.gross = Math.abs(Number(+d.gross)) / 1.0e+9;
    });
    
    scatterplot1 = new Scatterplot({
        parentElement: '#scatterplot1',
        xValue: d => d.gross,
        yValue: d => d.score,
        title: "Movie Score vs Revenue",
        xTitle: "Movie Revenue (in Billions)",
        yTitle: "Movie Score",
        xTick: " B"
    }, data);
    scatterplot1.updateVis();

    scatterplot2 = new Scatterplot({
        parentElement: '#scatterplot2',
        xValue: d => d.votes,
        yValue: d => d.score,
        title: "Number of Votes vs Movie Score",
        xTitle: "Number of Votes (in Millions)",
        yTitle: "Movie Score",
        xTick: " M"
        }, data);
    scatterplot2.updateVis();
  })
  .catch(error => console.error(error));


/**
 * Event listeners
 */

// Use colour legend as filter
d3.selectAll('.legend-btn').on('click', function() {
  // Toggle 'inactive' class
  d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));
  
  // Check which categories are active
  let selectedDifficulty = [];
  d3.selectAll('.legend-btn:not(.inactive)').each(function() {
    selectedDifficulty.push(d3.select(this).attr('data-difficulty'));
  });

  // Filter data accordingly and update vis
  scatterplot.data = data.filter(d => selectedDifficulty.includes(d.difficulty));
  scatterplot.updateVis();
});

// Listen to window resize event and update the chart. 
// This event gets triggered on page load too so we set a flag to prevent updating the chart initially
let pageLoad = true;
d3.select(window).on('resize', () => {
  if (pageLoad) {
    pageLoad = false;
  } else {
    scatterplot.updateVis()
  }
});