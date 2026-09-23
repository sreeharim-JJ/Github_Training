/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 */
define(['N/search','N/log'],function(search,log){
    function execute(context){
        var rec = search.create({
            type:"salesorder",
            isPublic:true,
            filtes:[
                ['type','anyof','Sales Order'],
                'AND',
                ['status','anyof','Bill Payment:Pending Fulfillment']
            ],
            columns:[
                search.createColumn({name:'tranid'}),
                search.createColumn({name:'trandate'}),
                search.createColumn({name:'entity'}),
                search.createColumn({name:'subsidiary'}),
                search.createColumn({name:'total'})
            ]

        });

        var result=rec.run().getRange({
            start:0,
            end:99
        });
        rec.title= 'salesorder saved new search'
        rec.id='customsearch_so_searcoichsp'
    var searchId = rec.save();
log.debug({
    title:"success",
    details:"search id : "+searchId
})
    }
   

        return {execute:execute}

    });