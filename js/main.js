let data, scatterPlotVis, treemapVis, votesScorePlotVis, squareBar, uniqueGenres;
let selectedMovies = [];

const dispatcher = d3.dispatch('filterGenre', 'selectMovie', 'deselectMovie'); 

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

    squareBar = new Squarebar (
      {
        parentElement: "#squareBarDiv",
        // Optional: other configurations
      },
      data
    );
    squareBar.updateVis();

    dispatcher.on('selectMovie', function(movie) {
      const index = selectedMovies.indexOf(movie);
      if (index > -1) {
        selectedMovies.splice(index, 1); 
      } else {
        selectedMovies.push(movie);
      }
      scatterPlotVis.highlightPoints(selectedMovies);
      votesScorePlotVis.highlightPoints(selectedMovies);
      squareBar.highlightSquares(selectedMovies);
    });
    dispatcher.on('deselectMovie', function(eventData) {
      if (eventData.length >= 1) {
        var filteredMovies = [];

        for (var i = 0; i < selectedMovies.length; i++) {
          if (eventData.includes(selectedMovies[i].genre)) {
            filteredMovies.push(selectedMovies[i]);
          }
        }
      
        selectedMovies = filteredMovies;
        
        scatterPlotVis.highlightPoints(selectedMovies);
        votesScorePlotVis.highlightPoints(selectedMovies);
        squareBar.highlightSquares(selectedMovies);
      }
    });
  })
  .catch(error => console.error('Error loading the dataset:', error));

function preprocessData(_data) {
    _data.forEach(d => {
      d.year = +d.year;
      if (d.score !== "") {
          d.score = +d.score;
      }
      if (d.votes !== "") {
          d.votes = Math.abs(Number(d.votes)) / 1.0e+6;
      }
      if (d.gross !== "") {
          d.gross = Math.abs(Number(d.gross)) / 1.0e+9;
      }
    });
    
    _data = _data.filter(d => d.score !== "" || d.votes !== "" || d.gross !== "");
    _data = _data.filter(d => d.year >= 2010);

    const genreFrequency = d3.rollup(_data, v => v.length, d => d.genre);
    let genreToFrequencyMap = new Map(genreFrequency);

    _data.sort((a, b) => {
        let genreAFrequency = genreToFrequencyMap.get(a.genre) || 0;
        let genreBFrequency = genreToFrequencyMap.get(b.genre) || 0;
        return genreBFrequency - genreAFrequency; 
    });

    _data = _data.filter(d => genreToFrequencyMap.get(d.genre) > 10)

    return _data;
}

// When filtering by genre (selecting in tree map)
dispatcher.on('filterGenre', function(eventData) {

    genresSelected = eventData
    let filtered_data = data;
    if (eventData.length !== 0) {
      //Retrieve all data that has the genre you selected
      filtered_data = data.filter(d => eventData.includes(d.genre));
    }

    squareBar.selectedGenre = genresSelected
    scatterPlotVis.data = filtered_data
    votesScorePlotVis.data = filtered_data
    squareBar.updateVis()
    scatterPlotVis.updateVis()
    votesScorePlotVis.updateVis()
});

d3.select('#reset-button').on('click', function() {
  selectedMovies = [];
  scatterPlotVis.highlightPoints(selectedMovies);
  votesScorePlotVis.highlightPoints(selectedMovies);
  squareBar.highlightSquares(selectedMovies);
});