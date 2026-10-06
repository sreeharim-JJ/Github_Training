/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define([
    'N/search',
    'N/email',
    'N/render',
    'N/log'
], function(search, email, render, log) {

    function execute() {

        try {

            var soSearch = search.create({
                type: search.Type.SALES_ORDER,
                filters: [
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['datecreated', 'on', 'today']
                ],
                columns: [
                    search.createColumn({
                        name: 'internalid'
                    }),
                    search.createColumn({
                        name: 'tranid'
                    }),
                    search.createColumn({
                        name: 'entity'
                    }),
                    search.createColumn({
                        name: 'email',
                        join: 'customer'
                    })
                ]
            });

            soSearch.run().each(function(result) {

                var soId = result.getValue({
                    name: 'internalid'
                });

                var tranId = result.getValue({
                    name: 'tranid'
                });

                var customerId = result.getValue({
                    name: 'entity'
                });

                var customerEmail = result.getValue({
                    name: 'email',
                    join: 'customer'
                });

                log.debug({
                    title: 'Sales Order Found',
                    details: {
                        soId: soId,
                        tranId: tranId,
                        customerId: customerId,
                        customerEmail: customerEmail
                    }
                });

                if (!customerEmail) {

                    log.error({
                        title: 'Customer Email Missing',
                        details: 'Customer ID: ' + customerId
                    });

                    return true;
                }

                try {

                    var pdfFile = render.transaction({
                        entityId: Number(soId),
                        printMode: render.PrintMode.PDF
                    });

                    log.debug({
                        title: 'PDF Generated',
                        details: pdfFile.name
                    });

                    email.send({
                        author: -5,
                        recipients: customerEmail,
                        subject: 'Sales Order ' + tranId,
                        body:
                            'Hello,<br/><br/>' +
                            'Please find attached Sales Order ' +
                            tranId +
                            '.<br/><br/>Thank You.',
                        attachments: [pdfFile]
                    });

                    log.audit({
                        title: 'Email Sent Successfully',
                        details:
                            'SO: ' +
                            tranId +
                            ' sent to ' +
                            customerEmail
                    });

                } catch (e) {

                    log.error({
                        title: 'Email/PDF Error',
                        details: JSON.stringify({
                            name: e.name,
                            message: e.message,
                            stack: e.stack
                        })
                    });
                }

                return true;
            });

        } catch (e) {

            log.error({
                title: 'Script Error',
                details: JSON.stringify({
                    name: e.name,
                    message: e.message,
                    stack: e.stack
                })
            });
        }
    }

    return {
        execute: execute
    };

});