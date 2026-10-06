/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/email', 'N/log'], (search, email, log) => {

    function execute(context) {

        try {

            var customerSearch = search.create({
               type:'customer',
                isPublic:true,
                filters: [
                    ['entityid', 'startswith', 'Ale'],
                    'AND',
                    ['subsidiary', 'anyof', '36'],
                    'AND',
                    ['isinactive', 'is', 'F']
                ],
                columns: [
                    'internalid',
                    'entityid',
                    'email'
                ]
            });

            customerSearch.run().each(function(result) {

                var customerId = result.getValue('internalid');
                var customerName = result.getValue('entityid');
                var customerEmail = result.getValue('email');

                if (customerEmail) {

                    email.send({
                        author: -5, // Default Administrator
                        recipients: customerEmail,
                        subject: 'Daily Notification',
                        body:
                            'Hello ' + customerName + ',<br/><br/>' +
                            'This is your daily notification email.<br/><br/>' +
                            'Regards,<br/>Sample Subsidiary'
                    });

                    log.audit({
                        title: 'Email Sent',
                        details: customerName + ' (' + customerEmail + ')'
                    });
                } else {
                    log.debug({
                        title: 'Missing Email',
                        details: customerName
                    });
                }

                return true;
            });

        } catch (e) {
            log.error({
                title: 'Script Error',
                details: e
            });
        }
    }

    return {
        execute: execute
    };
});