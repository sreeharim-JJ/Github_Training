/**
* @NApiVersion 2.0
* @NScriptType ScheduledScript
*/
 
define (['N/record','N/log'],function(record){
    function execute(context){
        var rec = record.create({type: "salesorder",
            isDynamic:true,
 
        });
        rec.setValue({
            fieldId: 'entity',
            value:1868
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
            value:118
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
            details:"sales order id :" +internal_id
        })
 
 
    }
    return {
         execute:execute};
})