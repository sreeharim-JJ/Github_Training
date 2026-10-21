/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/file', 'N/https', 'N/ui/serverWidget'],
    /**
 * @param{file} file
 * @param{https} https
 * @param{serverWidget} serverWidget
 */
    (file, https, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
 
 
        function cleanValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    if (Array.isArray(value)) {
        value = value.join(' ');   // preciptype can be a list
    }
    value = String(value);
    if (value.indexOf(',') !== -1 || value.indexOf('"') !== -1) {
        value = '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
}
 
 
        const onRequest = (scriptContext) => {
            let form = serverWidget.createForm({
                title:'Weather'
            });
               
            let currentLocation = form.addField({
                id: 'custpage_location',
                type: serverWidget.FieldType.TEXT,
                label: 'Location'
            });
            let currentdate = form.addField({
                id: 'custpage_date',
                type: serverWidget.FieldType.DATE,
                label: 'Date'
            });
            let stepField = form.addField({
                id: 'custpage_step',
                type: serverWidget.FieldType.TEXT,
                label: 'Step'
            });
 
            stepField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            if(scriptContext.request.method === "POST"){
 
                let params = scriptContext.request.parameters;
                let locationWeather = params.custpage_location;
                let dateWeather = params.custpage_date;
                //
                currentLocation.defaultValue = locationWeather;
                currentdate.defaultValue = dateWeather;
                //
                let dateObj = new Date(dateWeather);
 
                let formattedDate =
                    dateObj.getFullYear() + '-' +
                    String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
                    String(dateObj.getDate()).padStart(2, '0');
                if (params.custpage_step === 'download') {
 
 
                // call the API again with the same location and date
                    let response = https.get({
                        url: 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/' + encodeURIComponent(locationWeather) + '/' + encodeURIComponent(formattedDate) +'?key=NLNKFY2UP85NBLCRWFHAPTT5V',
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'Mozilla/5.0 (compatible; NetSuite)'
                        }
                    });
                    let data = JSON.parse(response.body);
                    let hours = data.days[0].hours;
 
                    // build the CSV text: first the header line, then one line per hour
                    let csv = 'datetime,datetimeEpoch,temp,feelslike,humidity,dew,precip,precipprob,snow,snowdepth,preciptype,windgust\n';
 
                    for (let i = 0; i < hours.length; i++) {
                        let h = hours[i];
                        csv += cleanValue(h.datetime) + ','
                            + cleanValue(h.datetimeEpoch) + ','
                            + cleanValue(h.temp) + ','
                            + cleanValue(h.feelslike) + ','
                            + cleanValue(h.humidity) + ','
                            + cleanValue(h.dew) + ','
                            + cleanValue(h.precip) + ','
                            + cleanValue(h.precipprob) + ','
                            + cleanValue(h.snow) + ','
                            + cleanValue(h.snowdepth) + ','
                            + cleanValue(h.preciptype) + ','
                            + cleanValue(h.windgust) + '\n';
                    }
 
                    // create the file and send it to the browser as a download
                    let csvFile = file.create({
                        name: 'weather_' + formattedDate + '.csv',
                        fileType: file.Type.CSV,
                        contents: csv
                    });
                    scriptContext.response.writeFile({
                        file: csvFile,
                        isInline: false
                    });
                    stepField.defaultValue = 'search';
                    form.addSubmitButton({
                        label: 'Search'
                    });
                    return;   // important: stops the script so it doesn't try to draw the form too
 
 
                   
                }
                else{
                    stepField.defaultValue = 'download';
 
                    form.addSubmitButton({
                        label: 'Download'
                    });
                    /////sublist
                    let sublist = form.addSublist({
                        id: 'custpage_sublistid',
                        type: serverWidget.SublistType.LIST,
                        label: 'Weather'
                    });
 
                   
 
                    sublist.addField({
                        id: 'custpage_datetime',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Date Time'
                    });
                    sublist.addField({
                        id: 'custpage_datetimeepoch',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Date Time Epoch'
                    });
                    sublist.addField({
                        id: 'custpage_temp',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Temperature'
                    });
                    sublist.addField({
                        id: 'custpage_feelslike',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Feels like'
                    });
                    sublist.addField({
                        id: 'custpage_humidity',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Humidity'
                    });
                    sublist.addField({
                        id: 'custpage_dew',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Dew'
                    });
                    sublist.addField({
                        id: 'custpage_precip',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Precipitation'
                    });
                    sublist.addField({
                        id: 'custpage_precipprob',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Precipprob'
                    });
                    sublist.addField({
                        id: 'custpage_snow',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Snow'
                    });
                    sublist.addField({
                        id: 'custpage_snowdepth',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Snow Depth'
                    });
                    sublist.addField({
                        id: 'custpage_preciptype',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Preciptype'
                    });
                    sublist.addField({
                        id: 'custpage_windgust',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Windgust'
                    });
                    /////
//                     let url =
//     'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/'
//     + encodeURIComponent(locationWeather)
//     + '/'
//     + encodeURIComponent(formattedDate)
//     + '?key=NLNKFY2UP85NBLCRWFHAPTT5V';
 
// log.debug('url', url);
                    /// https
                    let response = https.get({
                    url: 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/' + encodeURIComponent(locationWeather) + '/' + encodeURIComponent(formattedDate) +'?key=NLNKFY2UP85NBLCRWFHAPTT5V',
                     headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; NetSuite)',
        'Content-Type': 'application/json'
    }
                        });
                    log.debug({
                        title:'sucess',
                        details:response.body.substring(0,500)
                    })
                    let data = JSON.parse(response.body);
                   
                    ////
                    for(let line=0;line<data.days.length;line++)
                    {
                        sublist.setSublistValue({
                            id: 'custpage_datetime',
                            line: line,
                            value: data.days[line].datetime || 'null'
                        });
 
                        sublist.setSublistValue({
                            id: 'custpage_datetimeepoch',
                            line: line,
                            value: data.days[line].datetimeEpoch || 'null'
                        });
 
                        sublist.setSublistValue({
                            id: 'custpage_temp',
                            line: line,
                            value: data.days[line].temp || 'null'
                        });
                       
                        sublist.setSublistValue({
                            id: 'custpage_feelslike',
                            line: line,
                            value: data.days[line].feelslike || 'null'
                        });
                        sublist.setSublistValue({
                            id: 'custpage_humidity',
                            line: line,
                            value: data.days[line].humidity || 'null'
                        });
                        sublist.setSublistValue({
                            id: 'custpage_dew',
                            line: line,
                            value:data.days[line].dew || 'null'
                        });
                        sublist.setSublistValue({
                            id: 'custpage_precip',
                            line: line,
                            value: data.days[line].precip || 'null'
                        });
                        sublist.setSublistValue({
                            id: 'custpage_precipprob',
                            line: line,
                            value: data.days[line].precipprob || 'null'
                        });
                        sublist.setSublistValue({
                            id: 'custpage_snow',
                            line: line,
                            value:data.days[line].snow || 'null'
                        });
                        sublist.setSublistValue({
                            id: 'custpage_snowdepth',
                            line: line,
                            value: data.days[line].snowdepth || 'null'
                        });
                        sublist.setSublistValue({
                            id: 'custpage_preciptype',
                            line: line,
                            value: data.days[line].preciptype || 'null'
                        });
                        sublist.setSublistValue({
                            id: 'custpage_windgust',
                            line: line,
                            value: data.days[line].windgust || 'null'
                        });
                    }
                   
                }
            }
            else {
 
                stepField.defaultValue = 'search';
 
                form.addSubmitButton({
                    label: 'Get Weather Data'
                });
 
            }
            scriptContext.response.writePage(form);
        }
 
        return {onRequest}
 
    });