// Create a new field in the customer record called ‘Short name’.
// Update the field value in all records with short names. The short name convention is:
// First 2 characters of the customer’s name: date created month (01) 
// E.g., Customer’s name is Alan and created in October, the short name will be Al: 10


/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log'], function(record, log) {

    function afterSubmit(context) {

        if (context.type !== context.UserEventType.CREATE) {
            return;
        }

        var rec = context.newRecord;

        var customerName =
            rec.getValue('companyname') ||
            rec.getValue('entityid');

        var month = ('0' + (new Date().getMonth() + 1)).slice(-2);

        var shortName = customerName.substring(0, 2) + ':' + month;

        record.submitFields({
            type: record.Type.CUSTOMER,
            id: rec.id,
            values: {
                custentitycustentity_short_name: shortName
            }
        });

        log.debug('Short Name', shortName);
    }

    return {
        afterSubmit: afterSubmit
    };
});