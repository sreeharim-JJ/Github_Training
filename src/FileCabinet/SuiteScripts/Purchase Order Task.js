/**
* @NApiVersion 2.0
* @NScriptType ScheduledScript
*/
 
define (['N/record','N/log'],function(record){
    function execute(context){
        var rec = record.create({type: "purchaseorder",
            isDynamic:true,
 
        });
        rec.setValue({
            fieldId: 'entity',
            value:16368
        })
        rec.setValue({
            fieldId:'memo',
            value:'script creation'
        })
        rec.selectNewLine({
            sublistId:'item'
        })
        rec.setCurrentSublistValue({
            sublistId:'item',
            fieldId:'item',
            value:115
        })
        rec.setCurrentSublistValue({
            sublistId:'item',
            fieldId:'quantity',
            value:2
        })
        rec.commitLine({
            sublistId:'item'
        });
        var internal_id=rec.save();
        log.debug({
            title:"success",
            details:"purchase order id :" +internal_id
        })
 
 
    }
    return {
         execute:execute};
})