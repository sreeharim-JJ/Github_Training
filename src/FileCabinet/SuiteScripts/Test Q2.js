/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 */
 
 
define (['N/search','N/log'],function(search,log){
    function execute(context){
        var customer = search.create({type: "transaction",
            isPublic:true,
            filters: [
               
    ['type', 'anyof', 'Invoice'],
            ],
            columns:[
                search.createColumn({name:'tranid'}),
                search.createColumn({name:'entity'}),
                search.createColumn({name:'total'})
            ]
 
 
 
        });
        var result=customer.run().getRange({
            start:0,
            end:99
        });
        customer.title= 'invoice saved search'
        customer.id='customsearch_inve_searcoichscrip'
    var searchId = customer.save();
log.debug({
    title:"success",
    details:"search id : "+searchId
})

    }
    return {
         execute:execute};
})