/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/email'], function(search, email) {

    function execute() {
        try{
        let body = 'Vendor Bill Details\n\n';
        let billcount = 0;

        let billSearch = search.create({
            type:'transaction',
            isPublic:true,
            filters: [
                ['mainline', 'is', 'T'],
                'AND',
                ['type','is','VendorBill'],'AND',
                ['amount', 'greaterthan', '0'],'AND',
                ['duedate','within','nextoneweek']

            ],
            columns: [
                'entity',
                'tranid',
                'duedate',
                'amount'
            ]
        });

       billSearch.run().each(result => {

                

                const billNumber = result.getValue('tranid');
                const vendorName = result.getText('entity');
                const total = result.getValue('amount');


                billcount++;
                body +=
                    'Vendor: ' + vendorName + '\n' +
                    '--Bill Number: ' + billNumber +','+'Amount: '+total;
                return true;
            });

            log.debug({
                title: 'Bill Count',
                details: body
            });

            if (billcount > 0) {

                email.send({
                    author: -5, 
                    recipients: -5, 
                    subject: 'Open Bill Customer Report',
                    body: body
                });

                log.audit({
                    title: 'Email Sent',
                    details: 'Open Bill Report sent to Administrator'
                });

            } 
            else {

                log.debug({
                    title: 'No Open Invoices',
                    details: 'No records found'
                });
            }

        } catch (e) {

            log.error({
                title: 'Script Error',
                details: e
            });
        }
    };

    return {
        execute: execute
    };
});