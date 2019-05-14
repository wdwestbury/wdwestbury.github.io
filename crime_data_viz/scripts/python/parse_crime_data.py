#!/usr/bin/env python3

###################################################
###################################################
###########                          ##############
###########         outline          ##############
###########                          ##############
###################################################
###################################################

# this script will process the crime data extracts from the city and create and save a new geojson file for the heatmap vis
##############################################################
#                   create new data model                    #
##############################################################

    # create basic geojson object with type, and features
        # {
        #     "type": "FeatureCollection",
        #     "features": []
        # }

    # create feature class for new features

        # {
        #     "type": "Feature",
        #     "id": None,
        #     "properties": {
        #         "approximate_address": "false"
        #     },
        #     "geometry": {
        #         "type": "Point",
        #         "coordinates": [

        #         ]
        #     }
        # }



####################################################################
#                   process the crime data file                    #
####################################################################

    # call teh city's api and get crime data

    # loop through each feature

    # add the attributes to feature.properties

    # if the value of feature[attributes][Address] contains "block", Block", or "BLOCK" set feature[properties][approximate_address] = "ture"

    # format the timestamp to be readable

    # geocode the each address using the google geocode api

    # if desired, add some of the data returned to the feature

    # add feature to the new geojson object

    # functions needed *we'll see*
        # 1: add_attributes_to_properies
        # 2: set_approximate_address
        # 3: geocode_address
        # 4: format time stamp
        # 5: add feature to geojson



############################################################
#                   save processed data                    #
############################################################

    # open new file for crime data geojson

    # write results to the file

    # close the file








######################################################
######################################################
###########                             ##############
###########         begin code          ##############
###########                             ##############
######################################################
######################################################

#####################################################################
#                   import all necessary modules                    #
#####################################################################

import json
import re
import requests
import datetime

#########################################################
#                   define variables                    #
#########################################################

# city of madison arcgis server url, there is a part1 and part2, record offset is inserted between them
arc_url_part1 = "https://maps.cityofmadison.com/arcgis/rest/services/Public/OPEN_DB_TABLES/MapServer/2/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset="

arc_url_part2 = "&resultRecordCount=1000&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=pjson"

# flag to determine whether the city arcgis server is still returning data
returning_data = True

# google maps geocoding api and api key
google_maps_geocoding_api = "https://maps.googleapis.com/maps/api/geocode/json"
key = "your key goes here"


# create basic geojson structure (object) with type, and features
geojson_data = {
    "type": "FeatureCollection",
    "features": []
}

# create json object
json_data = {}

# # the geojson file to write to
# geojson_file = "crime_data.geojson"

# # the json file to write to
# json_file = "crime_data.json"

# path to write files to
path = "../../assets/"



#########################################################
#                   define functions                    #
#########################################################



#----------------------------------#
#-- process each crime data file --#
#----------------------------------#
def process_crime_data(returning_data):
    record_offset = 0
    offset_increment = 1000
    url = ""
    initial_record_count = 0
    record_count_limit = 2000

    # while data is still being returned, keep calling the api
    while returning_data == True:
        if record_offset == 0:
            url = arc_url_part1 + arc_url_part2
        else:
            url = arc_url_part1 + str(record_offset) + arc_url_part2

        # call the city's api and get some data
        req = requests.get(url)
        res = req.json()

        # process each feature in the returned data
        for feature in res["features"]:
            if initial_record_count <= record_count_limit:

                # create lon lat by geocoding feature's address
                geographic_data = get_feature_location(feature["attributes"]["Address"])

                # create a new feature using the attributes and lonlat
                new_feature = create_new_feature(feature["attributes"], geographic_data)

                # add feature to geojson
                add_feature_to_geojson(new_feature)

                initial_record_count += 1
            else:
                returning_data = False

        # if the number of features was 1000, increse the offset by 1000. otherwise the api is not returning any more data
        if len(res["features"]) == 1000:
            record_offset += offset_increment
        else:
            returning_data = False




