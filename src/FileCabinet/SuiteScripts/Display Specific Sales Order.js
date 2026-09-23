/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 */
 
define (['N/record','N/log'],function(record,log){
    function execute(context){
        var rec = record.load({type: "salesorder",
         id:16467
 
        });
        var num=rec.getValue({
            fieldId:'tranid'
        });
        var name=rec.getText({
            fieldId:'entity'
        });
        var internal_id=rec.save();
        log.debug({
            title:"sales order details",
            details:num + " " + name
        });
 
 
 
    }
    return {
         execute:execute};
})