let data, scatterPlotVis, treemapVis, votesScorePlotVis;

const dispatcher = d3.dispatch('event1', 'event2'); // Replace events with event names


d3.csv("data/movies.csv") 
  .then(_data => {
    data = preprocessData(_data);

    scatterPlotVis = new ScatterPlot({
      parentElement: '#scatterPlotDiv', 
      //other config
    }, data);
    scatterPlotVis.updateVis();

    treemapVis = new Treemap({
      parentElement: '#treemapDiv', 
      //other config
    }, data);
    treemapVis.updateVis();

    votesScorePlotVis = new VotesScorePlot({
      parentElement: '#votesScorePlotDiv', 
      //other config
    }, data);
    votesScorePlotVis.updateVis();

  })
  .catch(error => console.error('Error loading the dataset:', error));

function preprocessData(_data) {
    _data.forEach(d => {
        d.Year = +d.Year; 
        d.Score = +d.Score; 
        d.Gross = d.Gross ? parseFloat(d.Gross.replace(/[^\d.]/g, '')) : null; 
    });

    return _data.filter(d => d.Year >= 2010);
}

dispatcher.on('event1', function(someParameter) {
    // scatterPlotVis.updateVis();
    //etc.
});
