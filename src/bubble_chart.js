function bubbleChart() {
  // Constants for sizing
  var width = 1100;
  var height = 600;

  // tooltip for mouseover functionality
  var tooltip = floatingTooltip('gates_tooltip', 240);

  // Locations to move bubbles towards, depending
  // on which view mode is selected.
  var center = { x: width / 2, y: height / 2 };


  var wynikCenters = {
    for: { x: width / 5, y: 2*height / 5 },
    abstained: { x: width/2, y: 2*height / 5 },
    absent: { x: width/2, y: 4 * height / 5 },
    against: { x: 4 * width / 5, y: 2*height / 5 }
  };


  var wynikTitleX = {
    for: width / 5 - 30,
    abstained: width/2,
    absent: width/2,
    against: 4* width / 5 + 15
  };

  var wynikTitleY = {
    for: 80,
    abstained: 80,
    absent: 4*height/5 - 50,
    against: 80
  };


  var forceStrength = 0.05;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }


  var simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', ticked);

  simulation.stop();


  var fillColor = d3.scaleOrdinal()
    .domain(['PiS', 'PO', 'Nowoczesna', 'PSL', 'Kukiz15', 'ED', 'WIS', 'Niezrzeszony'])
    .range(['#e24e42', '#008f95', '#eb6e80', '#6e3667', '#e9b000', '#fa7000', '#776e67', '#6b7a8f']);


  function createNodes(rawData) {

    var myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: 8,
        name: d.nazwisko,
        firstName: d.imie,
        partia: d.partia,
        aborcja: d.aborcja,
        oswiata: d.oswiata,
        emerytura: d.emerytura,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    myNodes.sort(function (a, b) { return b.value - a.value; });

    return myNodes;
  }


  var chart = function chart(selector, rawData) {
    // convert raw data into nodes data
    nodes = createNodes(rawData);

    // Create a SVG element inside the provided selector
    // with desired size.
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    var bubblesE = bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return fillColor(d.partia); })
      .attr('stroke', function (d) { return d3.rgb(fillColor(d.partia)).darker(); })
      .attr('stroke-width', 2)
      .attr("data-legend",function(d) { return d.partia})
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    bubbles = bubbles.merge(bubblesE);


    bubbles.transition()
      .duration(2000)
      .attr('r', function (d) { return d.radius; });

    simulation.nodes(nodes);

    groupBubbles();
  };

  function ticked() {
    bubbles
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
  }

  function nodeAborcjaPos(d) {
    return wynikCenters[d.aborcja].x;
  }

  function nodeAborcjaPos2(d) {
    return wynikCenters[d.aborcja].y;
  }

  function nodeOswiataPos(d) {
    return wynikCenters[d.oswiata].x;
  }

  function nodeOswiataPos2(d) {
    return wynikCenters[d.oswiata].y;
  }

  function nodeEmeryturaPos(d) {
    return wynikCenters[d.emerytura].x;
  }

  function nodeEmeryturaPos2(d) {
    return wynikCenters[d.emerytura].y;
  }

  function groupBubbles() {
    hideWynikTitles();

    simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
    simulation.force('y', d3.forceY().strength(forceStrength).y(center.y));

    simulation.alpha(1).restart();
  }

  function splitBubbles() {
    showWynikTitles();

    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeAborcjaPos));
    simulation.force('y', d3.forceY().strength(forceStrength).y(nodeAborcjaPos2));

    simulation.alpha(1).restart();
  }

    function splitBubbles2() {
    showWynikTitles();

    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeOswiataPos));
    simulation.force('y', d3.forceY().strength(forceStrength).y(nodeOswiataPos2));

    simulation.alpha(1).restart();
  }

    function splitBubbles3() {
    showWynikTitles();

    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeEmeryturaPos));
    simulation.force('y', d3.forceY().strength(forceStrength).y(nodeEmeryturaPos2));

    simulation.alpha(1).restart();
  }


  function hideWynikTitles() {
    svg.selectAll('.wynik').remove();
  }


  function showWynikTitles() {

    var wynikData = d3.keys(wynikTitleX);
    var wyniki = svg.selectAll('.wynik')
      .data(wynikData);

    wyniki.enter().append('text')
      .attr('class', 'wynik')
      .attr('x', function (d) { return wynikTitleX[d]; })
      .attr('y', function (d) { return wynikTitleY[d]; })
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }


  function showDetail(d) {
    d3.select(this).attr('stroke', '#F61A30');

    var content = '<span class="name">Name: </span><span class="value">' +
                  d.firstName +
                  '</span><br/>' +
                  '<span class="name">Surname: </span><span class="value">' +
                  d.name +
                  '</span><br/>' +
                  '<span class="name">Party: </span><span class="value">' +
                  d.partia +
                  '</span>';

    tooltip.showTooltip(content, d3.event);
  }

  /*
   * Hides tooltip
   */
  function hideDetail(d) {
    // reset outline
    d3.select(this)
      .attr('stroke', d3.rgb(fillColor(d.partia)).darker());

    tooltip.hideTooltip();
  }


  chart.toggleDisplay = function (displayName) {
    if (displayName === 'aborcja') {
      splitBubbles();
    } else if (displayName === 'oswiata') {
      splitBubbles2();
    } else if (displayName === 'emerytura') {
      splitBubbles3();
    } else {
      groupBubbles();
    }
  };


  // return the chart function from closure.
  return chart;
}


var myBubbleChart = bubbleChart();

function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#vis', data);
}

/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */
function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });
}

/*
 * Helper function to convert a number into a string
 * and add commas to it to improve presentation.
 */
function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}


// Load the data.
d3.csv('data/ustawa3.csv', display);

// setup the buttons.
setupButtons();

