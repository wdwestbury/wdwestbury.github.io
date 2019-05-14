//////////////////////////////////////////
//                                      //
//          declare variables           //
//                                      //
//////////////////////////////////////////

    // map
    var map = L.map('map').setView([43.087806, -89.4], 13);

    // state
    var state = {
        "geojson": {},
        "total_incidents": 0,
        "total_incident_categories": 0,
        "incident_categories_details": {},
        "crime_categories": [],
        "layers": {}
    };



//////////////////////////////////////////
//                                      //
//          declare functions           //
//                                      //
//////////////////////////////////////////

    //------------------------------------//
    //          set map options           //
    //------------------------------------//
        var set_map_options = () => {
            // load a tile layer
            L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                minZoom: 9
            }).addTo(map);

            map.setZoom(12);
        };

        // var cartoDB_Map = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
		// {
		// 	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
		// 	subdomains: 'abcd',
		// }).addTo(map);

    //--------------------------------------------------------//
    //          set the height of the map container           //
    //--------------------------------------------------------//
        var set_map_height = () => {
            // var padding equals padding for map and navbar in px
            // (might want another way to do this)
            let padding = 46;
            let nav_height = $("#navbar").height();
            let window_height = $(window).height();
            let search_header_height = $("#search_header").height();
            let search_footer_height = $("#search_footer").height();

            $("#map").height(window_height - nav_height - padding);
            $("#filter_list").height(window_height - nav_height - padding - search_header_height - search_footer_height -90);
        };

    //---------------------------------------------------------//
    //          set the initial data for the heatmap           //
    //---------------------------------------------------------//
        var set_initial_data = () => {

            fetch("assets/crime_data.geojson")
                // get the data
                .then((response) => {
                    return response.json();
                })

            // $.getJSON("assets/crime_data.geojson", (data) => {
            //     // set globals
            //     set_global_variables(data);

            //     // create a data table

            // // if I wanted to set some data initially I could make something like the following work
            // // I'd need to name the data, might be a good idea to name the layers all_incidents, all_heatmap, all_clusters

            //     // create_point_cluster_layer(data);
            //     // create heatmap
            //     // locations = create_heatmap_coordinates(data);
            //     // create_heatmap(locations);

            // })
        };

    //-------------------------------------------------//
    //          get data for from crime-json           //
    //-------------------------------------------------//
        var get_crime_categories = () => {

            fetch("assets/crime_data.json")
                // get the data
                .then((response) => {
                    return response.json();
                })
                // create the options for the checkboxed
                .then((json) => {
                    Object.keys(json).forEach((key) => {
                        state.crime_categories.push({
                            "key": json[key]["key"],
                            "category_name": json[key]["category_name"],
                            "number_of_incidents": json[key]["number_of_incidents"]
                        });
                    });
                })
                // sort the options and create the checkboxes
                .then(() => {
                    state.crime_categories = sort_object_by_property(state.crime_categories, "key");
                    create_crime_category_checkboxes();
                })
                // create the event for clicking a checkbox
                .then(() => {
                    $(".super_input").change(function(e) {
                        if(this.checked) {
                            // add the point layer
                            add_point_layer($(this).val());
                        } else {
                            // remove the point layer
                            remove_point_layer($(this).val());
                        };
                    });
                });
        };

    //-------------------------------------------------//
    //          add a point layer to the map           //
    //-------------------------------------------------//
        var add_point_layer = (layer_name) => {
            fetch("assets/crime_data.json")
                // get the data from the geojson file
                .then((response) => {
                    return response.json();
                })
                .then((json) => {
                    // create cluster point layer
                    create_point_cluster_layer(json[layer_name].geojson, layer_name);
                    // create a heatmap layer
                    let locations = create_heatmap_coordinates(json[layer_name].geojson);
                    create_heatmap(locations, layer_name);
                })
        };

    //----------------------------------------------------//
    //          remove a point layer to the map           //
    //----------------------------------------------------//
        var remove_point_layer = (layer_name) => {
            map.removeLayer(state.layers[layer_name + "_incidents"]);
            map.removeLayer(state.layers[layer_name + "_clusters"]);
            map.removeLayer(state.layers[layer_name + "_heatmap"]);
        };  

    //--------------------------------------------//
    //          sort object by property           //
    //--------------------------------------------//
        var sort_object_by_property = (obj, property) => {
            return obj.sort((a, b) => a[property].localeCompare(b[property]));
        };

    //-----------------------------------------//
    //          set global variables           //
    //-----------------------------------------//
        var set_global_variables = (geojson) => {

            // set geojson
            state.geojson = geojson;

            // set total number of incidents
            state.total_incidents = geojson.features.length;

            // set incident categories details
            state.incident_categories_details = set_incident_categories_details(geojson.features);

            // set total number of categories
            state.total_incident_categories = Object.keys(state.incident_categories_details).length;

        };

    //-------------------------------------------------------//
    //          get details for each incident type           //
    //-------------------------------------------------------//
        set_incident_categories_details = (incidents) => {
            // there should be an object for each category of incident.
            // each object's key will be the type of incident, object 
            // properties include a formatted name, a key val, and
            // the total number of incidents for that type

            let incident_types = {};

            for (let i = 0; i < incidents.length; i++){

                let incident_type_keys = Object.keys(incident_types);
                // will need to remove the following from the keys, slash, hyphen, begining paren, end paren, and symbol / - ( ) &
                let new_string = incidents[i].properties.IncidentType.replace(/-|&/g,"_").toLowerCase().split(" ").join("_");
                // let new_string = incidents[i].properties.IncidentType.replace(/-|(|)|&|/\/|/g,"_")

                // convert key to lower case, replace spaces with underscores
                // let key_value = incidents[i].properties.IncidentType.toLowerCase().split(" ").join("_");

                let key_value = new_string;
                if (incident_type_keys.indexOf(key_value) == -1) {
                    // add a incident details category object for category not found
                    incident_types[key_value] = {
                        "key": key_value,
                        "category_name": incidents[i].properties.IncidentType,
                        "number_of_incidents": 1,
                        "date_times": [incidents[i].properties.incident_date]          
                    };
                } else {
                    // add one to the total number of incident types for that category and add the datetime to the datetime
                    incident_types[key_value]["number_of_incidents"] += 1;
                    incident_types[key_value]["date_times"].push(incidents[i].properties.incident_date);
                };
            };

            return incident_types
        };
    
    //----------------------------------------------------//
    //          create coordinates from geojson           //
    //----------------------------------------------------//
        var create_heatmap_coordinates = (geojson) => {
                return geojson.features.map((incident) => {
                let location = incident.geometry.coordinates.reverse();
                location.push(5);
                return location;
            });
        };

    //----------------------------------------------------------//
    //          create heatmap layer from coordinates           //
    //----------------------------------------------------------//
        var create_heatmap = (coordinates, layer_name) => {
            let heat_map = L.heatLayer(coordinates, {radius: 25});
            state.layers[layer_name + "_heatmap"] = heat_map;
            map.addLayer(heat_map);
        };

    //-----------------------------------------//
    //          create cluster layer           //
    //-----------------------------------------//
        var create_point_cluster_layer = (data, layer_name) => {

            // for now these options will do, might be good to have a style for each category
            let marker_options = {
                radius: 4,
                fillColor: "#c03aff",
                color: "#d37c1f",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };


            let incidents = L.geoJson(data, {
                pointToLayer: (feature, latlng) => {
                    let incident_date = feature.properties.incident_date.split(" ")[0];

                    return L.circleMarker(latlng, marker_options).bindPopup(`
                    <div class="card" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title">${feature.properties.IncidentType}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">

                            <div>
                                <span class="popup-label">Date:</span>
                                <div class="popup-details">${incident_date}</div>
                            </div>
                            <br />
                            <div>
                                <span class="popup-label">Address:</span>
                                <div class="popup-details">${feature.properties.Address}</div>
                            </div>
                            <br />
                            <div>
                                <span class="popup-label">Details:</span>
                                <div class="popup-details incident-details">${feature.properties.Details}</div>
                            </div>
                        </div>
                    </div>`)
                }
            });

            // create a incidents layer and add it to the map
            state.layers[layer_name + "_incidents"] = incidents;
            // create a incidents layer and a pointer to state.layer
            map.addLayer(incidents);

            // create a clusters layer and add it to the map
            let clusters = L.markerClusterGroup({
                    iconCreateFunction: (cluster) => {
                        return L.divIcon({html: '<b>' + cluster.getChildCount() + '</b>',className: "custom-cluster-icon"})
                    }
                });
            clusters.addLayer(incidents);
            state.layers[layer_name + "_clusters"] = clusters;
            // create a clusters layer and a pointer to state.layer
            map.addLayer(clusters);
        };


    //--------------------------------------//
    //          add points to map           //
    //--------------------------------------//
        var add_incidents_to_map = () => {
            console.log("adding incidents");
        };

    //----------------------------------------------//
    //          clear all selected points           //
    //----------------------------------------------//
        var clear_selection = () => {
            $(".super_input").prop("checked", false);
            Object.keys(state.layers).forEach((key) => {
                map.removeLayer(state.layers[key]);
            });
        };

    //----------------------------------//
    //          test function           //
    //----------------------------------//
        var log_test = (m) => {
            console.log(m)
        };

    //------------------------------------------------------------------//
    //          create checkbox list for filtering crime data           //
    //------------------------------------------------------------------//
    var create_crime_category_checkboxes = () => {
        let dropdown = $("#filter_list");

        // loop through data and append a checkbox for each item to list
        for(d=0;d<state.crime_categories.length;d++) {

            // custom checkbox
            let input_item = `
                <div 
                    class='custom-control custom-checkbox super_custom_checkbox'>
                    <input 
                        type='checkbox' 
                        class='custom-control-input super_input' 
                        id='${state.crime_categories[d].key}' 
                        value='${state.crime_categories[d].key}' >
                    <label 
                        class='custom-control-label super_custom_input_item' 
                        for='${state.crime_categories[d].key}'>
                        ${state.crime_categories[d].category_name}(${state.crime_categories[d].number_of_incidents})
                    </label>
                </div>         
            `
            
            


            // append the checkbox
            dropdown.append(input_item);
        };
    };




/////////////////////////////
//                         //
//          main           //
//                         //
/////////////////////////////

        $(document).ready(() => {
            //------------------------------//
            //          map setup           //
            //------------------------------//
                set_map_height();
                set_map_options();
            //-------------------------------//
            //          data setup           //
            //-------------------------------//
                set_initial_data();
                get_crime_categories();

        })
    
    


