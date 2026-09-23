/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 */
 
define (['N/record','N/log'],function(record,log){
    function execute(context){
        var rec = record.load({type: "customer",
         id:3171
        });
        rec.setValue({
            fieldId:'salesrep',
            value:3147
        })
        var salesRep = rec.getValue({
            fieldId: 'salesrep'
        });

        var customerName = rec.getText({
            fieldId: 'entityid'
        });

        rec.save();

        log.debug({
            title: "Customer Updated",
            details: "Customer: " + customerName +
                     ", New Sales Rep ID: " + salesRep
        });
 
    }
    return {
         execute:execute};
})
