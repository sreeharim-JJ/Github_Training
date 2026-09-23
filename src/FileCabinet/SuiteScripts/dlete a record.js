/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 */

define(['N/record', 'N/log'], function(record, log) {

    function execute(context) {

        var contactId = record.delete({
            type: "contact",
            id: 1853
        });

        log.debug({
            title: "Contact Deleted",
            details: "Deleted Contact ID: " + contactId
        });
    }

    return {
        execute: execute
    };
});
