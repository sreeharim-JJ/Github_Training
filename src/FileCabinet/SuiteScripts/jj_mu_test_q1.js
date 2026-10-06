/**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 */
define(['N/record', 'N/log'], function(record, log) {

    function each(params) {

        try {

            let classRec = record.load({
                type: 'customrecord930',
                id: params.id
            });

            let classNumber = classRec.getValue({
                fieldId: 'custrecord1417'
            });

            if (classNumber < 10) {

                classRec.setValue({
                    fieldId: 'custrecord1417',
                    value: Number(classNumber) + 1
                });

            }

            else if( classNumber == 10){
                classRec.setValue({
                    fieldId:'custrecord1425',
                    value : 'Completed'
                })
            }

            classRec.save();

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