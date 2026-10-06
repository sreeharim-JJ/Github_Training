/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define([], function () {

    function fieldChanged(context) {

        var currentRecord = context.currentRecord;

       if (

    (context.sublistId === 'item' &&

     (context.fieldId === 'quantity' || context.fieldId === 'rate'))

    ||

    context.fieldId === 'custbodyamt_calc'

) {

            var qty = parseFloat(
                currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity'
                })
            ) || 0;
            console.log("Quantity fetched")

            var rate = parseFloat(
                currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate'
                })
            ) || 0;
            console.log("rate fetched")

            const checkboxValue = currentRecord.getValue({
                fieldId: 'custbodyamt_calc'
            });
            console.log("Amount checkbox fetched")
            if (checkboxValue) {

                currentRecord.setCurrentSublistValue({
                    sublistId:'item',
                    fieldId: 'amount',
                    value: (rate*qty)/2
                });

                console.log('Entered If loop');

            } else {

                currentRecord.setCurrentSublistValue({
                    sublistId:'item',
                    fieldId: 'amount',
                    value: rate*qty
                });

                console.log('Entered else loop');
            }
        }
    }

    return {
        fieldChanged: fieldChanged
    };
});