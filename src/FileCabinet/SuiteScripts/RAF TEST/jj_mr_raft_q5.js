/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
    'N/search',
    'N/render',
    'N/email',
    'N/log'
], (search, render, email, log) => {

    const ADMIN_ID = 1682; // Administrator

    function getInputData() {

        log.debug('GET INPUT DATA', 'Starting Search');

        return search.create({
            type: search.Type.INVOICE,
            filters: [
                ['mainline', 'is', 'T'],
                'AND',
                ['status', 'anyof', 'CustInvc:A'],
                'AND',
                ['custbody25', 'is', 'F']
            ],
            columns: [
                'internalid',
                'tranid',
                'entity',
                'duedate',
                search.createColumn({
                    name: 'email',
                    join: 'customer'
                })
            ]
        });
    }

    function map(context) {

    const result = JSON.parse(context.value);

    const invoiceId = Number(result.id);
    const customerId = result.values.entity.value;
    const customerEmail = result.values['email.customer'];

    const dueDate = new Date(result.values.duedate);
    dueDate.setHours(0,0,0,0);

    const today = new Date();
    today.setHours(0,0,0,0);

    const diffDays =
        Math.floor((today - dueDate) / (1000*60*60*24));

    let type = '';

    if (diffDays === 15) {
        type = 'Friendly';
    } else if (diffDays === 30) {
        type = 'Warning';
    } else {
        return;
    }

    log.audit(
        'INVOICE QUALIFIED',
        `Invoice ${invoiceId} | ${type}`
    );

    context.write({
        key: customerId + '|' + type,
        value: JSON.stringify({
            invoiceId,
            customerEmail,
            tranid: result.values.tranid
        })
    });
}

    function reduce(context) {

    log.audit(
        'REDUCE START',
        context.key
    );

    const invoices =
        context.values.map(v => JSON.parse(v));

    const customerEmail =
        invoices[0].customerEmail;

    const attachments = [];

    invoices.forEach(inv => {

        try {

            attachments.push(
                render.transaction({
                    entityId: Number(inv.invoiceId),
                    printMode: render.PrintMode.PDF
                })
            );

        } catch (e) {

            log.error(
                'PDF ERROR',
                e
            );
        }
    });

    try {

        email.send({
            author: ADMIN_ID,
            recipients: customerEmail,
            subject: 'Overdue Invoice Notice',
            body: 'Overdue Invoice Reminder',
            attachments: attachments
        });

        log.audit(
            'EMAIL SENT',
            customerEmail
        );

    } catch (e) {

        log.error(
            'EMAIL ERROR',
            e
        );
    }
}

   function summarize(summary) {

    summary.mapSummary.errors.iterator().each(
        function(key, error) {

            log.error(
                'MAP ERROR',
                error
            );

            return true;
        });

    summary.reduceSummary.errors.iterator().each(
        function(key, error) {

            log.error(
                'REDUCE ERROR',
                error
            );

            return true;
        });
}

    return {
        getInputData,
        map,
        reduce,
        summarize
    };
});