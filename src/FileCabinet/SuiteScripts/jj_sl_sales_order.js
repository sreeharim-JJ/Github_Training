/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search'], function(serverWidget, search) {

    function onRequest(context) {

        let request = context.request;

        let subsidiaryFilter = request.parameters.custpage_subsidiary || '';
        let customerFilter = request.parameters.custpage_customer || '';

        let form = serverWidget.createForm({
            title: 'Sales Orders Pending Fulfillment / Billing'
        });

        // Filters
        let subsidiaryFld = form.addField({
            id: 'custpage_subsidiary',
            type: serverWidget.FieldType.SELECT,
            label: 'Subsidiary',
            source: 'subsidiary'
        });

        let customerFld = form.addField({
            id: 'custpage_customer',
            type: serverWidget.FieldType.SELECT,
            label: 'Customer',
            source: 'customer'
        });

        subsidiaryFld.defaultValue = subsidiaryFilter;
        customerFld.defaultValue = customerFilter;

        form.addSubmitButton({
            label: 'Search'
        });

        // Sublist
        let sublist = form.addSublist({
            id: 'custpage_so_sublist',
            type: serverWidget.SublistType.LIST,
            label: 'Sales Orders'
        });

        sublist.addField({
            id: 'custpage_internalid',
            type: serverWidget.FieldType.TEXT,
            label: 'Internal ID'
        });

        sublist.addField({
            id: 'custpage_docnum',
            type: serverWidget.FieldType.TEXT,
            label: 'Document Number'
        });

        sublist.addField({
            id: 'custpage_date',
            type: serverWidget.FieldType.TEXT,
            label: 'Date'
        });

        sublist.addField({
            id: 'custpage_status',
            type: serverWidget.FieldType.TEXT,
            label: 'Status'
        });

        sublist.addField({
            id: 'custpage_customer',
            type: serverWidget.FieldType.TEXT,
            label: 'Customer Name'
        });

        sublist.addField({
            id: 'custpage_subsidiarycol',
            type: serverWidget.FieldType.TEXT,
            label: 'Subsidiary'
        });

        sublist.addField({
            id: 'custpage_department',
            type: serverWidget.FieldType.TEXT,
            label: 'Department'
        });

        sublist.addField({
            id: 'custpage_class',
            type: serverWidget.FieldType.TEXT,
            label: 'Class'
        });

        sublist.addField({
            id: 'custpage_total',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Total'
        });

        // Search Filters
        let filters = [
            ['mainline', 'is', 'T'],
            'AND',
            ['status', 'anyof',
                [
                    'SalesOrd:B', // Pending Fulfillment
                    'SalesOrd:D', // Partially Fulfilled
                    'SalesOrd:E', // Pending Billing/Partially Fulfilled
                    'SalesOrd:F'  // Pending Billing
                ]
            ]
        ];

        if (subsidiaryFilter) {
            filters.push('AND');
            filters.push(['subsidiary', 'anyof', subsidiaryFilter]);
        }

        if (customerFilter) {
            filters.push('AND');
            filters.push(['entity', 'anyof', customerFilter]);
        }

        let salesOrderSearch = search.create({
            type: search.Type.SALES_ORDER,
            filters: filters,
            columns: [
                'internalid',
                'tranid',
                'trandate',
                'statusref',
                'entity',
                'subsidiary',
                'department',
                'class',
                'total'
            ]
        });

        let results = salesOrderSearch.run().getRange({
            start: 0,
            end: 1000
        });

        for (let i = 0; i < results.length; i++) {

            let internalId = results[i].getValue('internalid');
            let tranId = results[i].getValue('tranid');
            let date = results[i].getValue('trandate');
            let status = results[i].getText('statusref');
            let customer = results[i].getText('entity');
            let subsidiary = results[i].getText('subsidiary');
            let department = results[i].getText('department');
            let className = results[i].getText('class');
            let total = results[i].getValue('total');

            if (internalId) {
                sublist.setSublistValue({
                    id: 'custpage_internalid',
                    line: i,
                    value: internalId.toString()
                });
            }

            if (tranId) {
                sublist.setSublistValue({
                    id: 'custpage_docnum',
                    line: i,
                    value: tranId.toString()
                });
            }

            if (date) {
                sublist.setSublistValue({
                    id: 'custpage_date',
                    line: i,
                    value: date.toString()
                });
            }

            if (status) {
                sublist.setSublistValue({
                    id: 'custpage_status',
                    line: i,
                    value: status.toString()
                });
            }

            if (customer) {
                sublist.setSublistValue({
                    id: 'custpage_customer',
                    line: i,
                    value: customer.toString()
                });
            }

            if (subsidiary) {
                sublist.setSublistValue({
                    id: 'custpage_subsidiarycol',
                    line: i,
                    value: subsidiary.toString()
                });
            }

            if (department) {
                sublist.setSublistValue({
                    id: 'custpage_department',
                    line: i,
                    value: department.toString()
                });
            }

            if (className) {
                sublist.setSublistValue({
                    id: 'custpage_class',
                    line: i,
                    value: className.toString()
                });
            }

            if (total) {
                sublist.setSublistValue({
                    id: 'custpage_total',
                    line: i,
                    value: total.toString()
                });
            }
        }

        context.response.writePage(form);
    }

    return {
        onRequest: onRequest
    };
});