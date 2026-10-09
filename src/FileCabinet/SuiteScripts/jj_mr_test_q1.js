/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/log'], (search, log) => {

    const getInputData = () => {
        return search.create({
            type: search.Type.SALES_ORDER,
            filters: [
                ['mainline', 'is', 'T']
            ],
            columns: [
                search.createColumn({
                    name: 'entity'
                }),
                search.createColumn({
                    name: 'amount'
                })
            ]
        });
    };

    const map = (context) => {
        const result = JSON.parse(context.value);

        const customer = result.values.entity;

        if (!customer || !customer.value) {
            return;
        }

        context.write({
            key: customer.value,
            value: result.values.amount || 0
        });
    };

    const reduce = (context) => {
        let totalSalesAmount = 0;
        
        context.values.forEach((amount) => {
            totalSalesAmount += parseFloat(amount) || 0;
        });

        const customerLookup = search.lookupFields({
            type: search.Type.CUSTOMER,
            id: context.key,
            columns: ['entityid']
        });

        const customerName = customerLookup.entityid || '';

        log.audit({
            title: 'Customer Total Sales',
            details: {
                customerId: context.key,
                customerName: customerName,
                totalSalesAmount: totalSalesAmount
            }
        });

        context.write({
            key: context.key,
            value: JSON.stringify({
                customerName: customerName,
                totalSalesAmount: totalSalesAmount
            })
        });
    };

    const summarize = (summary) => {

        summary.mapSummary.errors.iterator().each((key, error) => {
            log.error({
                title: 'Map Error: ' + key,
                details: error
            });
            return true;
        });

        summary.reduceSummary.errors.iterator().each((key, error) => {
            log.error({
                title: 'Reduce Error: ' + key,
                details: error
            });
            return true;
        });

        summary.output.iterator().each((key, value) => {
            log.audit({
                title: 'Output Customer ID: ' + key,
                details: value
            });
            return true;
        });
    };

    return {
        getInputData,
        map,
        reduce,
        summarize
    };

});