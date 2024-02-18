class Histogram {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1000,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || {top: 10, right: 10, bottom: 10, left: 10},
        }

        this.data = _data;

        this.InitVis();
    }

    InitVis() {
        let vis = this;

        //console.log(vis.data.objects.counties.geometries.map(d => d.properties.selectedAttribute))

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        const filteredData = vis.data.objects.counties.geometries.filter(d => d.properties.selectedAttribute > 0);
        //console.log(vis.data)
        console.log(filteredData)
        
        // SVG
        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)
            .append('g');

        // Scales
        vis.xScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.properties.selectedAttribute)])
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .domain([0, filteredData.length])
            .range([vis.height, 0]);

        // Histogram Bins
        vis.bins = d3.histogram()
            .domain(vis.xScale.domain())
            .thresholds(vis.xScale.ticks(10))
            (filteredData.map(d => d.properties.selectedAttribute));

        console.log(vis.bins)
        
        // Bars
        vis.svg.selectAll('rect')
            .data(vis.bins)
            .enter().append('rect')
            .attr('x', d => vis.xScale(d.x0))
            .attr('y', d => vis.yScale(d.length))
            .attr("width", d => vis.xScale(d.x1) - vis.xScale(d.x0))
            .attr("height", d => vis.height - vis.yScale(d.length))
            .style("fill", "steelblue");

        vis.UpdateVis();
    }

    RenderVis() {

    }

    UpdateVis() {
        this.RenderVis();
    }
}