/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search'], function(serverWidget, search) {

    function onRequest(context) {

        let form = serverWidget.createForm({
            title: 'Sales Order Search Results'
        });

        let sublist = form.addSublist({
            id: 'custpage_so_sublist',
            type: serverWidget.SublistType.LIST,
            label: 'Sales Orders'
        });

        sublist.addField({
            id: 'custpage_docnum',
            type: serverWidget.FieldType.TEXT,
            label: 'Document Number'
        });

        sublist.addField({
            id: 'custpage_customer',
            type: serverWidget.FieldType.TEXT,
            label: 'Customer Name'
        });

        sublist.addField({
            id: 'custpage_subsidiary',
            type: serverWidget.FieldType.TEXT,
            label: 'Subsidiary'
        });

        sublist.addField({
            id: 'custpage_orderdate',
            type: serverWidget.FieldType.TEXT,
            label: 'Order Date'
        });

        let salesOrderSearch = search.create({
            type: search.Type.SALES_ORDER,
            filters: [
                ['mainline', 'is', 'T']
            ],
            columns: [
                search.createColumn({ name: 'tranid' }),
                search.createColumn({ name: 'entity' }),
                search.createColumn({ name: 'subsidiary' }),
                search.createColumn({ name: 'trandate' })
            ]
        });

        let results = salesOrderSearch.run().getRange({
            start: 0,
            end: 1000
        });

        for (let i = 0; i < results.length; i++) {

            let tranId = results[i].getValue({ name: 'tranid' });
            let customer = results[i].getText({ name: 'entity' });
            let subsidiary = results[i].getText({ name: 'subsidiary' });
            let orderDate = results[i].getValue({ name: 'trandate' });

            if (tranId) {
                sublist.setSublistValue({
                    id: 'custpage_docnum',
                    line: i,
                    value: String(tranId)
                });
            }

            if (customer) {
                sublist.setSublistValue({
                    id: 'custpage_customer',
                    line: i,
                    value: String(customer)
                });
            }

            if (subsidiary) {
                sublist.setSublistValue({
                    id: 'custpage_subsidiary',
                    line: i,
                    value: String(subsidiary)
                });
            }

            if (orderDate) {
                sublist.setSublistValue({
                    id: 'custpage_orderdate',
                    line: i,
                    value: String(orderDate)
                });
            }
        }

        context.response.writePage(form);
    }

    return {
        onRequest: onRequest
    };

});