#--------------------------#
#-- create a new feature --#
#--------------------------#
def create_new_feature(attributes, geographic_data):

    # create a feature object
    new_feature =  {
        "type": "Feature",
        "id": attributes["IncidentID"],
        "properties": {
            "approximate_address": "false"
        },
        "geometry": {
            "type": "Point",
            "coordinates": []
        }
    }

    # add the coordinate vals and approximate location to the new feature
    new_feature["geometry"]["coordinates"] = geographic_data["coordinates"]
    new_feature["properties"]["approximate_address"] = geographic_data["approximate_address"]
    
    # add a formatted date
    new_feature["properties"]["incident_date"] = str(datetime.datetime.fromtimestamp(attributes["IncidentDate"]/1000))

    # format the attributes
    format_properties(attributes)

    # assign attributes of old feature to new_feature[properties] and return the new feature
    new_feature["properties"].update(attributes)
    
    # add information to json object
    set_incident_categories_details(new_feature)
    
    # return the new feature
    return new_feature




#-----------------------#
#-- format properties --#
#-----------------------#

def format_properties(properties):
    for key, value in properties.items():
        if isinstance(properties[key], str):
            # strip whitespace from strings
            properties[key] = properties[key].strip()
            # replace all \r or \n with empty space
            properties[key] = replace(properties[key],{"\r": "", "\n": ""})




#--------------------------------#
#-- replace patterns in string --#
#--------------------------------#
def replace(string, substitutions):
    substrings = sorted(substitutions, key=len, reverse=True)
    regex = re.compile('|'.join(map(re.escape, substrings)))
    return regex.sub(lambda match: substitutions[match.group(0)], string)




#----------------------------------------#
#-- get feature's lnglat via geocoding --#
#----------------------------------------#
def get_feature_location(address):

    # the geographic data to be returned (with defaults)
    geographic_data = {
        "approximate_address": "False",
        "coordinates": [999,999]
    }

    # parameters for geocoding api
    params = {
        "address": address + ", Madison, WI",
        "region": "US",
        "key": key
    }

    # # geocode the address
    # req = requests.get(google_maps_geocoding_api, params=params)
    # res = req.json()

    # # if there are results, set the coordinate vals and if the address contains the word block approximate_address = true
    # if len(res["results"]) > 0:
    #     result = res["results"][0]
    #     geographic_data["coordinates"][0] = result["geometry"]["location"]["lng"]
    #     geographic_data["coordinates"][1] = result["geometry"]["location"]["lat"]

    #     if re.search("block", address, re.I):
    #         geographic_data["approximate_address"] = "True"

    # return the geographic data
    return geographic_data




#----------------------------------------#
#-- get details for each incident type --#
#----------------------------------------#
def set_incident_categories_details(new_feature):

    # the keys in the json file
    incident_type_keys = list(json_data.keys())

    # remove the following from the keys, slash, hyphen, begining paren, end paren, and symbol / - ( ) & from the incident type and convert the string to all lower case
    key_value = replace(new_feature["properties"]["IncidentType"], {"/": "_","-": "_","&": "_","(": "_",")": "_", " ": "_"}).lower()

    # if the newly created string is not a key value in the json file add it as an object
    if key_value not in incident_type_keys:
        json_data[key_value] = {
                "key": key_value,
                "category_name": new_feature["properties"]["IncidentType"],
                "number_of_incidents": 1,
                "date_times": [new_feature["properties"]["incident_date"]],
                "geojson": {
                    "type": "FeatureCollection",
                    "features": [new_feature]
                }
        }
    # if it is already a key add one to the total incidents of that type and 
    else:
        # print(json.dumps(new_feature, indent=4))
        json_data[key_value]["number_of_incidents"] += 1
        json_data[key_value]["date_times"].append(new_feature["properties"]["incident_date"])
        json_data[key_value]["geojson"]["features"].append(new_feature)




#-------------------------------------#
#-- add feature to geojson features --#
#-------------------------------------#
def add_feature_to_geojson(new_feature):
    geojson_data["features"].append(new_feature)




#-----------------------------#
#-- create new geojson file --#
#-----------------------------#
def create_new_geojson_file(geojson_file, geojson_data, path):
    with open(path + geojson_file, "w") as f:
        json.dump(geojson_data, f)
    print("geojson written")
    # print(geojson)




#--------------------------#
#-- create new json file --#
#--------------------------#
def create_new_json_file(json_file, json_data, path):
    with open(path + json_file, "w") as f:
        json.dump(json_data, f)
    print("json written")
    # print(json)




#################################################
#                   testing                     #
#################################################
def print_geojson():
    print(json.dumps(geojson, indent=4))

# main
process_crime_data(returning_data)
create_new_geojson_file(geojson_file,geojson_data, path)
create_new_json_file(json_file,json_data, path)
