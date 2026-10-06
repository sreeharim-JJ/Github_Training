/**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 */
define(['N/record', 'N/log'], function(record, log) {

    function each(params) {

        try {

            let productRec = record.load({
                type: 'customrecord932',
                id: params.id
            });

            let qty = productRec.getValue({
                fieldId: 'custrecord1426'
            });

            if (qty < 10) {

                productRec.setValue({
                    fieldId: 'custrecord1421',
                    value: 1
                });

            }

            else if(qty >= 10){
                productRec.setValue({
                    fieldId:'custrecord1421',
                    value : '2'
                })
            }

            productRec.save();

            log.audit({
                title: 'Record Updated',
                details: 'Record ID ' + params.id
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