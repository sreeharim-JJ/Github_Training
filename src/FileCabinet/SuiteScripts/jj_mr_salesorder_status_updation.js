/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/email'],
    (record, search, email) => {

    const ADMIN_ID = -5;

    function createSearch() {

        return search.create({
            type: 'transaction',
            filters: [
                ['type', 'anyof', 'SalesOrd'],
                'AND',
                ['trandate', 'within', 'thismonth'],
                'AND',
                ['mainline', 'is', 'T'],
                'AND',
                ['status', 'anyof', 'SalesOrd:A']
            ],
            columns: [
                'internalid',
                'tranid',
                'entity',
                'salesrep'
            ]
        });
    }

    const getInputData = () => {

        return createSearch();
    };

    function updateSalesOrder(soId) {

        record.submitFields({
            type: record.Type.SALES_ORDER,
            id: soId,
            values: {
                orderstatus: 'B'
            }
        });
    }

    function getSalesRep(result) {

        let salesRep = 'ADMIN';

        if (
            result.values.salesrep &&
            result.values.salesrep.value
        ) {
            salesRep = result.values.salesrep.value;
        }

        return salesRep;
    }

    const map = (context) => {

        try {

            let result = JSON.parse(context.value);

            let soId = result.values.internalid.value;
            let soNumber = result.values.tranid;
            let customer = result.values.entity.text;

            let salesRep = getSalesRep(result);

            updateSalesOrder(soId);

            context.write({
                key: salesRep,
                value: JSON.stringify({
                    soNumber: soNumber,
                    customer: customer
                })
            });

        } catch (e) {

            log.error({
                title: 'MAP ERROR',
                details: e
            });
        }
    };

    function buildEmailBody(values) {

        let body =
            'The following Sales Orders were changed to Pending Fulfillment:\n\n';

        values.forEach(function(value) {

            let data = JSON.parse(value);

            body +=
                'Sales Order: ' + data.soNumber +
                ', Customer: ' + data.customer + '\n';
        });

        return body;
    }

    function getRecipient(key) {

        return key === 'ADMIN'
            ? ADMIN_ID
            : Number(key);
    }

    const reduce = (context) => {

        try {

            let body = buildEmailBody(context.values);

            let recipient = getRecipient(context.key);

            email.send({
                author: ADMIN_ID,
                recipients: recipient,
                subject: 'Sales Orders Status Updated',
                body: body
            });

        } catch (e) {

            log.error({
                title: 'REDUCE ERROR',
                details: e
            });
        }
    };

    const summarize = (summary) => {

        log.audit({
            title: 'MR COMPLETED',
            details: 'Sales Order status update completed.'
        });

        summary.mapSummary.errors.iterator().each(
            function(key, error) {

                log.error({
                    title: 'MAP ERROR - ' + key,
                    details: error
                });

                return true;
            }
        );

        summary.reduceSummary.errors.iterator().each(
            function(key, error) {

                log.error({
                    title: 'REDUCE ERROR - ' + key,
                    details: error
                });

                return true;
            }
        );
    };

    return {
        getInputData,
        map,
        reduce,
        summarize
    };
});