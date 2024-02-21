class Histogram {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1000,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || {top: 20, right: 20, bottom: 30, left: 50},
            tooltipPadding: _config.tooltipPadding || 15
        }

        this.data = _data;

        this.InitVis();
    }

    InitVis() {
        let vis = this;

        //console.log(vis.data.objects.counties.geometries.map(d => d.properties.selectedAttribute))

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        
        // Define SVG
        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Initialize X Scale
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);

        // Initialize Y Scale
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Create Axis
        vis.xAxis = d3.axisBottom(vis.xScale);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickSizeOuter(0)   // TODO FIX Y AXIS
            .tickFormat(d3.format(".0f"));

        // append axis groups
        vis.xAxisGroup = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0, ${vis.height})`);

        vis.yAxisGroup = vis.chart.append('g')
            .attr('class', 'axis y-axis')
    }    

    UpdateVis(column) {
        let vis = this;

        console.log(column)

        // ! THIS WILL NEED TO CHANGE I THINK
        vis.filteredData = vis.data.objects.counties.geometries.filter(d => d.properties[column] > 0);

        vis.xScale.domain(d3.extent(vis.filteredData, d => d.properties[column]))
        /* 
        TODO Possibly Fix widths or remove
        const spacing = 200;
        const binWidth = (vis.width - (vis.bins.length - 1) * spacing) / vis.bins.length;
        */

        // Histogram Bins
        vis.bins = d3.histogram()
            .domain(vis.xScale.domain())
            .thresholds(vis.xScale.ticks(20))
            (vis.filteredData.map(d => d.properties[column]));

        vis.yScale.domain([0, d3.max(vis.bins.map(d => d.length))])

        vis.RenderVis();
    }

    RenderVis() {
        let vis = this;

        //console.log(vis.bins)

        const bins = vis.chart.selectAll('rect')
            .data(vis.bins)
            .join('rect')
            .attr("x", (d, i) => vis.xScale(d.x0)) // TODO Possibly add widths to bins
            //.attr("x", (d, i) => vis.xScale(d.x0) + i * (binWidth + spacing))
            .attr('y', d => vis.yScale(d.length))
            .attr("width", d => vis.xScale(d.x1) - vis.xScale(d.x0))
            .attr("height", d => vis.height - vis.yScale(d.length))
            .style("fill", "steelblue")

        bins.on("mouseover", (event, d) => {
            console.log('test')
            d3.select('#tooltip')
              .style('display', 'block')
              .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
              .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
              .html(`
                <div>Count: ${d.length}</div>
                <div>Bin Width: ${d3.min(d)} - ${d3.max(d)}</div>`)
            })
            .on("mouseleave", () => {
                d3.select('#tooltip').style('display', 'none')
            })
        
        vis.xAxisGroup.call(vis.xAxis)

        vis.yAxisGroup.call(vis.yAxis)
    }
}