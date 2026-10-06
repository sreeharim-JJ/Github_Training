/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/record', 'N/log'], (search, record, log) => {

    const execute = () => {

        const salesOrderSearch = search.create({
            type: 'transaction',
            filters: [
                ['type', 'anyof', 'SalesOrd'],
                'AND',
                ['mainline', 'is', false],
                'AND',
                ['item.name', 'is', 'KITKAT'],
                'AND',
                ['trandate', 'onorbefore', 'fourdaysago']
            ],
            columns: [
                search.createColumn({
                    name: 'internalid',
                    summary: search.Summary.GROUP
                })
            ]
        });

        salesOrderSearch.run().each(result => {

            const salesOrderId = result.getValue({
                name: 'internalid',
                summary: search.Summary.GROUP
            });

            try {

                const salesOrderRec = record.load({
                    type: record.Type.SALES_ORDER,
                    id: salesOrderId,
                    isDynamic: false
                });

                const lineCount = salesOrderRec.getLineCount({
                    sublistId: 'item'
                });

                for (let i = 0; i < lineCount; i++) {

                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'isclosed',
                        line: i,
                        value: true
                    });

                }

                salesOrderRec.save();

                log.audit({
                    title: 'Sales Order Closed',
                    details: 'Sales Order ID: ' + salesOrderId
                });

            } catch (e) {

                log.error({
                    title: 'Error Closing SO ' + salesOrderId,
                    details: e
                });

            }

            return true;
        });
    };

    return {
        execute
    };
});