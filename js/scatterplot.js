class Scatterplot {
    constructor(_config, _data) {
        this.config = {
          parentElement: _config.parentElement,
          colorScale: _config.colorScale,
          containerWidth: _config.containerWidth || 500,
          containerHeight: _config.containerHeight || 300,
          margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 35},
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

        // Initialize Scales
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(6)
            .tickSize(-vis.height - 10)
            .tickPadding(10)

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickSize(-vis.width - 10)
            .tickPadding(10);

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Append group element that will contain our actual chart 
        // and position it according to the given margin config
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');
    }

    UpdateVis(xColumn, yColumn) {
        let vis = this;

        vis.filteredData = vis.data.objects.counties.geometries.filter(d => d.properties[xColumn] > 0 && d.properties[yColumn] > 0)
        console.log(vis.filteredData)

        vis.xValue = d => d.properties[xColumn];
        vis.yValue = d => d.properties[yColumn];

        vis.xScale.domain(d3.extent(vis.filteredData, vis.xValue));
        vis.yScale.domain(d3.extent(vis.filteredData, vis.yValue));

        vis.RenderVis();
    }

    RenderVis() {
        let vis = this;

        const circles = vis.chart.selectAll('.point')
            .data(vis.filteredData, d => d.properties.display_name)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 4)
            .attr('cy', d => vis.yScale(vis.yValue(d)))
            .attr('cx', d => vis.xScale(vis.xValue(d)))
            .attr('fill', 'steelblue');


        vis.xAxisG
            .call(vis.xAxis)

        vis.yAxisG
            .call(vis.yAxis)
    }
}