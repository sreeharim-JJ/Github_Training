/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

/******************************************************************************
 * ABC Industries
 *
 * ${OTP0000}: ${jj_sl_raft_q4.js}
 *
 * Author: Jobin and Jismi IT Services
 * Date Created: 14-October-2026
 *
 * Description:
 * Create an online form for sales order creation using NetSuite's SuiteScript. The form should include the following details at the body level:
First Name
Last Name
Email Address
Phone Number
All the above fields are mandatory.
 
In the item sublist, the following features are required:
A facility for choosing items from the NetSuite account.
Display item descriptions pulled from the item record.
Each item must include mandatory Quantity and Price fields. The price needs to be sourced from the item's base price, and an Amount field should calculate the total (Amount = Price × Quantity).
Users should not be allowed to commit items without entering both the quantity and price.
 
Upon clicking the submit button, the system should check for duplicate customers in NetSuite using the entered email address. If the customer already exists, create a sales order for the existing customer. If the customer does not exist, create a new customer and generate a sales order for that customer.
 
Deliverables:
 
1. All sales orders must be created with a pending fulfillment status.
2. If the sales order total exceeds 500 USD, send an email to the sales rep's supervisor, including the sales order print pdf.
3. Ensure proper error handling.
4. Create proper SDF, and after code completion, push the code to GitHub.
5. The form must be accessible to users who do not have NetSuite access.
 * 
 *
 * @version 2.1 ABC-5 : 14-October-2026 : Initial build
 ******************************************************************************/

