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
    'AND',
    ['status','anyof','Bill:open']
            ],
            columns:[
                search.createColumn({name:'tranid'}),
                search.createColumn({name:'trandate'}),
                search.createColumn({name:'entity'}),
                search.createColumn({name:'email'}),
                search.createColumn({name:'total'})
            ]
 
 
 
        });
        var result=customer.run().getRange({
            start:0,
            end:99
        });
        customer.title= 'invoice script saved search'
        customer.id='customsearch_invoice_searchscript'
    var searchId = customer.save();
log.debug({
    title:"success",
    details:"search id : "+searchId
})
var s= search.load({
    id: 'customsearch_customer_search_script'
});
 
log.debug({
    title: 'Title',
    details: s.title+ "script id " +s.id+ " internal id :  "+ s.searchId
});
    }
    return {
         execute:execute};
})