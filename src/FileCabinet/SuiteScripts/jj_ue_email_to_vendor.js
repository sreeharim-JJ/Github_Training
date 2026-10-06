/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/email', 'N/log'], function(email, log) {
    function afterSubmit(context) {
        log.audit({
            title: 'Script Started',
            details: 'afterSubmit triggered'
        });
        if (context.type !== context.UserEventType.EDIT) {
            log.audit({
                title: 'Skipped',
                details: 'Not an EDIT'
            });
            return;
        }
        var oldRec = context.oldRecord;
        var newRec = context.newRecord;
        var body = '';
        var lineCount = newRec.getLineCount({
            sublistId: 'item'
        });
        log.audit({
            title: 'Line Count',
            details: lineCount
        });
        for (var i = 0; i < lineCount; i++) {
            var oldQty = oldRec.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: i
            });
            var newQty = newRec.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: i
            });
            log.audit({
                title: 'Line ' + (i + 1),
                details: 'Old Qty: ' + oldQty +
                         ', New Qty: ' + newQty
            });
            if (oldQty != newQty) {
                var itemName = newRec.getSublistText({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });
                log.audit({
                    title: 'Quantity Changed',
                    details: itemName + ' | ' +
                             oldQty + ' -> ' + newQty
                });
                body += 'Item: ' + itemName +
                        '\nOld Quantity: ' + oldQty +
                        '\nUpdated Quantity: ' + newQty +
                        '\n\n';
            }
        }
        log.audit({
            title: 'Email Body',
            details: body || 'No Changes'
        });
        if (body) {
            try {
                log.audit({
                    title: 'Before Email',
                    details: 'Sending Email'
                });
                email.send({
                    author: -5,
                    recipients: newRec.getValue({
                        fieldId: 'entity'
                    }),
                    subject: 'The quantity updated in the PO: ' +
                             newRec.getValue({
                                 fieldId: 'tranid'
                             }),
                    body: body
                });
                log.audit({
                    title: 'SUCCESS',
                    details: 'Email Sent Successfully'
                });
            } catch (e) {
                log.error({
                    title: 'EMAIL ERROR',
                    details: e.message
                });
            }
        } else {
            log.audit({
                title: 'No Changes',
                details: 'Email not sent'
            });
        }
    }
    return {
        afterSubmit: afterSubmit
    };
});