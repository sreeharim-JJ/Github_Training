/**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 */
define(['N/record', 'N/log'], function(record, log) {

    function each(params) {

        try {

            record.submitFields({
                type: 'customrecord921',
                id: params.id,
                values: {
                    custrecord1408: 1
                }
            });

            log.audit({
                title: 'Record Updated',
                details: 'Record ID ' + params.id + ' updated to Married.'
            });

        } catch (e) {

            log.error({
                title: 'Error Updating Record ' + params.id,
                details: e
            });
        }
    }

    return {
        each: each
    };

});