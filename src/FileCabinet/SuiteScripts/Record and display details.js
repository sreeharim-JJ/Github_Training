/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 */

define(['N/record', 'N/log'], function(record, log) {

    function execute(context) {

        var rec = record.load({
            type: "customer",
            id: 3171
        });

        var customerName = rec.getValue({
            fieldId: 'altname'
        });

        var customerId = rec.getValue({
            fieldId: 'entityid'
        });

        var salesRepName = rec.getText({
            fieldId: 'salesrep'
        });

        var email = rec.getValue({
            fieldId: 'email'
        });

        var phone = rec.getValue({
            fieldId: 'phone'
        });

        log.debug({
            title: "Customer Details",
            details: "Customer ID: " + customerId +
                     " | Customer Name: " + customerName +
                     " | Sales Rep: " + salesRepName +
                     " | Email: " + email +
                     " | Phone: " + phone
        });
    }

    return {
        execute: execute
    };
});