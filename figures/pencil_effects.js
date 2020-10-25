// These are adapted from:
// 
// https://heredragonsabound.blogspot.com/2020/02/creating-pencil-effect-in-svg.html
//
//
// An example:
//
// const svg = d3.create("svg").attr("height", 300).attr("width", 300);
// applyPencilFilterTextures(svg);
// svg.append("g")
//    .attr("filter", "url(#roughPaper)")
//    .append("rect")
//    .attr("x", 10)
//    .attr("y", 10)
//    .attr("width", 250)
//    .attr("height", 250)
//    .style("fill", "black")
//    .style("stroke", "black")
//    .style("stroke-width", 5);
//
// svg.append("line")
//    .attr("filter", "url(#pencilTexture4")
//    .attr("x1", 15)
//    .attr("x2",285)
//    .attr("y1", 15)
//    .attr("y2",200)
//    .style("stroke", "black")
//    .style("stroke-width", 5)
//    .style("fill-opacity", "1")
//    .style("fill", "gray");
//

function applyPencilFilterTextures(svg) {
  
  const defs = svg.append("defs");
  var roughPaper = defs.append("filter");
  roughPaper
    .attr("x", "0%")
    .attr("y", "0%")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("filterUnits", "objectBoundingBox")
    .attr("id", "roughPaper");
  roughPaper.append("feTurbulence")
    .attr("type", "fractalNoise")
    .attr("baseFrequency", "128")
    .attr("numOctaves", "1")
    .attr("result", "noise");
  var diffLight = roughPaper.append("feDiffuseLighting");
  diffLight
    .attr("in", "noise")
    .attr("lighting-color", "white")
    .attr("surfaceScale", "1")
    .attr("result", "diffLight");
  diffLight.append("feDistantLight")
    .attr("azimuth", "45")
    .attr("elevation", "55");
  roughPaper.append("feGaussianBlur")
    .attr("in", "diffLight")
    .attr("stdDeviation", "0.75")
    .attr("result", "dlblur");
  roughPaper.append("feComposite")
    .attr("operator", "aritmetic")
    .attr("k1", "1.2")
    .attr("k2", "0")
    .attr("k3", "0")
    .attr("k4", "0")
    .attr("in", "dlblur")
    .attr("in2", "SourceGraphic")
    .attr("result", "out");

  var pencilTexture = defs.append("filter")
  .attr("x", "-2%")
  .attr("y", "-2%")
  .attr("width", "104%")
  .attr("height", "104%")
  .attr("filterUnits", "objectBoundingBox")
  .attr("id", "PencilTexture")
  pencilTexture.append("feTurbulence")
    .attr("type", "fractalNoise")
    .attr("baseFrequency", "1.2")
    .attr("numOctaves", "3")
    .attr("result", "noise")
  pencilTexture.append("feDisplacementMap")
    .attr("xChannelSelector", "R")
    .attr("yChannelSelector", "G")
    .attr("scale", "3")
    .attr("in", "SourceGraphic")
    .attr("result", "newSource");

  var pencilTexture2 = defs.append("filter")
  .attr("x", "0%")
  .attr("y", "0%")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("filterUnits", "objectBoundingBox")
  .attr("id", "pencilTexture2");
  pencilTexture2.append("feTurbulence")
    .attr("type", "fractalNoise")
    .attr("baseFrequency", 2)
    .attr("numOctaves", 5)
    .attr("stitchTiles", "stitch")
    .attr("result", "f1");
  pencilTexture2.append("feColorMatrix")
    .attr("type", "matrix")
    .attr("values", "0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 -1.5 1.5")
    .attr("result", "f2");
  pencilTexture2.append("feComposite")
    .attr("operator", "in")
    .attr("in2", "f2")
    .attr("in", "SourceGraphic")
    .attr("result", "f3");

  var pencilTexture3 = defs.append("filter")
  .attr("x", "0%")
  .attr("y", "0%")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("filterUnits", "objectBoundingBox")
  .attr("id", "pencilTexture3");
  pencilTexture3.append("feTurbulence")
    .attr("type", "fractalNoise")
    .attr("baseFrequency", 0.5)
    .attr("numOctaves", 5)
    .attr("stitchTiles", "stitch")
    .attr("result", "f1");
  pencilTexture3.append("feColorMatrix")
    .attr("type", "matrix")
    .attr("values", "0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 -1.5 1.5")
    .attr("result", "f2");
  pencilTexture3.append("feComposite")
    .attr("operator", "in")
    .attr("in2", "f2b")
    .attr("in", "SourceGraphic")
    .attr("result", "f3");
  pencilTexture3.append("feTurbulence")
    .attr("type", "fractalNoise")
    .attr("baseFrequency", 1.2)
    .attr("numOctaves", 3)
    .attr("result", "noise");
  pencilTexture3.append("feDisplacementMap")
    .attr("xChannelSelector", "R")
    .attr("yChannelSelector", "G")
    .attr("scale", 2.5)
    .attr("in", "f3")
    .attr("result", "f4");
  var pencilTexture4 = defs.append("filter")
  .attr("x", "-20%")
  .attr("y", "-20%")
  .attr("width", "140%")
  .attr("height", "140%")
  .attr("filterUnits", "objectBoundingBox")
  .attr("id", "pencilTexture4");
  pencilTexture4.append("feTurbulence")
    .attr("type", "fractalNoise")
    .attr("baseFrequency", 0.03)
    .attr("numOctaves", 3)
    .attr("seed", 1)
    .attr("result", "f1");
  pencilTexture4.append("feDisplacementMap")
    .attr("xChannelSelector", "R")
    .attr("yChannelSelector", "G")
    .attr("scale", 5)
    .attr("in", "SourceGraphic")
    .attr("in2", "f1")
    .attr("result", "f4");
  pencilTexture4.append("feTurbulence")
    .attr("type", "fractalNoise")
    .attr("baseFrequency", 0.03)
    .attr("numOctaves", 3)
    .attr("seed", 10)
    .attr("result", "f2");
  pencilTexture4.append("feDisplacementMap")
    .attr("xChannelSelector", "R")
    .attr("yChannelSelector", "G")
    .attr("scale", 5)
    .attr("in", "SourceGraphic")
    .attr("in2", "f2")
    .attr("result", "f5");
  pencilTexture4.append("feTurbulence")
    .attr("type", "fractalNoise")
    .attr("baseFrequency", 1.2)
    .attr("numOctaves", 2)
    .attr("seed", 100)
    .attr("result", "f3");
  pencilTexture4.append("feDisplacementMap")
    .attr("xChannelSelector", "R")
    .attr("yChannelSelector", "G")
    .attr("scale", 3)
    .attr("in", "SourceGraphic")
    .attr("in2", "f3")
    .attr("result", "f6");
  pencilTexture4.append("feBlend")
    .attr("mode", "multiply")
    .attr("in2", "f4")
    .attr("in", "f5")
    .attr("result", "out1");
  pencilTexture4.append("feBlend")
    .attr("mode", "multiply")
    .attr("in", "out1")
    .attr("in2", "f6")
    .attr("result", "out2");
}
