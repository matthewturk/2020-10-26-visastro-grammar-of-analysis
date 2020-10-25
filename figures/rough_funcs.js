// Needs to be included after roughjs and d3-path-interpolate:
//
// <script src="https://cdn.jsdelivr.net/npm/d3-interpolate-path@2.1.2/build/d3-interpolate-path.min.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/roughjs@4.2.3/bundled/rough.min.js"></script>
//
// Example usage:
//
//   const svg = d3.create("svg")
//   .attr("height", 250)
//   .attr("width", 250)
//   .attr("viewBox", [0, 0, 250, 250]);
//   const myData = [
//     40, 80, 100, 200, 10, 30
//   ];
//   const rc = rough.svg(svg);
//   let generator = rc.generator;
//   var paths = [];
//   svg.selectAll("g")
//     .data(myData)
//     .enter()
//     .each( (d, i) => {
//     var e = rc.draw(generator.rectangle(
//       10, i * 30 + 10, d, 20, {fillWeight: 0.7, fill: "steelblue", fillStyle: "cross-hatch", roughness: 2}))
//     paths.push(splitRoughElement(e));
//   });
//   svg.selectAll("g")
//     .data(paths)
//     .enter()
//     .append("g")
//     .each( (d, i, n) => {
//     d3.select(n[i])
//       .selectAll("path")
//       .data(d)
//       .enter()
//       .append("path")
//       .attr("d", d => d.d)
//       .attr("style", d => d.style);
//   });
//   progressiveDraw(svg.selectAll("path"), 3);

function progressiveDraw(baseSelection, factor) {
  var lengths = baseSelection.nodes().map( n => n.getTotalLength() );
  // https://stackoverflow.com/questions/20477177/creating-an-array-of-cumulative-sum-in-javascript
  var cumulativeLengths = lengths.map((sum => value => sum += value)(0));
  var totalLength = cumulativeLengths[lengths.length - 1];
  return baseSelection
    .attr("stroke-dasharray", (d, i, nl) => " " + lengths[i] + " " + lengths[i])
    .attr("stroke-dashoffset", (d, i, nl) => lengths[i])
    .transition()
    .delay( (d, i) => cumulativeLengths[i] * factor)
    .duration( (d, i) => lengths[i] * factor)
    .attr("stroke-dashoffset", 0).end();
}

function splitRoughElement(roughElement) {
  // This accepts a "generated" item that has not been appended to an SVG element, but which has been "drawn."
  // It returns a set of split-up paths, along with path information.
  var paths = [];
  var indices = d3.range(d3.select(roughElement).selectAll("path").size()).reverse();
  d3.select(roughElement).selectAll("path").data(indices).sort().each( (d, i, nl) => {
    nl[i].getAttribute("d").split(/[M]/)
      .slice(1)
      .forEach( p => paths.push(
      {'d': "M" + p,
       'style': nl[i].style.cssText}
    ))
  });
  return paths;
}
