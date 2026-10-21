/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

/******************************************************************************
********
 * ABC Industries
 *
 * ${OTP0000}: ${jj_ss_q2.js}
 *
 *
 ******************************************************************************
********
 *
 * Author: Jobin and Jismi IT Services
 *
 * Date Created : 13-October-2026
 *
 * Description : Create a sales order report for sending emails to sales reps. Each sales rep must receive their own sales order report in the email.
The report only include each sales rep’s current day sales order data. The email will be automatically scheduled  every day at 9:00 PM.
Notes: Each sales rep's email should only include their own sales order data.
The sales order data table must include the sales order document number, customer name, date of the sales order creation, and total amount.
The author of the email will be the supervisor of each sales rep, if supervisor is not exist, the author must be the admin(INTERNAL ID: -5).
The subject of the email is “Kindly review your sales order {today’s date}“.  Note: The today’s date must be replaced todays date.
The email body will be the sales order data table. (The sales order report)
Document Number
	
Customer name
Date
Amount
The document number must be a hyper link value. When user clicking on the hyper link, corresponding sales order must be open in NetSuite.
 *
 *
 * REVISION HISTORY
 *
 * @version 2.1  ABC-5 : 24-September-2026 : Created the initial build by JJI0044
 *
 *
 *
 *
 ******************************************************************************
*********/

define(['N/search', 'N/email', 'N/url', 'N/log'],
(search, email, url, log) => {

    const EMAIL_AUTHOR_ID = 6858;

    const execute = () => {

        try {

            log.audit({
                title: 'Script Started',
                details: 'Daily Sales Order Report Started'
            });

            const salesRepData = {};

            search.create({
                type: search.Type.TRANSACTION,

                filters: [
                    ['type', 'anyof', 'SalesOrd'],
                    'AND',
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['datecreated', 'within', 'today']
                ],

                columns: [
                    search.createColumn({ name: 'entity' }),
                    search.createColumn({ name: 'tranid' }),
                    search.createColumn({ name: 'amount' }),
                    search.createColumn({ name: 'internalid' }),
                    search.createColumn({ name: 'salesrep' }),
                    search.createColumn({ name: 'datecreated' })
                ]

            }).run().each(result => {

                const repId = result.getValue({
                    name: 'salesrep'
                });

                const repName = result.getText({
                    name: 'salesrep'
                });

                if (!repId || Number(repId) <= 0) {
                    return true;
                }

                if (!salesRepData[repId]) {
                    salesRepData[repId] = {
                        name: repName,
                        rows: ''
                    };
                }

                const salesOrderId = result.getValue({
                    name: 'internalid'
                });

                const relativeUrl = url.resolveRecord({
                    recordType: 'salesorder',
                    recordId: salesOrderId,
                    isEditMode: false
                });

                const domain = url.resolveDomain({
                    hostType: url.HostType.APPLICATION
                });

                const salesOrderLink =
                    'https://' + domain + relativeUrl;

                salesRepData[repId].rows += `
                    <tr>
                        <td>
                            <a href="${salesOrderLink}" target="_blank">
                                ${result.getValue({ name: 'tranid' })}
                            </a>
                        </td>
                        <td>
                            ${result.getText({ name: 'entity' }) || ''}
                        </td>
                        <td>
                            ${result.getValue({ name: 'datecreated' }) || ''}
                        </td>
                        <td>
                            ${result.getValue({ name: 'amount' }) || '0.00'}
                        </td>
                    </tr>
                `;

                return true;
            });

            Object.keys(salesRepData).forEach(repId => {

                try {

                    const employee = search.lookupFields({
                        type: search.Type.EMPLOYEE,
                        id: repId,
                        columns: ['email']
                    });

                    if (!employee.email) {
                        return;
                    }

                    const emailBody = `
                    <html>
                   

                         <div class="container">

                            <p>Hello ${salesRepData[repId].name},</p>

                            <p>
                                Kindly review the Sales Orders created today.
                            </p>

                            <table>
                                <tr>
                                    <th>Document Number</th>
                                    <th>Customer Name</th>
                                    <th>Date Created</th>
                                    <th>Amount</th>
                                </tr>

                                ${salesRepData[repId].rows}

                            </table>

                        </div>

                    </body>
                    </html>
                    `;

                    email.send({
                        author: EMAIL_AUTHOR_ID,
                        recipients: Number(repId),
                        subject:
                            'Kindly review your Sales Orders - ' +
                            new Date().toLocaleDateString(),
                        body: emailBody
                    });

                    log.audit({
                        title: 'Email Sent',
                        details: `Email sent to ${repId}`
                    });

                } catch (emailError) {

                    log.error({
                        title: 'Email Error',
                        details: emailError
                    });
                }
            });

            log.audit({
                title: 'Script Completed',
                details: 'All emails sent successfully'
            });

        } catch (e) {

            log.error({
                title: 'Script Error',
                details: e
            });
        }
    };

    return {
        execute
    };
});