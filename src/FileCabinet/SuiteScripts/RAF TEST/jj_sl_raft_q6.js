/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget','N/https'],
    
    (serverWidget,https) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            const form = serverWidget.createForm({
                title:'Bitcoin Price List'
            });
            const res = https.get({
                url:'https://api.coindesk.com/v1/bpi/currentprice.json'
            });

            const data=JSON.parse(res.body);

            form.addField({
                id:'custpage_time',
                type:serverWidget.FieldType.TEXT,
                label:'Updated Time'
            });
            const sublist=form.addSublist({
                id:'custpage_list',
                type:serverWidget.FieldType.LIST,
                label:'Currency'
            });
            sublist.addField({
                id:'rate',
                type:serverWidget.FieldType.TEXT,
                value:'Rate'
            });
            sublist.addField({
                id:'description',
                type:serverWidget.FieldType.TEXT,
                value:'Desciption'
            });
            sublist.addField({
                id:'ratefloat',
                type:serverWidget.FieldType.TEXT,
                value:'Rate in float'
            });

            const line=0;

            for (const key in data.bpi){
                sublist.setSublistValue({
                    id:'currency',
                    line:line,
                    value:data.bpi[key].code
                });
                sublist.setSublistValue({
                    id:'rate',
                    line:line,
                    value:data.bpi[key].rate
                });
                sublist.setSublistValue({
                    id:'description',
                    line:line,
                    value:data.bpi[key].description
                });
                sublist.setSublistValue({
                    id:'ratefloat',
                    line:line,
                    value:String(data.bpi[key].ratefloat)
                });
                line++;
            }

            form.addButton({
                id:'custpage_refresh',
                label:'Refresh',
                functionName:'location.reload'
            });
            form.addField({
                id:'custpage_html',
                type:serverWidget.FieldType.INLINEHTML,
                label:'html'
            }).defaultValue = '<script>function locationreload(){location.reload();}</script>';

            scriptContext.response.writePage(form);
        }

        return {onRequest:onRequest};

    });