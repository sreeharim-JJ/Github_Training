/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/ui/dialog'], function(dialog) {

    function fieldChanged(scriptContext) {

        const currentRecord = scriptContext.currentRecord;

        if (scriptContext.fieldId === 'location') {

            const bodyLocation = currentRecord.getValue({
                fieldId: 'location'
            });

            console.log('Body Location:', bodyLocation);

            const lineCount = currentRecord.getLineCount({
                sublistId: 'item'
            });

            for (let i = 0; i < lineCount; i++) {

                currentRecord.selectLine({
                    sublistId: 'item',
                    line: i
                });

                currentRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'location',
                    value: bodyLocation
                });

                currentRecord.commitLine({
                    sublistId: 'item'
                });

                console.log('Location copied to Line:', i + 1);
            }
        }
    }

    function saveRecord(scriptContext) {

        const currentRecord = scriptContext.currentRecord;

        const bodyLocation = currentRecord.getValue({
            fieldId: 'location'
        });

        const lineCount = currentRecord.getLineCount({
            sublistId: 'item'
        });

        console.log('Validating Locations');

        for (let i = 0; i < lineCount; i++) {

            const lineLocation = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'location',
                line: i
            });

            console.log('Line:', i + 1);
            console.log('Line Location:', lineLocation);
            console.log('Body Location:', bodyLocation);

            if (lineLocation !== bodyLocation) {

                dialog.alert({
                    title: 'Location Mismatch',
                    message: 'Line ' + (i + 1) +
                             ' location does not match Body Location.'
                });

                return false;
            }
        }

        return true;
    }

    return {
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    };

});