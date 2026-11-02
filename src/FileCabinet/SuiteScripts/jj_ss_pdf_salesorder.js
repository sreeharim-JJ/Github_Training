/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
    'N/search',
    'N/render',
    'N/email',
    'N/log'
], (search, render, email, log) => {

    const getInputData = () => {

        return search.create({
           type: "invoice",
   settings:[{"name":"consolidationtype","value":"ACCTTYPE"},{"name":"includeperiodendtransactions","value":"F"}],
   filters:
   [
      ["type","anyof","CustInvc"], 
      "AND", 
      ["status","anyof","CustInvc:A"], 
      "AND", 
      ["mainline","is","T"], 
      "AND", 
      ["duedate","within","lastmonth"]
   ],
   columns:
   [
      search.createColumn({name: "tranid", label: "Document Number"}),
      search.createColumn({name: "entity", label: "Name"}),
      search.createColumn({name: "trandate", label: "Date"}),
      search.createColumn({name: "duedate", label: "Due Date/Receive By"}),
      search.createColumn({name: "amountremaining", label: "Amount Remaining"}),
      search.createColumn({name: "daysoverdue", label: "Days Overdue"}),
      search.createColumn({name: "totalpackageweightinpounds", label: "Total Package Weight In Pounds"})
   ]
        });

    };

    const map = (context) => {

        try {

            const result = JSON.parse(context.value);

            const customerId = result.values.entity.value;

            let customerEmail = '';

            try {

                const customerLookup = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id: customerId,
                    columns: ['email']
                });

                customerEmail = customerLookup.email || '';
                log.debug({
            title: 'Customer Email',
            details: {
                customerId: customerId,
                email: customerEmail
            }
        });

            } catch (e) {

                log.error('CUSTOMER LOOKUP ERROR', e);
            }

            context.write({
                key: customerId,
                value: JSON.stringify({
                    invoiceId: result.id,
                    invoiceNumber: result.values.tranid,
                    customerName: result.values.entity.text,
                    customerEmail: customerEmail,
                    invoiceDate: result.values.trandate,
                    dueDate: result.values.duedate,
                    amountRemaining: result.values.amountremaining,
                    daysOverdue: result.values.daysoverdue
                })
            });

        } catch (e) {

            log.error('MAP ERROR', e);
        }
    };

    const reduce = (context) => {

        try {

            const invoices = context.values.map(v => JSON.parse(v));

            const firstInvoice = invoices[0];

            const attachments = [];

            let tableRows = '';

            invoices.forEach(inv => {

                try {

                    const pdfFile = render.transaction({
                        entityId: parseInt(inv.invoiceId),
                        printMode: render.PrintMode.PDF
                    });

                    attachments.push(pdfFile);

                    tableRows += `
                        <tr>
                            <td>${inv.invoiceNumber}</td>
                            <td>${inv.invoiceDate}</td>
                            <td>${inv.dueDate}</td>
                            <td>${inv.daysOverdue}</td>
                            <td>${inv.amountRemaining}</td>
                        </tr>
                    `;

                } catch (pdfErr) {

                    log.error(
                        'PDF ERROR FOR INVOICE ' + inv.invoiceId,
                        pdfErr
                    );
                }
            });

            const recipient =
                firstInvoice.customerEmail &&
                firstInvoice.customerEmail !== ''
                    ? firstInvoice.customerEmail
                    : 4866;

            const emailBody = `
                <html>
                   

                         <div class="container">

                            <p>Dear Customer,</p>

                            <p>
                                Kindly review your overdue invoices.
                            </p>

                            <table>
                                <tr>
                                    <th>Document Number</th>
                                    <th>Customer Name</th>
                                    <th>Date Created</th>
                                    <th>Due Date</th>
                                    <thDays Overdue</th>
                                    <th>Amount Remaining</th>
                                    <th>Amount</th>
                                </tr>

                            </table>

                        </div>

                    </body>
                    </html>
            `;

            email.send({
                author: 4866,
                recipients: recipient,
                subject: 'Overdue Invoice Notification',
                body: emailBody,
                attachments: attachments
            });

            log.audit({
                title: 'EMAIL SENT',
                details: {
                    customer: firstInvoice.customerName,
                    recipient: recipient,
                    invoiceCount: invoices.length
                }
            });

        } catch (e) {

            log.error('REDUCE ERROR', e);
        }
    };

    const summarize = (summary) => {

        if (summary.inputSummary.error) {
            log.error(
                'INPUT ERROR',
                summary.inputSummary.error
            );
        }

        summary.mapSummary.errors.iterator().each(
            (key, error) => {
                log.error(
                    'MAP ERROR ' + key,
                    error
                );
                return true;
            }
        );

        summary.reduceSummary.errors.iterator().each(
            (key, error) => {
                log.error(
                    'REDUCE ERROR ' + key,
                    error
                );
                return true;
            }
        );

        log.audit(
            'SCRIPT COMPLETED',
            'Overdue Invoice Notification Process Finished'
        );
    };

    return {
        getInputData,
        map,
        reduce,
        summarize
    };

});