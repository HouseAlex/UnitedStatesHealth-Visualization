class CountyMap {
  constructor(_config, _data) {
    this.config = {
      parenElement: _config.parenElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 400,
      margin: {top: 40, right: 50, bottom: 10, left: 50}
    };

    this.data = _data;

    this.InitVis();
  }

  InitVis() {
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);
        

    UpdateVis();
  }

  RenderVis() {}

  UpdateVis() {
    vis.RenderVis();
  }
}
