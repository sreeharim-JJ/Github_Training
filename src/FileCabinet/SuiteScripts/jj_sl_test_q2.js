/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/search', 'N/ui/serverWidget'],

    (search, serverWidget) => {

        const onRequest = (scriptContext) => {

            try {

                let form = serverWidget.createForm({
    title: 'Sales Order Form'
});

form.clientScriptModulePath = './jj_cs_salesorder_for_sl.js';
                form.addField({
                    id: 'custpage_customer',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer',
                    label: 'Customer'
                });

                form.addSubmitButton({
                    label: 'Submit Button'
                });

                let sublist = form.addSublist({
                    id: 'custpage_sublistid',
                    type: serverWidget.SublistType.LIST,
                    label: 'Sales Order Form'
                });
                sublist.addField({
                    id : 'custpage_tranid',
                    type:serverWidget.FieldType.TEXT,
                    label: 'Transaction Id'
                })

                sublist.addField({
                    id: 'custpage_name',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Customer Name'
                });

                sublist.addField({
                    id: 'custpage_amount',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Sales Order Amount'
                });

                if (scriptContext.request.method == 'POST') {

                    
                    let customerNamee = scriptContext.request.parameters.custpage_customer;


let customerr = search.lookupFields({

    type: search.Type.CUSTOMER,

    id: customerNamee,

    columns: ['entityid']

});

let customer = customerr.entityid
// log.debug('Customer Name', customerName.entityid);

                    let filters = [
                        ['type', 'anyof', 'SalesOrd'],
                        'AND',
                        ['amount', 'greaterthan', 10000],
                        'AND',
                        ['mainline', 'is', 'T']
                    ];

                    if (customer) {
                        log.debug("customer............");
                        filters.push('AND');
                        filters.push(['customermain.entityid', 'haskeywords', customer]);
                    }

                    let soSearch = search.create({
                        type: 'transaction',
                        isPublic: true,
                        filters: filters,
                        columns: [
                            search.createColumn({ name: 'entity' }),
                            search.createColumn({name:'tranid'}),
                            search.createColumn({ name: 'total' })
                        ]
                    });

                    // soSearch.title = '333 saved search';
                    // soSearch.id = 'customsearch_searchscript333';

                    // var searchId = soSearch.save();

                    let line = 0;

                    soSearch.run().each(function (result) {

                        let entity = result.getText('entity');
                        let amount = result.getValue('total');
                        let tranid = result.getValue('tranid')

                        log.debug({
                            title: 'values',
                            details: tranid+ " " + entity + " " + amount
                        });

                        sublist.setSublistValue({
                            id: 'custpage_name',
                            line: line,
                            value: entity
                        });

                        sublist.setSublistValue({
                            id: 'custpage_amount',
                            line: line,
                            value: amount
                        });
                        sublist.setSublistValue({
                            id: 'custpage_tranid',
                            line:line,
                            value: tranid
                        })

                        line++;
                        return true;
                    });
                }

                scriptContext.response.writePage({
                    pageObject: form
                });

            } catch (e) {

                log.debug({
                    title: 'failed',
                    details: e.message
                });
            }
        }

        return { onRequest }

    });