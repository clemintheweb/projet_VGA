'use strict';

// fonction fenetre info
function UpdateInfo() {
    var info = document.getElementById("Info");
    if (info.style.display === "none") {
        info.style.display = "block";
    } else {
        info.style.display = "none";
    }
}

// fonction fenetre info indices
function UpdateInfoIndex() {
    var info = document.getElementById("InfoIndex");
    if (info.style.display === "none") {
        info.style.display = "block";
    } else {
        info.style.display = "none";
    }
}

// fonction fenetre info indices 2
function UpdateInfoIndex2() {
    var info = document.getElementById("InfoIndex2");
    if (info.style.display === "none") {
        info.style.display = "block";
    } else {
        info.style.display = "none";
    }
}

// fonction fenetre info indices 3
function UpdateInfoIndex3() {
    var info = document.getElementById("InfoIndex3");
    if (info.style.display === "none") {
        info.style.display = "block";
    } else {
        info.style.display = "none";
    }
}

// fonction zoom
function zoomToCoordinates(lon, lat, svg, width, height, projection, zoom) {
    const [x, y] = projection([lon, lat]);
    const newScale = 8;
    const transform = d3.zoomIdentity
        .translate(width / 2 - x * newScale, height / 2 - y * newScale)
        .scale(newScale);

    svg.transition()
        .duration(750)
        .call(zoom.transform, transform);
}

    // fonction zoom sur parc
