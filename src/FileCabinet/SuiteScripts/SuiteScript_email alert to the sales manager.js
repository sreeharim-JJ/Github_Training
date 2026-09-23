// Give an email alert to the sales manager (of the sales rep) that there is a sales order created for the customers who have Overdue

/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define(['N/email', 'N/search', 'N/runtime', 'N/log'],
function(email, search, runtime, log) {

    function afterSubmit(context) {

        if (context.type !== context.UserEventType.CREATE) {
            return;
        }

        var so = context.newRecord;

        log.debug('Script Started', 'Sales Order ID: ' + so.id);

        var customerId = so.getValue('entity');
        var salesRepId = so.getValue('salesrep');

        log.debug('Customer & Sales Rep', {
            customerId: customerId,
            salesRepId: salesRepId
        });

        var customer = search.lookupFields({
            type: search.Type.CUSTOMER,
            id: customerId,
            columns: ['overduebalance', 'entityid']
        });

        var overdueBalance = parseFloat(customer.overduebalance) || 0;

        log.debug('Overdue Balance', overdueBalance);

        if (overdueBalance <= 0) {
            log.debug('Email Not Sent', 'Customer has no overdue balance');
            return;
        }

        var salesRep = search.lookupFields({
            type: search.Type.EMPLOYEE,
            id: salesRepId,
            columns: ['supervisor']
        });

        if (!salesRep.supervisor || !salesRep.supervisor.length) {
            log.debug('Email Not Sent', 'Sales Rep has no supervisor assigned');
            return;
        }

        var managerId = salesRep.supervisor[0].value;

        log.debug('Manager Found', managerId);

        email.send({
            author: runtime.getCurrentUser().id,
            recipients: managerId,
            subject: 'Sales Order Created for Customer with Overdue Balance',
            body:
                'A new Sales Order has been created.\n\n' +
                'Sales Order: ' + so.getValue('tranid') + '\n' +
                'Customer: ' + customer.entityid + '\n' +
                'Overdue Balance: ' + overdueBalance + '\n\n' +
                'Please review the customer account.'
        });

        log.audit(
            'Email Sent',
            'Alert sent to Sales Manager (Employee ID: ' + managerId + ')'
        );
    }

    return {
        afterSubmit: afterSubmit
    };

});