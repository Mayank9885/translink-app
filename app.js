import promptSync from "prompt-sync";
const prompt = promptSync({
    sigint: false
});
import fetch from "node-fetch";
//import fs from "fs/promises";
import {
    parse
} from "csv-parse";
import fs from "fs";
import {
    delimiter
} from "path";

function main() {
    

    //API url's and text file's variable initialization

    const tripURL = "http://127.0.0.1:5343/gtfs/seq/trip_updates.json";
    const positionURL = "http://127.0.0.1:5343/gtfs/seq/vehicle_positions.json";
    const alertURL = "http://127.0.0.1:5343/gtfs/seq/alerts.json";
    let routeText = "static-data/routes.txt"
    let tripText = "static-data/trips.txt"
    let calenderText = "static-data/calendar.txt"
    let times = "static-data/stop_times.txt"
    

    //Prompts
    console.log("Welcome to the UQ Lakes station bus tracker!");

    
    const messageDate = prompt("What date will you depart UQ Lakes station by bus YYYY-MM-DD? ");

    //checks if date is in right format
    var date = new Date(messageDate)
    let messageTime = prompt("what time HH:MM")
    var time_regex = /^^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;


    //checks if time is in right format and converts to required format
    if (!(time_regex.test(messageTime))) {
        console.log("Invalid time format. Enter time in HH:MM format")
        main();
    } 
    
    var messageDateCheck = new Date();
    messageDateCheck = messageDateCheck.toLocaleString('sv');
    var currentDate = messageDateCheck.substring(0, 10);


    var dateTime = messageDate + ' ' + messageTime + ':00';
    var startTime = messageTime + ':00';
    dateTime = Date.parse(dateTime);
    var newDateObj = new Date(dateTime + 600000);
    newDateObj = newDateObj.toLocaleString('sv');
    var calTime = newDateObj.substring(newDateObj.length - 8);
    var calDate = newDateObj.substring(0, 10);
    calDate = calDate.replace('-', '');
    calDate = calDate.replace('-', '');
    currentDate = currentDate.replace('-', '');
    currentDate = currentDate.replace('-', '');

    //Global variables

    const data = [];
    const trips = [];
    const cal = [];
    const stop_time = [];
    const stop_name = [];
    let calcount = 0;
    let i = 0;
    let j = 0;
    let tripCount = 0;
    let count = 0;
    const arr = [];
    const tripArr = [];

    const finalArr1 = [];
    let tripIdcount = 0;
    let stopCount = 0;
    let stopNameCount = 0;
    let routeCount = 0;
    let finalCount = 0;
    let arrCount = 0;
    let urlCount = 0;
    const finalArr2 = [];
    let apiArr = [];
    let apiArrCount = 0;
    let flag = "0";


    //Reads calendar.txt and parses the file to get service_id
    fs.createReadStream(calenderText)
        .pipe(
            parse({
                delimiter: ",",
                columns: true,
                ltrim: true,
            })
        )
        .on("data", function(row) {
            // push the object row into the array
            cal.push(row);
        })
        .on("error", function(error) {
            console.log(error.message);
        })
        .on("end", function() {
            // log the result array
            //matching date with cal start date
            calcount = Object.keys(cal).length;
            for (i = 0; i < calcount; i++) {
                if (calDate == cal[i].start_date) {

                    arr.push(cal[i].service_id);
                    count++;
                }

            }



            //Reads trip.txt and parses the file to match service_id in text file
            fs.createReadStream(tripText)
                .pipe(
                    parse({
                        delimiter: ",",
                        columns: true,
                        ltrim: true,
                    })
                )
                .on("data", function(row) {
                    // push the object row into the array
                    trips.push(row);
                })
                .on("error", function(error) {
                    console.log(error.message);
                })
                .on("end", function() {
                    //log the result array
                    tripCount = Object.keys(trips).length;
                    for (i = 0; i < count; i++) {
                        for (j = 0; j < tripCount; j++) {
                            
                            if (arr[i] == trips[j].service_id) {
                                tripArr.push(trips[j]);
                                tripIdcount++;
                               
                            }
                        }

                    }

                    //Reads stops_time.txt and parses the file
                    fs.createReadStream(times)
                        .pipe(
                            parse({
                                delimiter: ",",
                                columns: true,
                                ltrim: true,
                            })
                        )
                        .on("data", function(row) {
                            //push the object row into the array
                            stop_time.push(row);
                        })
                        .on("error", function(error) {
                            console.log(error.message);
                        })
                        .on("end", function() {
                            //log the result array

                            stopCount = Object.keys(stop_time).length;

                            for (j = 0; j < stopCount; j++) {


                                if (stop_time[j].arrival_time >= startTime && stop_time[j].arrival_time < calTime && (stop_time[j].stop_id == "1882" || stop_time[j].stop_id == "1853" || stop_time[j].stop_id == "1877" || stop_time[j].stop_id == "1878" || stop_time[j].stop_id == "1880" || stop_time[j].stop_id == "1883")) {
                                    


                                    for (i = 0; i < tripIdcount; i++) {
                                        

                                        
                                        if (tripArr[i].trip_id== stop_time[j].trip_id) {
                                            
                                            
                                            
                                            finalArr1.push(tripArr[i]);
                                            finalArr2.push(stop_time[j]);
                                        }
                                    }
                                }

                            }

                            //Reads route.txt and parses the file to get the required output

                            fs.createReadStream(routeText)
                                .pipe(
                                    parse({
                                        delimiter: ",",
                                        columns: true,
                                        ltrim: true,
                                    })
                                )
                                .on("data", function(row) {
                                    //push the object row into the array
                                    data.push(row);
                                })
                                .on("error", function(error) {
                                    console.log(error.message);
                                })
                                .on("end", function() {
                                    //log the result array

                                    routeCount = Object.keys(data).length;
                                    finalCount = Object.keys(finalArr1).length;
                                    
                                    for (i = 0; i < finalCount; i++) {

                                        for (j = 0; j < routeCount; j++) {

                                            if (finalArr1[i].route_id == data[j].route_id && finalArr1[i].trip_id == finalArr2[i].trip_id) {
                                                
                                                console.log("Route short: ", data[j].route_short_name, "Route Long: ", data[j].route_long_name, "Service ID: ", finalArr1[i].service_id, "Destination: ", finalArr1[i].trip_headsign, "Arrival Time: ", finalArr2[i].arrival_time)
                                                arrCount++
                                            }
                                        }

                                    }


                                    // Fetches Data from the urls and compared the outout with above files results

                                    if (currentDate == calDate) {


                                        fetch(tripURL)

                                            .then(function(response) {

                                                return response.json();

                                            })
                                            .then(function(tripURL) {

                
                                                var x = JSON.parse(JSON.stringify(tripURL));
                                                apiArr = apiArr.push(Object.values(x.entity));
                                                var iter = x.entity.map(o => o.tripUpdate)
                                                const iterCollection = [].concat(...iter)
                                                
                                                try {
                                                    
                                                        for (var i = 0; i < iterCollection.length; i++) {
                                                            if( Object.keys(iterCollection[i]).some(key => key === 'stopTimeUpdate')) {
                                                            //console.log(iterCollection[i])
        
        
                                                            var objKeys = (Object.keys(iterCollection[i].stopTimeUpdate).length)
                                                            
                                                            for (var k = 0; k < objKeys; k++) {
        
                                                                if (iterCollection[i].stopTimeUpdate[k].stopId == "1882" || iterCollection[i].stopTimeUpdate[k].stopId == "1853" || iterCollection[i].stopTimeUpdate[k].stopId == "1877" || iterCollection[i].stopTimeUpdate[k].stopId == "1878" || iterCollection[i].stopTimeUpdate[k].stopId == "1880" || iterCollection[i].stopTimeUpdate[k].stopId == "1883") {
                                                                    
                                                                    try {
                                                                        
                                                                        if (Object.keys(iterCollection[i].stopTimeUpdate[k]).some(key => key === 'arrival')) {
        
                                                                            var tripArrival = parseInt(iterCollection[i].stopTimeUpdate[k].arrival.time)
        
                                                                            var d = new Date(tripArrival * 1000)
                                                                            d = d.toLocaleString('sv')
                                                                            var tripTime = d.substring(d.length - 8);
                                                                            if (tripTime >= startTime && tripTime <= calTime) {
                                                                                
                                                                                for (j = 0; j < tripCount; j++) {
                                                            
                                                                                    
                                                                                    if (trips[j].trip_id == iterCollection[i].trip.tripId) {
                                                                                        for (var x = 0; x < routeCount; x++) {
                                                                                            if (data[x].route_id == trips[j].route_id) {
                                                                                                for (var y = 0; y < stopCount; y++) {
                                                                                                    if (trips[j].trip_id == stop_time[y].trip_id && stop_time[y].stop_id == iterCollection[i].stopTimeUpdate[k].stopId) {
                                                                                                        console.log("Scheduled arrival time : ", stop_time[y].arrival_time, "Live arrival Time: ", tripTime, "Service id: ", trips[j].service_id,
                                                                                                            "Route short: ", data[x].route_short_name, "Route Long: ", data[x].route_long_name, "Destination sign: ",
                                                                                                            trips[j].trip_headsign)
                                                                                                    }
        
        
        
                                                                                                }
        
        
                                                                                            }
        
                                                                                        }
        
                                                                                    }
                                                                                }
        
                                                                            }
                                                                        }
                                                                    } catch (error) {
                                                                        console.error(error);
                                                                    }
        
                                                                }
        
        
        
                                                            }
        
                                                        }

                                                    }

                                                } catch (error){
                                                    console.error(error);

                                                }

                                                



                                            })
                                            .then(function(entry) {
                                                let endInput = prompt("Would you like to search again?  ");
                                                endInput = endInput.toLowerCase(endInput);
                                                if (endInput == "y" || endInput == "yes") {
                                                    main()
                                                } else if (endInput == "n" || endInput == "no") {
                                                    console.log("Thanks for using the UQ Lakes station bus tracker!")
                                                }

                                            })



                                    } else {
                                        let endInput = prompt("Would you like to search again?  ");
                                        endInput = endInput.toLowerCase(endInput);
                                        if (endInput == "y" || endInput == "yes") {
                                            main()
                                        } else if (endInput == "n" || endInput == "no") {
                                            console.log("Thanks for using the UQ Lakes station bus tracker!")
                                        }

                                    }
                                })
                        })

                })




        });




}



main()