function zoomToPark(svg, width, height, projection, zoom) {
    const selParc = document.getElementById('SelParc');
    const selectedValue = selParc.value;
    if (selectedValue && selectedValue !== 'aucun') {
        const [lon, lat] = selectedValue.split(',').map(Number);
        zoomToCoordinates(lon, lat, svg, width, height, projection, zoom);
    } else {
        // resest du zoom
        const transform = d3.zoomIdentity;
        svg.transition()
            .duration(750)
            .call(zoom.transform, transform);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    let selectedTreeIndex = null; // Variable to store the selected tree index

    // chargement des données
    Promise.all([
        d3.json("http://localhost:8000/eau_v2.geojson"),
        d3.json("http://localhost:8000/parcs.geojson"),
        d3.json("http://localhost:8000/routes_v4.geojson"),
        d3.json("http://localhost:8000/old_trees2.geojson"),
        d3.json("http://localhost:8000/ref_voies.geojson"),
        d3.json("http://localhost:8000/ref_voies2.geojson"),
        //d3.json("http://localhost:8000/young_trees.geojson")
    ]).then(function(data) {
        const eauData = data[0];
        const parcsData = data[1];
        const routesData = data[2];
        const VarbresData = data[3];
        const routesZoomData = data[4];
        const routesZoomData2 = data[5];
        //const JarbresData = data[4];
        // dimension fond de carte 

        // dimension fond de carte 
        const width = document.getElementById("fond_de_carte").clientWidth;
        const height = document.getElementById("fond_de_carte").clientHeight;

        // projection par défaut et chemins
        var projection = d3.geoMercator()
            .center([7.76874, 48.58304])
            .scale(800000)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath().projection(projection);

        // initialisation du svg fond de carte
        var svgFond = d3.select("#fond_de_carte").append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .style("position", "relative");

        const g = svgFond.append("g");

        // parc et eau
        const eauparc = g.selectAll("path.eau_parcs")
            .data(eauData.features.concat(parcsData.features))
            .enter().append("path")
            .attr("class", "eau_parcs")
            .attr("d", path)
            .attr("fill-opacity", 0.5)
            .attr("fill", function(d) {
                if (d.properties.type === "parc") {
                    return "#cdde87";
                } else if (d.properties.type === "eau") {
                    return "#aaccff";
                }
            });

        // routes
         const routes = g.selectAll("path.routes")
            .data(routesData.features)
            .enter().append("path")
            .attr("d", path)
            .attr("stroke-opacity", 0.5)
            .attr("stroke", "#7f7f7f")
            .attr("stroke-width", function(d) {
                return d.properties.hierarchie === 'A' ? 3 :
                    d.properties.hierarchie === 'B' ? 1 : 1;
            })
            .attr("fill", "none");
        
        // routes zoom
        const rues = g.selectAll("path.routes2")
            .data(routesZoomData.features)
            .enter().append("path")
            .attr("d", path)
            .attr("stroke-opacity", 0.2)
            .attr("stroke", "#7f7f7f")
            .attr("stroke-width", 1)
            .attr("fill", "none");
        
        // places et avenues zoom
        const places = g.selectAll("path.routes3")
            .data(routesZoomData2.features)
            .enter().append("path")
            .attr("d", path)
            .attr("stroke-opacity", 0.5)
            .attr("stroke", "#7f7f7f")
            .attr("stroke-width", 1)
            .attr("fill", "none");
            
        // Adding text labels for places and avenues
        const placesAvenuesLabels = g.selectAll("text.placesAvenuesLabels")
            .data(routesZoomData2.features)
            .enter().append("text")
            .attr("class", "placesAvenuesLabels")
            .attr("x", function(d) {
                const centroid = path.centroid(d);  // Using centroid to get the label position
                return centroid[0];
            })
            .attr("y", function(d) {
                const centroid = path.centroid(d);  // Using centroid to get the label position
                return centroid[1];
            })
            .attr("dy",0) // Offset the text slightly above the point
            .attr("text-anchor", "middle")
            .attr("font-size", "2px")
            .attr("fill", "#000")
            .style('font-family', 'Verdana')
            .style('font-weight', 'bold')
            .text(function(d) {
                return d.properties.libelle_com;
            });

        // Vieux arbres
        const VarbreCircles = g.selectAll("circle.Varbres")
            .data(VarbresData.features)
            .enter().append("circle")
            .attr("class", "Varbres")
            .attr("cx", function(d) {
                return projection(d.geometry.coordinates)[0];
            })
            .attr("cy", function(d) {
                return projection(d.geometry.coordinates)[1];
            })
            .attr("r", 2)  // Initial radius
            .on("mouseover", function() {
                d3.select(this).classed("tree-hover", true);
            })
            .on("mouseout", function() {
                d3.select(this).classed("tree-hover", false);
            })
            .on("click", function(event, d) {
                selectedTreeIndex = VarbresData.features.indexOf(d);
                d3.selectAll("circle.Varbres").classed("selected", false);
                
                // Apply CSS style
                d3.select(this).classed("selected", true);

                if (selectedTreeIndex !== -1) {
                    updateSelectedTree(VarbresData.features[selectedTreeIndex]);
                    updateSelectedTree2(VarbresData.features[selectedTreeIndex]);
                    updateSelectedTree3(VarbresData.features[selectedTreeIndex]);
                }
            });

        // Delaunay for Voronoi diagram
        const delaunay = d3.Delaunay.from(VarbresData.features.map(d => projection(d.geometry.coordinates)));
        let transform = d3.zoomIdentity;

        const zoom = d3.zoom()
            .scaleExtent([0.5, 30])
            .translateExtent([[-width - 300, -height - 300], [2 * width, 2 * height]])
            .on("zoom", (e) => {
                transform = e.transform;
                g.attr("transform", transform);
                g.style("stroke-width", 3 / Math.sqrt(transform.k));
                VarbreCircles.attr("r", 2 / Math.sqrt(transform.k));
                
                // Toggle visibility based on zoom level
                if (transform.k < 3.5) { // zoom sup à 4
                    rues.style("display", "none"); // none : pas affiché
                    places.style("display", "none");
                    placesAvenuesLabels.style("display", "none");
                    routes.style("display","block");
                    eauparc.style("display", "block"); //block : affiché
                    VarbreCircles.style("display","block");
                } else {
                    rues.style("display", "block");
                    places.style("display", "none");
                    placesAvenuesLabels.style("display", "block");
                    routes.style("display","none");
                    eauparc.style("display", "block");
                    VarbreCircles.style("display","block");
                }
            });

        svgFond.call(zoom)
            .call(zoom.transform, d3.zoomIdentity)
            .on("pointermove", (event) => {
                const p = transform.invert(d3.pointer(event));
                const i = delaunay.find(...p);
                //VarbreCircles.classed("highlighted", (_, j) => i === j);
                d3.select(VarbreCircles.nodes()[i]).raise();
            });
        
        // appel fonction zoom sur parc
        const triDiv = document.getElementById('tri');
        triDiv.addEventListener("click", function() {
            zoomToPark(svgFond, width, height, projection, zoom);
        });
    });
    

// Fonction graphique schéma
function updateSelectedTree(selectedTreeIndex) {
    // Supprimer le graphique de profil existant
    d3.select("#profil_graphique").selectAll("*").remove();
    
    // dimensions de la div profil_graphique
    const Graphwidth = window.innerWidth * 0.25; // 30vw
    const Graphheight = window.innerHeight * 0.313; // 32vh
    const margin = { top: 15, right: 10, bottom: 10, left: 10};
    const innerWidth = Graphwidth - margin.left - margin.right;
    const innerHeight = Graphheight - margin.top - margin.bottom;
    const centerX = (innerWidth/2) + 10;

    // échelle Y
    var yScale = d3.scaleLinear()
        .domain([0, 60]) // échelon de l'axe
        .range([innerHeight, 0]); // taille sur site

    // échelle X
    var xScale = d3.scaleLinear()
        .domain([-25 , 25])
        .range([0, innerWidth]);
    
    var Profilsvg = d3.select("#profil_graphique").append("svg")
        .attr("width", Graphwidth)
        .attr("height", Graphheight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Extraction des data
    const Hauteurbrut = selectedTreeIndex.properties["haut_tree"];
    const Couronnebrut = selectedTreeIndex.properties["diam_crown"];

    // en format nombre puis arrondir
    const Hauteur = typeof Hauteurbrut === 'number' ? Hauteurbrut.toFixed(1) : null;
    const Couronne = typeof Couronnebrut === 'number' ? Couronnebrut.toFixed(1) : null;
    
    // Tronc
    const Tronc = Profilsvg.append("rect")
        .attr('class', 'bar')
        .attr('x', centerX - 5)
        .attr('width', 10)
        .attr('fill', "#7e5438")
        .attr('height', yScale(0) - yScale(Hauteur))
        .attr('y', yScale(Hauteur));
    
    // Feuillage
    const Feuillage = Profilsvg.append('circle')
        .attr('class', 'bar')
        .attr('fill', "#33a02c")
        .attr('fill-opacity', 0.7)
        .attr('cx', centerX)
        .attr('cy', yScale(Hauteur))
        .attr('r', xScale(Couronne) / 8); // div par 4 parce que échelle -25 - 25 

    
        // axe largeur à la base
    Profilsvg.append('rect')
        .attr('x', (centerX) - (xScale(Couronne)/8))
        .attr('y', yScale(0) - 3)
        .attr('width', (xScale(Couronne)/4))
        .attr('fill', "#01665e")
        .attr('height', 3);
    
    // étiquette X
    Profilsvg.append('text')
        .attr('class', 'axis-label')
        .attr('x', centerX)
        .attr('y', yScale(0) + 10)
        .style('text-anchor', 'middle')
        .text(` diamètre de la couronne: ${Couronne} mètres`)
        .style('font-family', 'Verdana')
        .style('fill', '#01665e')
        .style('font-size', '10px');
    
    // texte hauteur 
    Profilsvg.append("text")
        .attr('x', centerX)
        .attr('y', yScale(Hauteur))
        .style('text-anchor', 'middle')
        .text(` hauteur de l'arbre : ${Hauteur} mètres`) 
        .attr('fill', '#000')
        .style('font-family', 'Verdana')
        .style('font-size', '10px')
        .style('font-weight', 'bold');
    
        // barre
        Profilsvg.append("line")
        .attr("x1", -margin.left)// coordonnées point gauche
        .attr("y1", -margin.top)
        .attr("x2", Graphwidth)// coordonnées point droit
        .attr("y2", -margin.top)
        .attr("stroke", "#01665e")
        .attr("stroke-width", 6);

}

// Fonction pour graphique violon ratios
function updateSelectedTree2(selectedTreeIndex) {
    d3.select("#diag_violon").selectAll("*").remove();

    const Graphwidth = window.innerWidth * 0.25; // 30vw
    const Graphheight = window.innerHeight * 0.313; // 32vh
    const margin = { top: 20, right: 10, bottom: 35, left: 40 };
    const innerWidth = Graphwidth - margin.left - margin.right;
    const innerHeight = Graphheight - margin.top - margin.bottom;
    const centerX = (window.innerWidth * 0.3)/2;
    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([innerHeight, 0]);

    const xScale = d3.scaleBand()
        .domain(["Distribution des points détectés"])
        .range([0, innerWidth]);

    const Violonsvg = d3.select("#diag_violon").append("svg")
        .attr("width", Graphwidth)
        .attr("height", Graphheight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
        // Extraction des data
    const VCI = selectedTreeIndex.properties["VCI"]; 
    const Nombre = selectedTreeIndex.properties["nbr_pts"];

    const ratios = [
        selectedTreeIndex.properties["rat_0.20"],
        selectedTreeIndex.properties["rat_20.40"],
        selectedTreeIndex.properties["rat_40.60"],
        selectedTreeIndex.properties["rat_60.80"],
        selectedTreeIndex.properties["rat_80.100"]
    ];
    

    // data
    const data = ratios.flatMap((ratio, i) => Array(Math.floor(ratio * 100)).fill(i * 20));

    // axe Y
    Violonsvg.append("g").call(d3.axisLeft(yScale));

    // axe X
    Violonsvg.append("g")
        .attr("transform", "translate(10," + innerHeight + ")")

    const histogram = d3.histogram()
        .domain(yScale.domain())
        .thresholds(yScale.ticks(7)); // bins

    const bins = histogram(data);

    const maxNum = d3.max(bins, d => d.length);

    const xNum = d3.scaleLinear()
        .range([0, xScale.bandwidth() * 0.6])
        .domain([-maxNum, maxNum]);

    // initialisation du graphique
    Violonsvg.append("g")
        .selectAll("myViolin")
        .data([bins])
        .enter()
        .append("g")
        .append("path")
        .datum(d => d)
        .style("stroke", "#7e5438")
        .style("stroke-width", 2)
        .style("fill", "#33a02c")
        .attr('fill-opacity', 0.7)
        .attr("d", d3.area()
            .x0(d => xNum(-d.length) + (innerWidth /5.5))
            .x1(d => xNum(d.length)+ (innerWidth / 5.5))
            .y(d => yScale(d.x0))
            .curve(d3.curveCatmullRom)
        );
    
    // étiquette Y
    Violonsvg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -margin.left + 15)
        .text("Hauteur en %")
        .attr('fill', "#01665e")
        .style('font-family', 'Verdana')
        .style('font-size', '10px')
        .style('font-weight', 'bold');
    
    // étiquette X
    Violonsvg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + margin.bottom - 5)
        .text(`Distribution des ${Nombre} points détectés`)
        .attr('fill', "#01665e")
        .style('font-family', 'Verdana')
        .style('font-size', '10px')
        .style('font-weight', 'bold');
    
    // VCI
    Violonsvg.append("text")
        .attr('x', (innerWidth / 2) - 70)
        .attr('y', innerHeight + margin.bottom - 20)
        .text(` Régularité verticale: ${VCI}`) 
        .attr('fill', '"#33a02c"')
        .style('font-family', 'Verdana')
        .style('font-size', '10px')
        .style('font-weight', 'bold');
    
    // barre
    Violonsvg.append("line")
        .attr("x1", -margin.left)// coordonnées point gauche
        .attr("y1", -margin.top)
        .attr("x2", Graphwidth)// coordonnées point droit
        .attr("y2", -margin.top)
        .attr("stroke", "#01665e")
        .attr("stroke-width", 6);
}
    
// Fonction pour graphique histo indices 
function updateSelectedTree3(selectedTreeIndex) {
    // initialisation du svg
    d3.select("#diag_index").selectAll("*").remove();

    console.log("Arbre sélectionné:", selectedTreeIndex);

    const Graphwidth = window.innerWidth * 0.25; // 25vw
    const Graphheight = window.innerHeight * 0.313; // 31.3vh
    const margin = { top: 20, right: 20, bottom: 20, left: 50 };
    const innerWidth = Graphwidth - margin.left - margin.right;
    const innerHeight = Graphheight - margin.top - margin.bottom;
    
    // data
    d3.json("http://localhost:8000/old_trees2.geojson").then(data => {
        // Retrieve the selected tree's properties
        const GFP = selectedTreeIndex.properties["gfp_mean2"];
        const LAD = selectedTreeIndex.properties["lad_sd2"];
        const INT = selectedTreeIndex.properties["int_std2"];

        // Calculate min and max values for scaling
        const GFPmax = Math.max(...data.features.map(feature => feature.properties.gfp_mean2));
        const GFPmin = Math.min(...data.features.map(feature => feature.properties.gfp_mean2));
        const LADmax = Math.max(...data.features.map(feature => feature.properties.lad_sd2));
        const LADmin = Math.min(...data.features.map(feature => feature.properties.lad_sd2));
        const INTmax = Math.max(...data.features.map(feature => feature.properties.int_std2));
        const INTmin = Math.min(...data.features.map(feature => feature.properties.int_std2));

        // calcul étendue
        function Extent(min, max) {
            return (max - min);
        }
        const ExtentGFP = Extent(GFPmin, GFPmax);
        const ExtentLAD = Extent(LADmin, LADmax);
        const ExtentINT = Extent(INTmin, INTmax);
        
        // sur une échelle de 100
        function hundredScale(value, min, max) {
            return ((value - min) / (max - min)) * 200 - 100;
        }
        const ScaledGFP = hundredScale(GFP, GFPmin, GFPmax);
        const ScaledLAD = hundredScale(LAD, LADmin, LADmax);
        const ScaledINT = hundredScale(INT, INTmin, INTmax);

        console.log(console.log("scaled values:", ScaledGFP, ScaledLAD, ScaledINT));
        
        const xScale = d3.scaleLinear()
            .domain([-100, 100])  // Adjust the domain to allow negative values
            .range([0, innerWidth]);
        
        const yScale = d3.scaleBand()
            .domain(["GFP", "LAD", "INT"])
            .range([0, innerHeight])
            .padding(0.05);

        var Indicesvg = d3.select("#diag_index").append("svg")
            .attr("width", Graphwidth)
            .attr("height", Graphheight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // axe Y
        Indicesvg.append("g").call(d3.axisLeft(yScale));
        
        // axe X
        Indicesvg.append("g").call(d3.axisBottom(xScale))
            .attr("transform", "translate(2," + innerHeight + ")");

        
        // Barre GFP
        Indicesvg.append('rect')
            .attr('x', d => xScale(Math.min(0, ScaledGFP)))
            .attr('y', yScale("GFP"))
            .attr('width', Math.abs(xScale(ScaledGFP) - xScale(0)))
            .attr('fill', "#33a02c")
            .attr('height', (yScale.bandwidth()/1.7));

        // Barre LAD
        Indicesvg.append('rect')
            .attr('x', d => xScale(Math.min(0, ScaledLAD)))
            .attr('y', yScale("LAD"))
            .attr('width', Math.abs(xScale(ScaledLAD) - xScale(0)))
            .attr('fill', "#7e5438")
            .attr('height', (yScale.bandwidth()/1.7));

        // Barre INT
        Indicesvg.append('rect')
            .attr('x', d => xScale(Math.min(0, ScaledINT)))
            .attr('y', yScale("INT"))
            .attr('width', Math.abs(xScale(ScaledINT) - xScale(0)))
            .attr('fill', "#33a02c")
            .attr('height', (yScale.bandwidth()/1.7));
        
        // Barre moyenne
        Indicesvg.append('rect')
            .attr('x', xScale(0))
            .attr('y', 0)
            .attr('width', (yScale.bandwidth()/20))
            .attr('height', innerHeight - margin.top)
            .attr('fill', "#01665e");
        
        // texte barre moyenne
        Indicesvg.append('text')
            .attr('x', xScale(-50))
            .attr('y', -margin.top +15)
            .text('Valeurs moyennes des VGA') 
            .style('font-family', 'Verdana')
            .style('font-size', '10px')
            .style('font-weight', 'bold')
            .attr('fill', "#01665e");
        /// texte GFP
        // texte GFP
        Indicesvg.append('text')
            .attr('x', function() {
        return xScale(0) - (ScaledGFP > 0 ? xScale(-40): -xScale(-70));
            }) 
            .attr('y', yScale("GFP") + 15)
            .text('Porosité de')
            .style('font-family', 'Verdana')
            .style('font-size', '10px')
            .style('font-weight', 'bold')
            .attr('fill', "#01665e");
        
        // texte GFP 2
        Indicesvg.append('text')
            .attr('x', function() {
        return xScale(0) - (ScaledGFP > 0 ? xScale(-40): -xScale(-70));
            }) 
            .attr('y', yScale("GFP") + 25)
            .text('la couronne')
            .style('font-family', 'Verdana')
            .style('font-size', '10px')
            .style('font-weight', 'bold')
            .attr('fill', "#01665e");
        
        // texte GFP 3
        Indicesvg.append('text')
            .attr('x', function() {
        return xScale(0) - (ScaledGFP > 0 ? xScale(-30): -xScale(-80));
            }) 
            .attr('y', yScale("GFP") + 35)
            .text('Faible <--> Forte')
            .style('font-family', 'Verdana')
            .style('font-size', '10px')
            .style('font-weight', 'bold')
            .attr('fill', "#01665e");
        
        /// texte LAD
        // texte LAD
        Indicesvg.append('text')
            .attr('x', function() {
        return xScale(0) - (ScaledLAD > 0 ? xScale(-40): -xScale(-70));
            }) 
            .attr('y', yScale("LAD") + 15)
            .text('Régularité du')
            .style('font-family', 'Verdana')
            .style('font-size', '10px')
            .style('font-weight', 'bold')
            .attr('fill', "#01665e");
        
        // texte LAD 2
        Indicesvg.append('text')
            .attr('x', function() {
        return xScale(0) - (ScaledLAD  > 0 ? xScale(-50): -xScale(-62));
            }) 
            .attr('y', yScale("LAD") + 25)
            .text(' feuillage')
            .style('font-family', 'Verdana')
            .style('font-size', '10px')
            .style('font-weight', 'bold')
            .attr('fill', "#01665e");
        
        // texte LAD 3
        Indicesvg.append('text')
            .attr('x', function() {
        return xScale(0) - (ScaledLAD  > 0 ? xScale(-30): -xScale(-80));
            }) 
            .attr('y', yScale("LAD") + 35)
            .text('Faible <--> Forte')
            .style('font-family', 'Verdana')
            .style('font-size', '10px')
            .style('font-weight', 'bold')
            .attr('fill', "#01665e");
        
        /// texte INT
        // texte INT
        Indicesvg.append('text')
            .attr('x', function() {
        return xScale(0) - (ScaledINT > 0 ? xScale(-40): -xScale(-70));
            }) 
            .attr('y', yScale("INT") + 15)
            .text('Régularité du')
            .style('font-family', 'Verdana')
            .style('font-size', '10px')
            .style('font-weight', 'bold')
            .attr('fill', "#01665e");
        
                // texte INT 2
        Indicesvg.append('text')
            .attr('x', function() {
        return xScale(0) - (ScaledINT  > 0 ? xScale(-50): -xScale(-62));
            }) 
            .attr('y', yScale("INT") + 25)
            .text(' feuillage')
            .style('font-family', 'Verdana')
            .style('font-size', '10px')
            .style('font-weight', 'bold')
            .attr('fill', "#01665e");
        
        // texte INT 3
        Indicesvg.append('text')
            .attr('x', function() {
        return xScale(0) - (ScaledINT  > 0 ? xScale(-30): -xScale(-80));
            }) 
            .attr('y', yScale("INT") + 35)
            .text('Faible <--> Forte')
            .style('font-family', 'Verdana')
            .style('font-size', '10px')
            .style('font-weight', 'bold')
            .attr('fill', "#01665e");

        
                  
        // barre supérieure
        Indicesvg.append("line")
            .attr("x1", -margin.left)
            .attr("y1", -margin.top)
            .attr("x2", Graphwidth)
            .attr("y2", -margin.top)
            .attr("stroke", "#01665e")
            .attr("stroke-width", 6);
    });
}
    })