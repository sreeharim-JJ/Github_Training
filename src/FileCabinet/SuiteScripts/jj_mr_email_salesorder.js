/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/file', 'N/search', 'N/email', 'N/runtime'],
    (file, search, email, runtime) => {

        const ADMIN_ID = -5;

        function createSalesOrderSearch() {

            return search.create({
                type: 'transaction',
                filters: [
                    ['type', 'anyof', 'SalesOrd'],
                    'AND',
                    ['trandate', 'within', 'lastmonth'],
                    'AND',
                    ['mainline', 'is', 'T']
                ],
                columns: [
                    search.createColumn({ name: 'tranid' }),
                    search.createColumn({ name: 'entity' }),
                    search.createColumn({ name: 'email' }),
                    search.createColumn({ name: 'salesrep' }),
                    search.createColumn({ name: 'total' })
                ]
            });
        }

        const getInputData = (inputContext) => {

            log.audit({
                title: 'MR STARTED',
                details: 'Creating Sales Order search for previous month'
            });

            let soSearch = createSalesOrderSearch();

            log.audit({
                title: 'SEARCH CREATED',
                details: 'Input search successfully created'
            });

            return soSearch;
        };

        function getSalesRepId(result) {

            let salesRepId = 'ADMIN';

            if (
                result.values.salesrep &&
                result.values.salesrep.value
            ) {
                salesRepId = result.values.salesrep.value;
            }

            return salesRepId;
        }

        function getMapData(result) {

            return {
                customerName: result.values.entity
                    ? result.values.entity.text
                    : '',

                customerEmail: result.values.email || '',

                soNumber: result.values.tranid || '',

                amount: result.values.total || ''
            };
        }

        const map = (mapContext) => {

            try {

                log.debug({
                    title: 'MAP INPUT',
                    details: mapContext.value
                });

                let result = JSON.parse(mapContext.value);

                let salesRepId = getSalesRepId(result);

                let data = getMapData(result);

                log.debug({
                    title: 'MAP DATA',
                    details: {
                        salesRepId: salesRepId,
                        customerName: data.customerName,
                        customerEmail: data.customerEmail,
                        soNumber: data.soNumber,
                        amount: data.amount
                    }
                });

                mapContext.write({
                    key: salesRepId,
                    value: JSON.stringify(data)
                });

                log.debug({
                    title: 'WRITING TO REDUCE',
                    details: 'Key: ' + salesRepId
                });

            } catch (e) {

                log.error({
                    title: 'MAP ERROR',
                    details: e
                });
            }
        };

        function buildCsvContent(values) {

            let csvContent =
                'Customer Name,Customer Email,Sales Order Number,Sales Amount\n';

            values.forEach(function(value) {

                let data = JSON.parse(value);

                log.debug({
                    title: 'REDUCE RECORD',
                    details: data
                });

                csvContent +=
                    data.customerName + ',' +
                    data.customerEmail + ',' +
                    data.soNumber + ',' +
                    data.amount + '\n';
            });

            return csvContent;
        }

        function createCsvFile(csvContent) {

            return file.create({
                name: 'MonthlySalesReport.csv',
                fileType: file.Type.CSV,
                contents: csvContent
            });
        }

        function sendAdminEmail(csvFile) {

            email.send({
                author: ADMIN_ID,
                recipients: ADMIN_ID,
                subject: 'Customers Without Sales Representative',
                body:
                    'Please assign a Sales Representative for the customers in the attached report. The attached report contains customer sales information for the previous month.',
                attachments: [csvFile]
            });
        }

        function sendSalesRepEmail(recipientId, csvFile) {

            email.send({
                author: ADMIN_ID,
                recipients: Number(recipientId),
                subject: 'Monthly Customer Sales Report',
                body:
                    'Please find attached the customer sales report for the previous month.',
                attachments: [csvFile]
            });
        }

        const reduce = (reduceContext) => {

            try {

                log.audit({
                    title: 'REDUCE STARTED',
                    details: 'Processing Key: ' + reduceContext.key
                });

                let csvContent = buildCsvContent(reduceContext.values);

                let csvFile = createCsvFile(csvContent);

                log.audit({
                    title: 'CSV CREATED',
                    details: {
                        fileName: csvFile.name,
                        recipientKey: reduceContext.key,
                        recordCount: reduceContext.values.length
                    }
                });

                if (reduceContext.key === 'ADMIN') {

                    log.audit({
                        title: 'SENDING ADMIN EMAIL',
                        details: {
                            author: ADMIN_ID,
                            recipient: ADMIN_ID
                        }
                    });

                    sendAdminEmail(csvFile);

                    log.audit({
                        title: 'ADMIN EMAIL SENT',
                        details: 'Email successfully sent to admin.'
                    });

                } else {

                    log.audit({
                        title: 'SENDING SALES REP EMAIL',
                        details: {
                            author: ADMIN_ID,
                            recipient: reduceContext.key
                        }
                    });

                    sendSalesRepEmail(reduceContext.key, csvFile);

                    log.audit({
                        title: 'SALES REP EMAIL SENT',
                        details:
                            'Email successfully sent to Sales Rep ' +
                            reduceContext.key
                    });
                }

            } catch (e) {

                log.error({
                    title: 'REDUCE ERROR',
                    details: e
                });
            }
        };

        const summarize = (summaryContext) => {

            log.audit({
                title: 'MAP REDUCE SUMMARY',
                details: {
                    usage: summaryContext.usage,
                    concurrency: summaryContext.concurrency,
                    yields: summaryContext.yields
                }
            });

            summaryContext.mapSummary.errors.iterator().each(function(key, error) {

                log.error({
                    title: 'MAP ERROR - ' + key,
                    details: error
                });

                return true;
            });

            summaryContext.reduceSummary.errors.iterator().each(function(key, error) {

                log.error({
                    title: 'REDUCE ERROR - ' + key,
                    details: error
                });

                return true;
            });

            log.audit({
                title: 'MR COMPLETED',
                details: 'Monthly Sales Report Processing Completed Successfully'
            });
        };

        return {
            getInputData,
            map,
            reduce,
            summarize
        };
    });