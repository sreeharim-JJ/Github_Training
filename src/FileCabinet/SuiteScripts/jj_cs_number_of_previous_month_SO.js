/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/search'], function(search) {

    function fieldChanged(scriptContext) {

        try {

            if (scriptContext.fieldId !== 'entity') {
                return;
            }

            var currentRecord = scriptContext.currentRecord;

            var customerId = currentRecord.getValue({
                fieldId: 'entity'
            });

            console.log('Customer ID: ' + customerId);

            if (!customerId) {
                console.log('No customer selected');
                return;
            }

            var salesOrderSearch = search.create({
                type: search.Type.SALES_ORDER,
                filters: [
                    ['entity', 'anyof', customerId],
                    'AND',
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['trandate', 'within', 'lastmonth']
                ]
            });

            var count = salesOrderSearch.runPaged().count;

            console.log('Previous Month SO Count: ' + count);

            currentRecord.setValue({
                fieldId: 'custbody21',
                value: count
            });

            console.log('Value set in custbody21: ' + count);

        } catch (e) {

            console.log('ERROR NAME: ' + e.name);
            console.log('ERROR MESSAGE: ' + e.message);

            alert(
                'Error: ' +
                e.name +
                ' - ' +
                e.message
            );
        }
    }

    return {
        fieldChanged: fieldChanged
    };

});