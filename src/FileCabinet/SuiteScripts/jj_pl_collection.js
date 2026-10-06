/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 */
define(['N/search'], function(search) {

    function render(params) {

        var portlet = params.portlet;
        portlet.title = 'Overdue Invoices Alert';

        portlet.addColumn({
            id: 'entity',
            type: 'text',
            label: 'Customer Name',
            align: 'LEFT'
        });

        portlet.addColumn({
            id: 'tranid',
            type: 'text',
            label: 'Invoice Number',
            align: 'LEFT'
        });

        portlet.addColumn({
            id: 'amountremaining',
            type: 'currency',
            label: 'Amount Due',
            align: 'RIGHT'
        });

        portlet.addColumn({
            id: 'daysoverdue',
            type: 'text',
            label: 'Days Overdue',
            align: 'RIGHT'
        });

        var invoiceSearch = search.create({
            type: search.Type.INVOICE,
            filters: [
                ['mainline', 'is', 'T'],
                'AND',
                ['status', 'anyof', 'CustInvc:A'],
                'AND',
                ['duedate', 'before', 'today']
            ],
            columns: [
                'entity',
                'tranid',
                'amountremaining',
                search.createColumn({
                    name: 'formulanumeric',
                    formula: '{today}-{duedate}',
                    sort: search.Sort.DESC
                })
            ]
        });

        var results = invoiceSearch.run().getRange({
            start: 0,
            end: 10
        });

        results.forEach(function(result) {

            portlet.addRow({
                entity: result.getText('entity'),
                tranid: result.getValue('tranid'),
                amountremaining: result.getValue('amountremaining'),
                daysoverdue: result.getValue({
                    name: 'formulanumeric'
                })
            });

        });
    }

    return {
        render: render
    };

});