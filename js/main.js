let data, scatterPlotVis, treemapVis, votesScorePlotVis;

const dispatcher = d3.dispatch('event1', 'event2'); // Replace events with event names

d3.csv("data/movies.csv")
  .then(_data => {
    data = preprocessData(_data);

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

    treeMap = new TreeMap({ parentElement: '#treemapDiv' }, data, dispatcher);
    treeMap.updateVis();

    const squarebar = new Squarebar (
      {
        parentElement: "#squareBarDiv",
        // Optional: other configurations
      },
      data
    );
    squarebar.updateVis();
  })
  .catch(error => console.error('Error loading the dataset:', error));

function preprocessData(_data) {
    _data.forEach(d => {
        d.year = +d.year;
        d.score = +d.score;
        d.votes = Math.abs(Number(d.votes)) / 1.0e+6;
        d.gross = Math.abs(Number(d.gross)) / 1.0e+9;
    });

    _data = _data.filter(d => d.year >= 2010);

    const genreFrequency = d3.rollup(_data, v => v.length, d => d.genre);

    console.log("Genre Frequencies:", genreFrequency);


    let genreToFrequencyMap = new Map(genreFrequency);

    _data.sort((a, b) => {
        let genreAFrequency = genreToFrequencyMap.get(a.genre) || 0;
        let genreBFrequency = genreToFrequencyMap.get(b.genre) || 0;
        return genreBFrequency - genreAFrequency; 
    });
    console.log("First few sorted records:", _data.slice(0, 10));
    console.log("all data points", _data);
    return _data;
}

dispatcher.on('event1', function(someParameter) {
    // scatterPlotVis.updateVis();
    // etc.
});
