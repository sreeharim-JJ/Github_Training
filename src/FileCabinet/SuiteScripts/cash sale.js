/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 */

define (['N/record','N/log'],function(record,log){
    function execute(context){
        var rec = record.load({type: "cashsale",
         id:16193
 
        });
        var num=rec.getValue({
            fieldId:'tranid'
        });
        var name=rec.getText({
            fieldId:'entity'
        });
        var total=rec.getValue({
            fieldId:'total'
        });
        var internal_id=rec.save();
        log.debug({
            title:"Cash sales order details",
            details:num + " " + name+ "" + total
        });
 
 
 
    }
    return {
         execute:execute};
})