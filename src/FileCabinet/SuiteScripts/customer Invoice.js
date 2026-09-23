/**
* @NApiVersion 2.0
* @NScriptType ScheduledScript
*/
 
define (['N/record','N/log'],function(record){
    function execute(context){
        var rec = record.create({type : 'invoice',
            isDynamic:true
    });
    rec.setValue({
        fieldId:'entity',
        value:227
    })
    rec.setValue({
        fieldId:'location',
        value:2
    })
    rec.selectNewLine({
        sublistId:"item"
    })
    rec.setCurrentSublistValue({
        sublistId:'item',
        fieldId:'item',
        value:115
    })
    rec.setCurrentSublistValue({
        sublistId:'item',
        fieldId:'quantity',
        value:1
    })
     rec.commitLine({
            sublistId:'item'
        });
        var internal_id=rec.save();
        log.debug({
            title:"success",
            details:"invoice order id :" +internal_id
        })
    }
    return({
        execute:execute
    })
})