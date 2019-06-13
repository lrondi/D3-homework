
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);


var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = 'healthcare';

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);

  return xLinearScale;

}

function yScale(healthData, chosenYAxis){

  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.3,
      d3.max(healthData, d => d[chosenYAxis]) *1.2])
      .range([height,0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis){
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr('cy', d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating state text group with a transition to new text 
function renderText (textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis){
  textGroup.transition()
  .duration(1000)
  .attr('x', d => newXScale(d[chosenXAxis]))
  .attr('y', d => newYScale(d[chosenYAxis]));

  return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var xlabel = "% in poverty: ";
  }
  else {
    var xlabel = "Age (median): ";
  };

  if (chosenYAxis === 'smokes'){
    var ylabel = '% of smokers: '
  }
  else{
    var ylabel = '% without healthcare: '
  };

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([60, -60])
    .html(function(d) {
      return (`<b>${d.state}</b><br>${xlabel}${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);
  
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data, this);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file 
d3.csv("assets/data/data.csv", function(err, healthData) {
  if (err) throw err;

  // parse data
  healthData.forEach(function(row) {
    row.healthcare = +row.healthcare;
    row.poverty = +row.poverty;
    row.smokes = +row.smokes;
    row.age = +row.age;
  });

  // xLinearScale and yLinearScale functions above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);
  var yLinearScale = yScale(healthData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed('y-axis', true)
    .call(leftAxis);


  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr('class', 'stateCircle');
  
  // append initial state text
  var textGroup = chartGroup.append("text")
    .selectAll("tspan")
    .data(healthData)
    .enter()
    .append("tspan")
    .attr("x", function(d) {
            return xLinearScale(d[chosenXAxis]);
        })
    .attr("y", function(d) {
            return yLinearScale(d[chosenYAxis] - 0.3);
        })
    .text(function(d) {
            return d.abbr;
        })
    .attr('class', 'stateText');

  // Create group for  2 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("% in poverty");

    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (median)");

  // Create group for  2 y- axis labels  
  var ylabelsGroup = chartGroup. append('g')
    .attr('transform', 'rotate(-90)')

    var healthcareLabel = ylabelsGroup.append('text')
        .attr('x', 0 - (height/2))
        .attr('y', 0 - margin.left)
        .attr('value', 'healthcare')
        .attr('dy', '1em')
        .classed('active', true)
        .text('% without healthcare')
    
    var smokeLabel = ylabelsGroup.append('text')
        .attr('x', 0 - (height/2))
        .attr('y', 0 - margin.left + 20)
        .attr('value', 'smokes')
        .attr('dy', '1em')
        .classed('inactive', true)
        .text('% smokers')
      
  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis){
        chosenXAxis = value;

        xLinearScale = xScale(healthData, chosenXAxis);
        xAxis = renderXAxes(xLinearScale, xAxis);
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  // y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis){
        chosenYAxis = value;

        yLinearScale = yScale(healthData, chosenYAxis);
        yAxis = renderYAxes(yLinearScale, yAxis);
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});
