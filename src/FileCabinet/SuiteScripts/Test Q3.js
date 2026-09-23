/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log'], function(record, log) {

    function beforeSubmit(context) {

        var rec = context.newRecord;
        if (rec.type === record.Type.SALES_ORDER) {

        var customerid = rec.getValue({
            fieldId:'entity'
        })

        var salesrepr = rec.getText({
            fieldId: 'salesrep'
        });
        
        if(customerid){
         rec.setValue({
                fieldId: 'custbody_customer_sales_rep',
                value: salesrepr
            
        });}

         log.debug({
            title: 'Execution Log',
            details: 'successfully updated the sales rep: '+salesrepr+' for :'+customerid
        });

    }
}

    return {
       beforeSubmit:beforeSubmit
    };

});