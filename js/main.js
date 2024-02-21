let histogram1, histogram2, countyMap1, countyMap2, scatterplot

Promise.all([
    d3.json('data/counties-10m.json'),
    d3.csv('data/national_health_data.csv'),
    d3.json('data/additional_data_info.json')
]).then(data => {
    const geo = data[0];
    const healthData = data[1];
    const options = data[2];

    // default selected
    let selector1Column = options[0].attributeName;
    let selector2Column = options[1].attributeName;

    // ! Fix default displayed attribute of 2nd selects
    // Attribute Selectors
    selector1 = d3.select("#columnSelector1")
        .selectAll("option")
        .data(options)
        .enter().append("option")
        .attr("value", d => d.attributeName)
        .text(d => d.displayName);

    selector2 = d3.select("#columnSelector2")
        .selectAll("option")
        .data(options)
        .enter().append("option")
        .attr("value", d => d.attributeName)
        .text(d => d.displayName);

    // Prepping the data
    geo.objects.counties.geometries.forEach(element => {
        for (let i = 0; i < healthData.length; i++){
            if (element.id === healthData[i].cnty_fips) {
                element.properties.display_name = healthData[i].display_name;
                element.properties.poverty_perc = +healthData[i].poverty_perc;
                element.properties.median_household_income = +healthData[i].median_household_income;
                element.properties.education_less_than_high_school_percent = +healthData[i].education_less_than_high_school_percent;
                element.properties.air_quality = +healthData[i].air_quality;
                element.properties.park_access = +healthData[i].park_access;
                element.properties.percent_inactive = +healthData[i].percent_inactive;
                element.properties.percent_smoking = +healthData[i].percent_smoking;
                element.properties.urban_rural_status = +healthData[i].urban_rural_status;
                element.properties.elderly_percentage = +healthData[i].elderly_percentage;
                element.properties.number_of_hospitals = +healthData[i].number_of_hospitals;
                element.properties.number_of_primary_care_physicians = +healthData[i].number_of_primary_care_physicians;
                element.properties.percent_no_heath_insurance = +healthData[i].percent_no_heath_insurance;
                element.properties.percent_high_blood_pressure = +healthData[i].percent_high_blood_pressure;
                element.properties.percent_coronary_heart_disease = +healthData[i].percent_coronary_heart_disease;
                element.properties.percent_stroke = +healthData[i].percent_stroke;
                element.properties.percent_high_cholesterol = +healthData[i].percent_high_cholesterol;
                element.properties.selectedAttribute = +healthData[i].median_household_income;
            }
        }
    });

    histogram1 = new Histogram({
        parentElement: '#histogram1',
    }, geo);
    histogram1.UpdateVis(selector1Column);

    histogram2 = new Histogram({
        parentElement: '#histogram2'
    }, geo);
    histogram2.UpdateVis(selector2Column);

    scatterplot = new Scatterplot({
        parentElement: '#scatterplot1'
    }, geo);
    scatterplot.UpdateVis(selector1Column, selector2Column);

    /*
    countyMap1 = new CountyMap({
        parentElement: '#countymap1',
    }, geo, );
    //countyMap1.UpdateVis();
    */

    // Listening for selectors
    
    d3.select("#columnSelector1")
        .on("change", function() {
            console.log('switch')
            console.log(this.value)
            selector1Column = this.value;
            histogram1.UpdateVis(selector1Column);
            scatterplot.UpdateVis(selector1Column, selector2Column);
        });

    d3.select("#columnSelector2")
        .on("change", function() {
            console.log('switch')
            console.log(this.value)
            selector2Column = this.value;
            histogram2.UpdateVis(selector2Column);
            scatterplot.UpdateVis(selector1Column, selector2Column);
        });
    
})
.catch(error => console.log(error));