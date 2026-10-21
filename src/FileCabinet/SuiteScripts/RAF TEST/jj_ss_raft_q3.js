/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/email', 'N/log'], (
    search,
    email,
    log
) => {

    function execute() {

        var adminId = 6858;

        search.create({
            type: 'customrecord945',
            filters: [
                ['isinactive', 'is', 'F'],
                'AND',
                ['custrecord1440', 'isnotempty', '']
            ],
            columns: [
                'custrecord1438',
                'custrecord1440'
            ]
        }).run().each(function(result) {

            var isActive =
                result.getValue('custrecord1438') == 'T';

            var customerEmail =
                result.getValue('custrecord1440');

            if (!customerEmail) {
                return true;
            }

            var subject = isActive
                ? 'Thank you for the support. Keep purchasing more items. Exciting discounts are waiting for you in the Christmas session.'
                : 'Exciting discounts are waiting for you in the Christmas session. We warmly welcome you.';

            try {

                email.send({
                    author: adminId,
                    recipients: customerEmail,
                    subject: subject,
                    body: subject
                });

                log.audit({
                    title: 'Email Sent',
                    details: customerEmail
                });

            } catch (e) {

                log.error({
                    title: 'Email Error',
                    details: e
                });
            }

            return true;
        });
    }

    return {
        execute: execute
    };
});


////////////////////////////////////////

// /**
//  * @NApiVersion 2.1
//  * @NScriptType ClientScript
//  */
// define(['N/currentRecord', 'N/https'], function (
//     currentRecord,
//     https
// ) {

//     function fieldChanged(context) {

//         if (
//             context.fieldId !== 'custpage_language' &&
//             context.fieldId !== 'custpage_currency'
//         ) {
//             return;
//         }

//         var rec = currentRecord.get();

//         var language = rec.getValue({
//             fieldId: 'custpage_language'
//         });

//         var currency = rec.getValue({
//             fieldId: 'custpage_currency'
//         });

//         if (!language || !currency) {
//             return;
//         }

//         var suiteletUrl = rec.getValue({
//             fieldId: 'custpage_suitelet_url'
//         });

//         var separator =
//             suiteletUrl.indexOf('?') === -1 ? '?' : '&';

//         var requestUrl =
//             suiteletUrl +
//             separator +
//             'action=getfee' +
//             '&language=' +
//             encodeURIComponent(language) +
//             '&currency=' +
//             encodeURIComponent(currency);

//         https.get.promise({
//             url: requestUrl
//         }).then(function (response) {

//             var result = JSON.parse(response.body);

//             rec.setValue({
//                 fieldId: 'custpage_amount',
//                 value: Number(result.amount),
//                 ignoreFieldChange: true
//             });

//             rec.setValue({
//                 fieldId: 'custpage_exchange_rate',
//                 value: Number(result.convertedAmount),
//                 ignoreFieldChange: true
//             });

//         }).catch(function (error) {
//             alert(error.message);
//         });
//     }

//     return {
//         fieldChanged: fieldChanged
//     };
// });