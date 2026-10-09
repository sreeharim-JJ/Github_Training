/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/file', 'N/email', 'N/log'], (search, file, email, log) => {

    const ADMIN_ID = 1566;

    const getInputData = () => {
        return search.create({
            type: search.Type.INVOICE,
            filters: [
                ['mainline', 'is', 'T'],
                'AND',
                ['amountremaining', 'greaterthan', '0'],
                'AND',
                ['duedate', 'onorbefore', 'lastmonth']
            ],
            columns: [
                search.createColumn({ name: 'tranid' }),
                search.createColumn({ name: 'entity' }),
                search.createColumn({ name: 'salesrep' }),
                search.createColumn({ name: 'amountremaining' }),
                search.createColumn({
                    name: 'formulanumeric',
                    formula: 'TRUNC({today}) - TRUNC({duedate})'
                })
            ]
        });
    };

    const map = (context) => {

        let result = JSON.parse(context.value);

        let customerId = result.values.entity.value;

        let customerEmail = '';

        try {
            let customerLookup = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: customerId,
                columns: ['email']
            });

            customerEmail = customerLookup.email || '';

        } catch (e) {
            log.error('CUSTOMER LOOKUP ERROR', e);
        }

        log.debug({
            title: 'Customer Email',
            details: {
                customerId: customerId,
                email: customerEmail
            }
        });

        context.write({
            key: customerId,
            value: JSON.stringify({
                customerName: result.values.entity.text,
                customerEmail: customerEmail,
                invoiceNumber: result.values.tranid,
                invoiceAmount: result.values.amountremaining,
                daysOverdue: result.values.formulanumeric,
                salesRep: result.values.salesrep
                    ? result.values.salesrep.value
                    : ''
            })
        });
    };

    const reduce = (context) => {

        try {

            let invoices = context.values.map(v => JSON.parse(v));

            let customer = invoices[0];

            let csv =
                'Customer Name,Customer Email,Invoice Number,Invoice Amount,Days Overdue\n';

            invoices.forEach(inv => {
                csv +=
                    `"${inv.customerName}",` +
                    `"${inv.customerEmail}",` +
                    `"${inv.invoiceNumber}",` +
                    `"${inv.invoiceAmount}",` +
                    `"${inv.daysOverdue}"\n`;
            });

            let csvFile = file.create({
                name: 'OverdueInvoices_' + context.key + '.csv',
                fileType: file.Type.CSV,
                contents: csv
            });

            let recipientId;

            if (customer.customerEmail) {
                recipientId = customer.customerEmail;
            } else {
                recipientId = ADMIN_ID;
            }

            log.audit({
                title: 'EMAIL RECIPIENT',
                details: recipientId
            });

            email.send({
                author: ADMIN_ID,
                recipients: recipientId,
                subject: 'Overdue Invoice Notification',
                body: 'Please find attached your overdue invoice report.',
                attachments: [csvFile]
            });

            log.audit({
                title: 'EMAIL SENT',
                details: {
                    customer: customer.customerName,
                    recipient: recipientId
                }
            });

        } catch (e) {
            log.error('REDUCE ERROR', e);
        }
    };

    const summarize = (summary) => {

        if (summary.inputSummary.error) {
            log.error('INPUT ERROR', summary.inputSummary.error);
        }

        summary.mapSummary.errors.iterator().each((key, error) => {
            log.error('MAP ERROR ' + key, error);
            return true;
        });

        summary.reduceSummary.errors.iterator().each((key, error) => {
            log.error('REDUCE ERROR ' + key, error);
            return true;
        });

        log.audit('SCRIPT COMPLETED', 'Overdue Invoice Notification Process Finished');
    };

    return {
        getInputData,
        map,
        reduce,
        summarize
    };

});