/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 */
define (['N/record','N/log'],function(record,log){
    function execute(context){
        var rec = record.load({type: "purchaseorder",
         id:16368
 
        });
        var itm=rec.getText({
            fieldId:'item'
        });
        var qty=rec.getValue({
            fieldId:'quantity'
        });
        var rate=rec.getValue({
            fieldId:'rate'
        })
        var internal_id=rec.save();
        log.debug({
            title:"purchase order details",
            details:itm + " " + qty + "" + rate
        });
 
 
 
    }
    return {
         execute:execute};
})