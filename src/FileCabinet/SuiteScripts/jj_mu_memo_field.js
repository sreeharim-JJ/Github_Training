/**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 */
define(['N/record'], function(record) {

    function each(params) {

        record.submitFields({
            type: record.Type.SALES_ORDER,
            id: params.id,
            values: {
                memo: 'Memo updated'
            }
        });

    }

    return {
        each: each
    };

});