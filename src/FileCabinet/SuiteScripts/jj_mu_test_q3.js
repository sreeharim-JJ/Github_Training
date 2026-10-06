/**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 */
define(['N/record', 'N/log'], (record, log) => {

    function each(context) {

        try {

            let bookRecord = record.load({
                type: 'customrecord934',
                id: context.id
            });

            let currentDueDate = bookRecord.getValue({
                fieldId: 'custrecord1424'
            });

            let newDueDate = new Date(currentDueDate);
            newDueDate.setDate(newDueDate.getDate() + 7);

            record.submitFields({
                type: 'customrecord934',
                id: context.id,
                values: {
                    custrecord1424: newDueDate
                }
            });

            log.debug({
                title: 'Due Date Extended',
                details: 'Record ID: ' + context.id
            });

        } catch (e) {

            log.error({
                title: 'Error',
                details: e
            });

        }
    }

    return {
        each: each
    };
});