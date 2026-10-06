/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/search', 'N/email'], (search, email) => {

    const execute = () => {

        try {

            let body = 'Open Invoice Details\n\n';
            let invoiceCount = 0;

            const invoiceSearch = search.create({
                type: search.Type.INVOICE,
                filters: [
                    ['type','is','CustInvc'],'AND',
                    ['status', 'anyof', 'CustInvc:A'],
                    'AND',
                    ['mainline', 'is', 'T']
                    
                ],
                columns: [
                    'tranid',
                    'entity'
                ]
            });

            invoiceSearch.run().each(result => {

                

                let invoiceNumber = result.getValue('tranid');
                let customerName = result.getText('entity');
                log.debug({
title: 'Invoice Found',
details:
'Invoice = ' + invoiceNumber +
', Customer = ' + customerName
});
invoiceCount++;
                body +=
                    'Customer: ' + customerName + '\n' +
                    '--Invoice Number: ' + invoiceNumber +','+'\n\n';
                    

                return true;
            });

            log.debug({
                title: 'Invoice Count',
                details: body
            });

            if (invoiceCount > 0) {

                email.send({
                    author: -5, 
                    recipients: -5, 
                    subject: 'Open Invoice Report',
                    body: body
                });

                log.audit({
                    title: 'Email Sent',
                    details: 'Open Invoice Report sent to Administrator'
                });

            } else {

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