define(['N/ui/serverWidget','N/record','N/search','N/render','N/email','N/log'], (serverWidget,record,search,render,email,log) => {

    const onRequest = (context) => {
        try {
            if (context.request.method === 'GET') {
                showForm(context);
            } else {
                createOrder(context);
            }
        } catch (error) {
            log.error({
                title: 'Sales Order Error',
                details: error
            });

            context.response.write(
                'Error: ' + error.message
            );
        }
    };

    const showForm = (context) => {
        const form = serverWidget.createForm({
            title: 'Online Sales Order'
        });

        form.clientScriptModulePath =
            'SuiteScripts/RAF TEST/jj_cs_raft_q4.js';

        const firstName = form.addField({
            id: 'custpage_firstname',
            type: serverWidget.FieldType.TEXT,
            label: 'First Name'
        });

        const lastName = form.addField({
            id: 'custpage_lastname',
            type: serverWidget.FieldType.TEXT,
            label: 'Last Name'
        });

        const email = form.addField({
            id: 'custpage_email',
            type: serverWidget.FieldType.EMAIL,
            label: 'Email Address'
        });

        const phone = form.addField({
            id: 'custpage_phone',
            type: serverWidget.FieldType.PHONE,
            label: 'Phone Number'
        });

        firstName.isMandatory = true;
        lastName.isMandatory = true;
        email.isMandatory = true;
        phone.isMandatory = true;

        const sublist = form.addSublist({
            id: 'custpage_itemsublist',
            type: serverWidget.SublistType.INLINEEDITOR,
            label: 'Items'
        });

        const item = sublist.addField({
            id: 'custpage_item',
            type: serverWidget.FieldType.SELECT,
            label: 'Item',
            source: 'item'
        });

        const description = sublist.addField({
            id: 'custpage_description',
            type: serverWidget.FieldType.TEXTAREA,
            label: 'Description'
        });

        const quantity = sublist.addField({
            id: 'custpage_quantity',
            type: serverWidget.FieldType.FLOAT,
            label: 'Quantity'
        });

        const price = sublist.addField({
            id: 'custpage_price',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Price'
        });

        const amount = sublist.addField({
            id: 'custpage_amount',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Amount'
        });

        item.isMandatory = true;
        quantity.isMandatory = true;
        price.isMandatory = true;

        description.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        amount.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        form.addSubmitButton({
            label: 'Submit'
        });

        context.response.writePage(form);
    };

    const createOrder = (context) => {
        const request = context.request;

        const firstName =
            request.parameters.custpage_firstname;

        const lastName =
            request.parameters.custpage_lastname;

        const emailAddress =
            request.parameters.custpage_email;

        const phoneNumber =
            request.parameters.custpage_phone;

        if (
            !firstName ||
            !lastName ||
            !emailAddress ||
            !phoneNumber
        ) {
            throw new Error(
                'All customer fields are mandatory.'
            );
        }

        let customerId;

        const customerSearch = search.create({
            type: search.Type.CUSTOMER,
            filters: [
                ['email', 'is', emailAddress],
                'AND',
                ['isinactive', 'is', 'F']
            ],
            columns: ['internalid']
        });

        const customerResult =
            customerSearch.run().getRange({
                start: 0,
                end: 1
            });

        if (
    customerResult &&
    customerResult.length > 0
) {
    customerId = Number(customerResult[0].id);

    log.audit({
        title: 'Existing Customer Found',
        details: 'Customer ID: ' + customerId +
                 ', Email: ' + emailAddress
    });
}
 else {
            const customer = record.create({
    type: record.Type.CUSTOMER,
    isDynamic: true
});

customer.setValue({
    fieldId: 'entityid',
    value: firstName + ' ' + lastName
});

customer.setValue({
    fieldId: 'companyname',
    value: firstName + ' ' + lastName
});

customer.setValue({
    fieldId: 'email',
    value: emailAddress
});

customer.setValue({
    fieldId: 'phone',
    value: phoneNumber
});

customer.setValue({
    fieldId: 'subsidiary',
    value: 1
});

customerId = customer.save({
    enableSourcing: true,
    ignoreMandatoryFields: false
});
log.audit({
    title: 'Customer Created',
    details:
        'Customer ID: ' + customerId +
        ', Name: ' + firstName + ' ' + lastName +
        ', Email: ' + emailAddress
});
        }
        const salesOrder = record.create({
            type: record.Type.SALES_ORDER,
            isDynamic: true
        });

        salesOrder.setValue({
            fieldId: 'entity',
            value: customerId
        });

        salesOrder.setValue({
            fieldId: 'orderstatus',
            value: 'B'
        });

        const lineCount = request.getLineCount({
            group: 'custpage_itemsublist'
        });

        if (!lineCount) {
            throw new Error(
                'At least one item is required.'
            );
        }

        for (
            let line = 0;
            line < lineCount;
            line++
        ) {
            const itemId =
                request.getSublistValue({
                    group: 'custpage_itemsublist',
                    name: 'custpage_item',
                    line
                });

            const quantityValue = Number(
                request.getSublistValue({
                    group: 'custpage_itemsublist',
                    name: 'custpage_quantity',
                    line
                })
            );

            if (!itemId) {
                throw new Error(
                    `Item is required on line ${line + 1}.`
                );
            }

            if (
                !quantityValue ||
                quantityValue <= 0
            ) {
                throw new Error(
                    `Quantity is required on line ${line + 1}.`
                );
            }

            const itemResult = search.create({
                type: search.Type.ITEM,
                filters: [
                    ['internalid', 'anyof', itemId]
                ],
                columns: [
                    'salesdescription',
                    'baseprice'
                ]
            }).run().getRange({
                start: 0,
                end: 1
            });

            if (
                !itemResult ||
                itemResult.length === 0
            ) {
                throw new Error(
                    `Invalid item on line ${line + 1}.`
                );
            }

            const description =
                itemResult[0].getValue({
                    name: 'salesdescription'
                }) || '';

            const basePrice = Number(
                itemResult[0].getValue({
                    name: 'baseprice'
                })
            );

            if (
                !Number.isFinite(basePrice) ||
                basePrice < 0
            ) {
                throw new Error(
                    `Price is required on line ${line + 1}.`
                );
            }

            salesOrder.selectNewLine({
                sublistId: 'item'
            });

            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: Number(itemId),
                forceSyncSourcing: true
            });

            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: quantityValue
            });

            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'price',
                value: -1
            });

            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                value: basePrice
            });

            if (description) {
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'description',
                    value: description
                });
            }

            salesOrder.commitLine({
                sublistId: 'item'
            });
        }

        const salesOrderId =
            salesOrder.save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });

        const savedOrder = record.load({
            type: record.Type.SALES_ORDER,
            id: salesOrderId
        });

        const total = Number(
            savedOrder.getValue({
                fieldId: 'total'
            })
        );

        const salesRepId =
            savedOrder.getValue({
                fieldId: 'salesrep'
            });

        if (total > 500) {
            if (!salesRepId) {
                throw new Error(
                    'Sales order was created, but no sales representative is assigned.'
                );
            }

            const employeeDetails =
                search.lookupFields({
                    type: search.Type.EMPLOYEE,
                    id: salesRepId,
                    columns: ['supervisor']
                });

            const supervisor =
                employeeDetails.supervisor;

            if (
                !supervisor ||
                supervisor.length === 0
            ) {
                throw new Error(
                    'Sales order was created, but the sales representative has no supervisor.'
                );
            }

            const supervisorId =
                supervisor[0].value;

            const pdfFile =
                render.transaction({
                    entityId:
                        Number(salesOrderId),
                    printMode:
                        render.PrintMode.PDF
                });

            email.send({
                author: Number(salesRepId),
                recipients:
                    Number(supervisorId),
                subject:
                    'Sales Order Exceeds 500 USD',
                body:
                    'Sales Order ' +
                    savedOrder.getValue({
                        fieldId: 'tranid'
                    }) +
                    ' has a total of USD ' +
                    total.toFixed(2) +
                    '.',
                attachments: [pdfFile],
                relatedRecords: {
                    transactionId:
                        Number(salesOrderId)
                }
            });
        }

        context.response.write(
            'Sales Order created successfully. Internal ID: ' +
            salesOrderId
        );
    };

    return {
        onRequest
    };
});