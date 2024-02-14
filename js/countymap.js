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
      legendRectWidth: 150
    };

    this.data = _data;

    this.colorScale = _colorScale;

    this.us = _data;

    this.active = d3.select(null);

    this.InitVis();
  }

  InitVis() {    
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('class', 'center-container')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.svg.append('rect')
        .attr('class', 'background center-container')
        .attr('height', vis.config.containerWidth )
        .attr('width', vis.config.containerHeight)
        .on('click', vis.clicked);

    vis.projection = d3.geoAlbersUsa()
        .translate([vis.width /2, vis.height /2])
        .scale(vis.width);

    vis.path = d3.geoPath().projection(vis.projection);

    vis.colorScale = d3.scaleLinear()
        .domain(d3.extent(vis.data.objects.counties.geometries, d => d.properties.selectedAttribute))
        .range(['#cfe2f2', '#0d306b'])
        .interpolate(d3.interpolateHcl);

    vis.g = vis.svg.append('g')
        .attr('class', 'center-container center-items us-state')
        .attr('transform', 'translate('+vis.config.margin.left+','+vis.config.margin.top+')')
        .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
        .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)

    vis.counties = vis.g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(vis.us, vis.us.objects.counties).features)
        .enter().append("path")
        .attr("d", vis.path)
        .attr('fill', d => {
              if (d.properties.selectedAttribute) {
                return vis.colorScale(d.properties.selectedAttribute);
              } else {
                return 'url(#lightstripe)';
              }
            });

            vis.counties
            .on('mousemove', (d,event) => {
              console.log(d);
              console.log(event);
                const popDensity = d.properties.selectedAttribute ? `<strong>${d.properties.selectedAttribute}</strong> pop. density per km<sup>2</sup>` : 'No data available'; 
                d3.select('#tooltip')
                  .style('display', 'block')
                  .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                  .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                  .html(`
                    <div class="tooltip-title">${d.properties.name}</div>
                    <div>${popDensity}</div>
                  `);
              })
              .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
              });



    vis.g.append("path")
        .datum(topojson.mesh(vis.us, vis.us.objects.states, function(a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", vis.path);    

    vis.UpdateVis();
  }

  RenderVis() {
  }

  UpdateVis() {
    this.RenderVis();
  }
}
