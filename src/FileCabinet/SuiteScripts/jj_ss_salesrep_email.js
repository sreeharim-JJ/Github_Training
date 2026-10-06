/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/email'], (search, email) => {

    function execute() {

        var customerSearch = search.create({
            type: 'customer',
            filters: [
                ['isinactive', 'is', 'F']
            ],
            columns: ['entityid','salesrep']
        });

        customerSearch.run().each(function(cust) {

            var customerId = cust.id;
            var customerName = cust.getValue('entityid');
            var salesRep = cust.getValue('salesrep');

            if (!salesRep) {
                return true;
            }

            var openSOCount = search.create({
                type: search.Type.SALES_ORDER,
                filters: [
                    ['entity', 'anyof', customerId],
                    'AND',
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['status', 'noneof', 'isclosed']
                ]
            }).runPaged().count;

            if (openSOCount > 5) {

                email.send({
                    author: -5,
                    recipients: salesRep,
                    subject: 'Customer has more than 5 Open Sales Orders',
                    body:
                        'Customer: ' + customerName +
                        '\nOpen Sales Orders: ' + openSOCount
                });

                log.debug(
                    'Email Sent',
                    customerName + ' - ' + openSOCount
                );
            }

            return true;
        });
    }

    return {
        execute: execute
    };
});