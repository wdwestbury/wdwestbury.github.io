#!/usr/bin/env python3

# this script will request the crime data from the city of madison's arc server
# for the first api call, start with no record offset, for the next call add 1000 to 
# the offset value, keep calling the api if the api is returning features but stop if 
# it fails to return any resultOffset

######################################################
######################################################
###########                             ##############
###########         begin code          ##############
###########                             ##############
######################################################
######################################################

# import modules
import requests
import json

# define variables
returning_data = True

urlp1 = "https://maps.cityofmadison.com/arcgis/rest/services/Public/OPEN_DB_TABLES/MapServer/2/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset="

urlp2 = "&resultRecordCount=1000&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=pjson"

# make first api call

# if the call returns results, add 1000 to the offset, and call it again
def call_crime_data_api(returning_data):
    print("getting crime data")
    # set record offset value and offset increment
    total_records = 0
    record_offset = 0
    offset_increment = 1000
    url = ""

    # while the api keeps returning data keep calling it
    while returning_data == True:
        
        # set the url val
        if record_offset == 0:
            url = urlp1 + urlp2
        else:
            url = urlp1 + str(record_offset) + urlp2

        # call the api
        req = requests.get(url)
        res = req.json()

        # if the number of results is 1000 increase the record offset by 1000, if not, increase by the number of results
        if len(res["features"]) == 1000:
            total_records += 1000
            record_offset += offset_increment
        else:
            total_records += len(res["features"])
            returning_data = False

    # print total number of records
    print(total_records)




# main
call_crime_data_api(returning_data)
