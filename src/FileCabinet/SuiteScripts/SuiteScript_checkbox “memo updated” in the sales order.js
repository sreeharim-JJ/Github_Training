/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log'], function(record, log) {

    function beforeSubmit(context) {

        var rec = context.newRecord;
        if (rec.type === record.Type.SALES_ORDER) {

        var memoUpdated = rec.getValue({
            fieldId: 'custbody18'
        });

        if (memoUpdated) {
            rec.setValue({
                fieldId: 'memo',
                value: 'memo updated'
            });
        }
         log.debug({
            title: 'Execution Log',
            details: 'beforeSubmit triggered successfully'
        });

    }
}

    return {
        beforeSubmit: beforeSubmit
    };

});