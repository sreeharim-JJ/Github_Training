/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/file', 'N/email', 'N/runtime'],
    function(search, file, email, runtime) {

    function execute(context) {

        try {

            var csvContent = 'Name,Date Created,Sales Rep,Terms\n';

            var customerSearch = search.create({
                type: search.Type.CUSTOMER,
                filters: [
                    ['datecreated', 'within', 'thismonth']
                ],
                columns: [
                    'entityid',
                    'datecreated',
                    'salesrep',
                    'terms'
                ]
            });

            customerSearch.run().each(function(result) {

                var name = result.getValue('entityid') || '';
                var dateCreated = result.getValue('datecreated') || '';
                var salesRep = result.getText('salesrep') || '';
                var terms = result.getText('terms') || '';

                csvContent += '"' + name + '","' +
                              dateCreated + '","' +
                              salesRep + '","' +
                              terms + '"\n';

                return true;
            });

            var today = new Date();

            var csvFile = file.create({
                name: 'Monthly_Customer_Report_' +
                      today.getFullYear() + '_' +
                      (today.getMonth() + 1) + '.csv',
                fileType: file.Type.CSV,
                contents: csvContent
            });

            email.send({
                author: runtime.getCurrentUser().id,
                recipients: ['recipient@email.com'], // Replace with recipient
                subject: 'Monthly Customer Creation Report',
                body: 'Attached is the monthly customer creation report.',
                attachments: [csvFile]
            });

            log.audit({
                title: 'Success',
                details: 'Monthly customer report emailed successfully.'
            });

        } catch (e) {

            log.error({
                title: 'Error',
                details: e
            });

        }
    }

    return {
        execute: execute
    };

});
