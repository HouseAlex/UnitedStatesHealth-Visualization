class CountyMap {
  constructor(_config, _data, _colorScale) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || {top: 10, right: 10, bottom: 10, left: 10},
      tooltipPadding: 10,
      legendBottom: 50,
      legendLeft: 50,
      legendRectHeight: 12, 
      legendRectWidth: 150,
      gradientName: _config.gradientName
    };

    this.data = _data;

    this.colorScale = _colorScale;

    this.us = _data;

    //this.active = d3.select(null);

    this.InitVis();
  }

  InitVis() {    
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.svg.append('rect')
        .attr('class', 'background center-container')
        .attr('height', vis.config.containerWidth )
        .attr('width', vis.config.containerHeight)
        //.on('click', vis.clicked);

    vis.projection = d3.geoAlbersUsa()
        .translate([vis.width /2, vis.height /2])
        .scale(vis.width);

    vis.path = d3.geoPath().projection(vis.projection);

    vis.g = vis.svg.append('g')
        .attr('class', 'center-container center-items us-state')
        .attr('transform', 'translate('+vis.config.margin.left+','+vis.config.margin.top+')')
        .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
        .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)

    vis.counties = topojson.feature(vis.us, vis.us.objects.counties);
    //console.log(vis.counties)

    vis.projection.fitSize([vis.width, vis.height], vis.counties);

    // Initialize gradient that we will later use for the legend
    vis.linearGradient = vis.svg.append('defs').append('linearGradient')
        .attr("id", vis.config.gradientName);

    // Append legend
    vis.legend = vis.g.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${vis.config.legendLeft},${vis.height - vis.config.legendBottom - 100})`);
    
    vis.legendRect = vis.legend.append('rect')
        .attr('width', vis.config.legendRectWidth)
        .attr('height', vis.config.legendRectHeight);

    vis.legendTitle = vis.legend.append('text')
        .attr('class', 'legend-title')
        .attr('dy', '.35em')
        .attr('y', -10)

    vis.filterHighlights = false;
  }

  UpdateVis(column, isFiltered) {
    let vis = this;

    vis.attribute = column.attributeName;
    vis.filterHighlights = isFiltered;
    if (vis.filterHighlights){
      vis.geoColorScaleData = vis.data.objects.counties.geometries;
    }
    const filteredDataForColoring = vis.data.objects.counties.geometries.filter(d => ((!vis.filterHighlights  && d.properties[vis.attribute] > 0) || (vis.filterHighlights && d.properties.highlight) && d.properties[vis.attribute] > 0));
    //console.log(filteredDataForColoring)
    vis.filteredData = vis.data.objects.counties.geometries//.filter(d => d.properties[vis.attribute] > 0);
    //console.log(vis.attribute);
    
    //Extent
    const ext = d3.extent(filteredDataForColoring, d => d.properties[vis.attribute]);

    const colorMinData = filteredDataForColoring

    // Color Scale
    vis.colorScale = d3.scaleLinear()
        .range(column.colorScale)
        .domain(ext)
        .interpolate(d3.interpolateHcl);

    // Define begin and end of the color gradient (legend)
    vis.legendStops = [
      { color: column.colorScale[0], value: ext[0], offset: 0},
      { color: column.colorScale[1], value: ext[1], offset: 100},
    ];

    vis.legendTitle.text(column.displayName)

    vis.RenderVis();
  }

  RenderVis() {
    let vis = this;

    //console.log(vis.counties.features)

    //vis.counties.attr('fill', 'steelblue');
    //console.log(topojson.feature(vis.us, vis.us.objects.counties).features)

    vis.counties = vis.g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(vis.us, vis.us.objects.counties).features)
        .enter().append("path")
        .attr("d", vis.path)
        .attr('fill', d => {
          if (!vis.filterHighlights) {
              if (d.properties[vis.attribute] > 0) {
                return vis.colorScale(d.properties[vis.attribute]);
              } 
              else {
                //console.log(d.properties[vis.attribute])
                return 'url(#lightstripe)';
              }
          }
          else {
            if (d.properties.highlight && d.properties[vis.attribute] > 0) {
              return vis.colorScale(d.properties[vis.attribute]);
            }
            else {
              return 'url(#lightstripe)'
            }
          }
        });

    vis.counties.on('mousemove', (event, d) => {
          const popDensity = d.properties[vis.attribute] > 0? `<strong>${d.properties[vis.attribute]}</strong>` : 'No data available'; 
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(() => {
              if (!vis.filterHighlights || (vis.filterHighlights && d.properties.highlight)){
                return `
                  <div class="tooltip-title">${d.properties.display_name}</div>
                  <div>${popDensity}</div>`
              }
              return `<div class="tooltip-title">County not present in selection range</div>`
            });
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });



    vis.g.append("path")
        .datum(topojson.mesh(vis.us, vis.us.objects.states, function(a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", vis.path);

    // Add legend labels
    vis.legend.selectAll('.legend-label')
        .data(vis.legendStops)
      .join('text')
        .attr('class', 'legend-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('y', 20)
        .attr('x', (d,index) => {
          return index == 0 ? 0 : vis.config.legendRectWidth;
        })
        .text(d => d.value);
        
    console.log(vis.legendStops)
    // Update gradient for legend
    vis.linearGradient.selectAll('stop')
        .data(vis.legendStops)
      .join('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);

    vis.legendRect.style('fill', `url(#${vis.config.gradientName})`);
  }
}
