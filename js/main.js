let histogram1, histogram2, countyMap1, countyMap2, scatterplot, geo, geoOriginal, selector1Column, selector2Column, option1, option2
let countyFilter = [];

const dispatcher = d3.dispatch('filterVisualizations', 'reset')

Promise.all([
    d3.json('data/counties-10m.json'),
    d3.csv('data/national_health_data.csv'),
    d3.json('data/additional_data_info.json')
]).then(data => {
    geo = data[0];
    geoOriginal = [...geo.objects.counties.geometries]
    const healthData = data[1];
    const options = data[2];

    // default selected
    selector1Column = options[0].attributeName;
    selector2Column = options[1].attributeName;
    
    option1 = options.find(d => d.attributeName == selector1Column)
    option2 = options.find(d => d.attributeName == selector2Column)

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
    notDisplaying = []
    geo.objects.counties.geometries.forEach( (element, index) => {
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
                element.properties.highlight = false;
                //console.log('test')
            } 
        }
        if (element.properties.median_household_income == -1){
            //console.log(index);
            notDisplaying.push(element.properties);
        }
    });
    /*
    //console.log(notDisplaying)
    for (let i = 0; i < notDisplaying.length; i++) {
        console.log(geo.objects.counties.geometries[notDisplaying[i]].properties)
        geo.objects.counties.geometries.splice(notDisplaying[i], 1);
    }*/
    //console.log(geo.objects.counties.geometries)
    console.log(notDisplaying)
    histogram1 = new Histogram({
        parentElement: '#histogram1',
        containerWidth: 600,
        containerHeight: 300,

    },dispatcher, geo);
    console.log(options)
    histogram1.UpdateVis(option1);

    //console.log(geo.objects.counties.geometries)
    histogram2 = new Histogram({
        parentElement: '#histogram2',
        containerWidth: 600,
        containerHeight: 300,
    },dispatcher, geo);
    histogram2.UpdateVis(option2);

    //console.log(geo.objects.counties.geometries)
    scatterplot = new Scatterplot({
        parentElement: '#scatterplot1',
        containerWidth: 600,
        containerHeight: 300,
    },dispatcher, geo);
    scatterplot.UpdateVis(option1, option2);

    //console.log(geo.objects.counties.geometries)
    countyMap1 = new CountyMap({
        parentElement: '#countymap1',
        gradientName: 'gradient1'
    }, geo);
    countyMap1.UpdateVis(option1, false);

    //console.log(geo.objects.counties.geometries)
    countyMap2 = new CountyMap({
        parentElement: '#countymap2',
        gradientName: 'gradient2'
    }, geo);
    countyMap2.UpdateVis(option2, false);
    

    // Listening for selectors
    
    d3.select("#columnSelector1")
        .on("change", function() {
            ResetDataFilter();
            selector1Column = this.value;
            option1 = options.find(d => d.attributeName == selector1Column)
            histogram1.UpdateVis(option1);
            countyMap1.UpdateVis(option1, false);
            scatterplot.UpdateVis(option1, option2);
        });

    d3.select("#columnSelector2")
        .on("change", function() {
            ResetDataFilter();
            selector2Column = this.value;
            option2 = options.find(d => d.attributeName == selector2Column)
            histogram2.UpdateVis(option2);
            countyMap2.UpdateVis(option2, false);
            scatterplot.UpdateVis(option1, option2);
        });

    // Rural Status Listener
    d3.selectAll('input[type="checkbox"]').on('change', FilterOnRuralStatus());
    
})
.catch(error => console.log(error));

dispatcher.on('filterVisualizations', (selectedCounties, visualization) => {
    console.log(selectedCounties)
    if (selectedCounties.length == 0){
        ResetDataFilter();
    }
    else {
        const filteredGeometries = geo.objects.counties.geometries.filter(d => selectedCounties.includes(d.id));
        console.log(filteredGeometries)
        console.log(geo.objects.counties.geometries)
        console.log(visualization)
        if (visualization !== '#histogram1') {
            //console.log('test1')
            histogram1.data.objects.counties.geometries = filteredGeometries;
            histogram1.UpdateVis(option1);
        }

        if (visualization !== '#histogram2') {
            //console.log('test2')
            histogram2.data.objects.counties.geometries = filteredGeometries;
            histogram2.UpdateVis(option2);
        }

        if (visualization !== '#scatterplot1') {
            scatterplot.data.objects.counties.geometries = filteredGeometries;
            scatterplot.UpdateVis(option1, option2)
        }

        const highlightData = JSON.parse(JSON.stringify(geoOriginal));
        highlightData.forEach(d => d.properties.highlight = selectedCounties.includes(d.id));

        if (visualization !== '#countymap1') {
            countyMap1.data.objects.counties.geometries = filteredGeometries;
            countyMap1.us.objects.counties.geometries = highlightData;
            countyMap1.UpdateVis(option1, true)
        }

        if (visualization !== '#countymap2') {
            countyMap2.data.objects.counties.geometries = filteredGeometries;
            countyMap2.us.objects.counties.geometries = highlightData;
            countyMap2.UpdateVis(option2, true)
        }
    }
})

dispatcher.on('reset', () => {
    ResetDataFilter();
    RefreshVisualizations();
})

function FilterOnRuralStatus() {
    
}

function ResetDataFilter() {
    histogram1.data.objects.counties.geometries = geoOriginal;
    histogram2.data.objects.counties.geometries = geoOriginal;
    scatterplot.data.objects.counties.geometries = geoOriginal;
    //! These might not work for maps, because of US data.
    countyMap1.data.objects.counties.geometries = geoOriginal;
    countyMap1.us.objects.counties.geometries = geoOriginal;
    countyMap2.data.objects.counties.geometries = geoOriginal;
    countyMap2.us.objects.counties.geometries = geoOriginal;

}

function RefreshVisualizations() {
    histogram1.UpdateVis(option1);
    histogram2.UpdateVis(option2);
    scatterplot.UpdateVis(option1, option2);
    countyMap1.UpdateVis(option1, false);
    countyMap2.UpdateVis(option2, false);
}