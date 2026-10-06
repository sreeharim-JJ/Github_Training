/**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 */
define(['N/record', 'N/log'], function(record, log) {

    function each(params) {

        try {

            var invoiceRec = record.load({
                type: record.Type.INVOICE,
                id: params.id
            });

            invoiceRec.setValue({
                fieldId: 'duedate',
                value: new Date('10/15/2026')
            });

            invoiceRec.save({
                enableSourcing: false,
                ignoreMandatoryFields: true
            });

        } catch (e) {

            log.error({
                title: 'Invoice ' + params.id,
                details: e
            });
        }
    }

    return {
        each: each
    };

});