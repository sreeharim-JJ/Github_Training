// Create a custom checkbox in the customer and vendor records. When a sales order is created, check the checkbox in the corresponding 
// customer record. When a purchase order is created, check the checkbox in the corresponding vendor record.

/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
 
 
define(['N/log','N/email','N/runtime','N/record'],function(log,email,runtime,record){
    function afterSubmit(context){
        var currentUser=runtime.getCurrentUser().id;
        var senderId=-5;
        if (context.type === context.UserEventType.CREATE) {
 
            var rec=context.newRecord;
            var recordtype = rec.type;
            var internalid = rec.id;
            var name = '';
            if (recordtype === record.Type.CUSTOMER || recordtype === record.Type.VENDOR){
                name=rec.getValue({
                    fieldId:'entityid'
                })
            }
            if (recordtype === record.Type.CONTACT){
                name =
    (rec.getValue({ fieldId: 'firstname' }) || '') +
    ' ' +
    (rec.getValue({ fieldId: 'lastname' }) || '');
 
            }
            email.send({
                author: senderId,
                recipients: currentUser,
                subject: 'Record Created',
                body:'Record Created\n\n' +'Entity Type: ' + recordtype + '\nInternal ID: ' + internalid +'\nName: ' + name
            });
            log.debug({
            title:"success",
            details:'Record Created\n\n' +'Entity Type: ' + recordtype + '\nInternal ID: ' + internalid +'\nName: ' + name
        })
        }
        if (context.type === context.UserEventType.DELETE) {
 
            var rec = context.oldRecord;
            var recordtype = rec.type;
            var internalid = rec.id;
            email.send({
                author: senderId,
                recipients: currentUser,
                subject: 'Record Deleted',
                body:'Record Deleted\n\n' +'Entity Type: ' + recordtype + '\nInternal ID: ' + internalid
            });
            log.debug({
            title:"success",
            details:'Record deleted\n\n' +'Entity Type: ' + recordtype + '\nInternal ID: ' + internalid
        })
 
        }
 
 
 
 
       
 
    }
        return {
         afterSubmit:afterSubmit};
});