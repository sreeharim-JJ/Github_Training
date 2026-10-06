/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/email', 'N/runtime'],
function(record, search, email, runtime) {

    function afterSubmit(context) {

        var so = context.newRecord;
        var salesRepId = so.getValue('salesrep');

        if (!salesRepId) return;

        // Get Sales Manager from Employee record
        var empData = search.lookupFields({
            type: search.Type.EMPLOYEE,
            id: salesRepId,
            columns: ['supervisor']
        });

        if (!empData.supervisor || !empData.supervisor.length) return;

        var managerId = empData.supervisor[0].value;

        // Previous month dates
        var today = new Date();
        var firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        var lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        var details = '';

        var soSearch = search.create({
            type: search.Type.SALES_ORDER,
            filters: [
                ['mainline', 'is', 'T'],
                'AND',
                ['salesrep', 'anyof', salesRepId],
                'AND',
                ['trandate', 'within',
                    formatDate(firstDayPrevMonth),
                    formatDate(lastDayPrevMonth)
                ]
            ],
            columns: [
                'tranid',
                'trandate',
                'entity',
                'amount'
            ]
        });

        soSearch.run().each(function(result) {

            details +=
                'SO#: ' + result.getValue('tranid') +
                '\nDate: ' + result.getValue('trandate') +
                '\nCustomer: ' + result.getText('entity') +
                '\nAmount: ' + result.getValue('amount') +
                '\n-------------------\n';

            return true;
        });

        if (!details) {
            details = 'No sales orders found for previous month.';
        }

        email.send({
            author: salesRepId,
            recipients: managerId,
            subject: 'Previous Month Sales Order Details',
            body:
                'Hello,\n\n' +
                'Below are the previous month sales orders for this Sales Representative:\n\n' +
                details
        });
    }

    function formatDate(dateObj) {
        var month = dateObj.getMonth() + 1;
        var day = dateObj.getDate();
        var year = dateObj.getFullYear();

        return month + '/' + day + '/' + year;
    }

    return {
        afterSubmit: afterSubmit
    };
});