/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/currentRecord'], (
    currentRecord
) => {

    const sendDonor = () => {

        const rec = currentRecord.get();

        const count = rec.getLineCount({
            sublistId: 'custpage_results'
        });

        const donors = [];

        for (let i = 0; i < count; i++) {

            const selected =
                rec.getSublistValue({
                    sublistId: 'custpage_results',
                    fieldId: 'custpage_select',
                    line: i
                });

            if (selected) {

                donors.push(
                    rec.getSublistValue({
                        sublistId: 'custpage_results',
                        fieldId: 'custpage_donorid',
                        line: i
                    })
                );
            }
        }

        if (!donors.length) {

            alert(
                'Please select at least one donor'
            );

            return;
        }

        alert(
            'Future NetSuite Integration\nSelected Donors: ' +
            donors.join(',')
        );
    };

    return {
        sendDonor
    };

});