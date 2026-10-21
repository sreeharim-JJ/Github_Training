/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/currentRecord', 'N/https'], function (
    currentRecord,
    https
) {

    function fieldChanged(context) {

        if (
            context.fieldId !== 'custpage_language' &&
            context.fieldId !== 'custpage_currency'
        ) {
            return;
        }

        var rec = currentRecord.get();

        var language = rec.getValue({
            fieldId: 'custpage_language'
        });

        var currency = rec.getValue({
            fieldId: 'custpage_currency'
        });

        if (!language || !currency) {
            return;
        }

        var suiteletUrl = rec.getValue({
            fieldId: 'custpage_suitelet_url'
        });

        var separator =
            suiteletUrl.indexOf('?') === -1 ? '?' : '&';

        var requestUrl =
            suiteletUrl +
            separator +
            'action=getfee' +
            '&language=' +
            encodeURIComponent(language) +
            '&currency=' +
            encodeURIComponent(currency);

        https.get.promise({
            url: requestUrl
        }).then(function (response) {

            var result = JSON.parse(response.body);

            rec.setValue({
                fieldId: 'custpage_amount',
                value: Number(result.amount),
                ignoreFieldChange: true
            });

            rec.setValue({
                fieldId: 'custpage_exchange_rate',
                value: Number(result.convertedAmount),
                ignoreFieldChange: true
            });

        }).catch(function (error) {
            alert(error.message);
        });
    }

    return {
        fieldChanged: fieldChanged
    };
});