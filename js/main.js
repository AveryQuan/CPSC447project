
let data, scatterPlotVis, treemapVis, votesScorePlotVis;

const dispatcher = d3.dispatch('event1', 'event2'); // Replace events with event names

d3.csv("data/movies.csv") 
  .then(_data => {
      console.log(_data)
    data = preprocessData(_data);

    console.log(data)
      scatterPlotVis = new ScatterPlot({
          parentElement: '#scatterPlotDiv',
          xValue: d => d.gross,
          yValue: d => d.score,
          title: "Movie Score vs Revenue",
          xTitle: "Movie Revenue (in Billions)",
          yTitle: "Movie Score",
          xTick: " B"
        }, data);
      scatterPlotVis.updateVis();

      votesScorePlotVis = new ScatterPlot({
          parentElement: '#votesScorePlotDiv',
          xValue: d => d.votes,
          yValue: d => d.score,
          title: "Number of Votes vs Movie Score",
          xTitle: "Number of Votes (in Millions)",
          yTitle: "Movie Score",
          xTick: " M"
        }, data);
      votesScorePlotVis.updateVis();

    // treemapVis = new Treemap({
    //   parentElement: '#treemapDiv',
    //   //other config
    // }, data);
    // treemapVis.updateVis();

  })
  .catch(error => console.error('Error loading the dataset:', error));

function preprocessData(_data) {
    console.log(_data)
    _data.forEach(d => {
        d.year = +d.year;
        d.score = +d.score;
        d.votes = Math.abs(Number(+d.votes)) / 1.0e+6;
        d.gross = Math.abs(Number(+d.gross)) / 1.0e+9;
    });
    console.log(_data)
    return _data.filter(d => d.year >= 2010);
}

dispatcher.on('event1', function(someParameter) {
    // scatterPlotVis.updateVis();
    //etc.
});
