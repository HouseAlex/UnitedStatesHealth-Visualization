class Scatterplot {
    constructor(_config, _data) {
        this.config = {
          parentElement: _config.parentElement,
          colorScale: _config.colorScale,
          containerWidth: _config.containerWidth || 1000,
          containerHeight: _config.containerHeight || 500,
          margin: _config.margin || {top: 25, right: 20, bottom: 30, left: 50},
          tooltipPadding: _config.tooltipPadding || 15
        }
        this.data = _data;

        this.InitVis();
    }

      InitVis() {
        let vis = this;

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        
        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Append group element that will contain our actual chart 
        // and position it according to the given margin config
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Initialize Scales
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(6)
            .tickPadding(10)

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickPadding(10);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisGroup = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        // Append y-axis group
        vis.yAxisGroup = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        // Append both axis titles
        vis.xTitle = vis.chart.append('text')
            .attr('class', 'axis-title')
            .attr('y', vis.height - 15)
            .attr('x', vis.width + 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')

        vis.yTitle = vis.svg.append('text')
            .attr('class', 'axis-title')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '.71em')
    }

    UpdateVis(xColumn, yColumn) {
        let vis = this;

        vis.xValue = xColumn.attributeName;
        vis.yValue = yColumn.attributeName;

        vis.filteredData = vis.data.objects.counties.geometries.filter(d => d.properties[vis.xValue] > 0 && d.properties[vis.yValue] > 0)
        //console.log(vis.filteredData)

        vis.xScale.domain(d3.extent(vis.filteredData, d => d.properties[vis.xValue]));
        vis.yScale.domain(d3.extent(vis.filteredData, d => d.properties[vis.yValue]));

        vis.xTitle.text(xColumn.displayName)
        vis.yTitle.text(yColumn.displayName)

        vis.RenderVis();
    }

    RenderVis() {
        let vis = this;
        
        const circles = vis.chart.selectAll('.point')
            .data(vis.filteredData, d => d.properties.display_name)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 4)
            .attr('cy', d => vis.yScale(d.properties[vis.yValue]))
            .attr('cx', d => vis.xScale(d.properties[vis.xValue]))
            .attr('fill', 'steelblue');

        circles.on('mouseover', (event, d) => {
            d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                    <div class="tooltip-title">${d.properties.display_name}</div>
                    <ul>
                        <li>x: ${d.properties[vis.xValue]}</li>
                        <li>y: ${d.properties[vis.yValue]}</li>
                    </ul>
                `);
            })
            .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
            });


        vis.xAxisGroup.call(vis.xAxis)

        vis.yAxisGroup.call(vis.yAxis)
    }
}