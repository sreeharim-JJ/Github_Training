/**
* @NApiVersion 2.0
* @NScriptType ScheduledScript
*/
 
define (['N/record','N/log'],function(record){
    function execute(context){
        var rec = record.create({type: "vendor",
            isDynamic:true,
 
        });
        rec.setValue({
            fieldId: 'companyname',
            value:'Tony Stark'
        })
        rec.setValue({
            fieldId:'email',
            value:'tonystark@test.com'
        })
        rec.setValue({
            fieldId:'phone',
            value:155161112
        })
       rec.setValue({
        fieldId:'subsidiary',
        value:1
       })
        var internal_id=rec.save();
        log.debug({
            title:"success",
            details:"purchase order id :" +internal_id
        })
 
 
    }
    return {
         execute:execute};
})