// Create a functionality to send an email when a Customer, Vendor or Contact record is created. 
// The sender of the email can be any employee, but the recipient should be the user who created the Customer, Contact or Vendor record.
//  The email should contain the Entity type, Internal id and name of the newly created record.  
// Also send an email when any of the Customer, Vendor or Contact records are deleted. This email should contain the Entity type, and 
// Internal id of the deleted record. Make sure that the email contains a message which says Record created or record deleted

/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define(['N/email', 'N/runtime', 'N/log'], function(email, runtime, log) {

    function afterSubmit(context) {

        var rec = context.newRecord || context.oldRecord;
        var userId = runtime.getCurrentUser().id;

        log.debug({
            title: 'Script Started',
            details: 'Event Type: ' + context.type
        });

        var message = '';

        if (context.type === context.UserEventType.CREATE) {

            log.debug({
                title: 'Record Created',
                details: 'Type: ' + rec.type + ', ID: ' + rec.id
            });

            message =
                'Record Created\n\n' +
                'Entity Type: ' + rec.type + '\n' +
                'Internal ID: ' + rec.id + '\n' +
                'Name: ' +
                (rec.getValue('companyname') ||
                 rec.getValue('entityid') ||
                 ((rec.getValue('firstname') || '') + ' ' +
                  (rec.getValue('lastname') || '')));

        } else if (context.type === context.UserEventType.DELETE) {

            log.debug({
                title: 'Record Deleted',
                details: 'Type: ' + rec.type + ', ID: ' + rec.id
            });

            message =
                'Record Deleted\n\n' +
                'Entity Type: ' + rec.type + '\n' +
                'Internal ID: ' + rec.id;

        } else {
            log.debug({
                title: 'Skipped',
                details: 'Event Type not Create/Delete'
            });
            return;
        }

        try {

            email.send({
                author: userId,
                recipients: userId,
                subject: 'Entity Notification',
                body: message
            });

            log.audit({
                title: 'Email Sent Successfully',
                details: 'User ID: ' + userId +
                         ', Record Type: ' + rec.type +
                         ', Record ID: ' + rec.id
            });

        } catch (e) {

            log.error({
                title: 'Email Sending Failed',
                details: e
            });
        }

        log.debug({
            title: 'Script Completed',
            details: 'Processing finished'
        });
    }

    return {
        afterSubmit: afterSubmit
    };
});