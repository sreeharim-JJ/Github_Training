/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/ui/serverWidget',
    'N/search',
    'N/record',
    'N/runtime'
], (
    serverWidget,
    search,
    record,
    runtime
) => {

    const CUSTOM_RECORD = 'customrecord945';

    function getAllResults(searchObj) {
        const results = [];

        const pagedData = searchObj.runPaged({
            pageSize: 1000
        });

        pagedData.pageRanges.forEach(pageRange => {
            const page = pagedData.fetch({
                index: pageRange.index
            });

            results.push(...page.data);
        });

        return results;
    }

    function createForm(params, customers) {
        const form = serverWidget.createForm({
            title: 'Customer Selection'
        });

        const startDate = form.addField({
            id: 'custpage_startdate',
            type: serverWidget.FieldType.DATE,
            label: 'Start Date'
        });

        startDate.isMandatory = true;
        startDate.defaultValue =
            params.custpage_startdate || '';

        const endDate = form.addField({
            id: 'custpage_enddate',
            type: serverWidget.FieldType.DATE,
            label: 'End Date'
        });

        endDate.isMandatory = true;
        endDate.defaultValue =
            params.custpage_enddate || '';

        const active = form.addField({
            id: 'custpage_active',
            type: serverWidget.FieldType.CHECKBOX,
            label: 'Active Customers'
        });

        active.defaultValue =
            params.custpage_active || 'F';

        const inactive = form.addField({
            id: 'custpage_inactive',
            type: serverWidget.FieldType.CHECKBOX,
            label: 'Inactive Customers'
        });

        inactive.defaultValue =
            params.custpage_inactive || 'F';

        const loaded = form.addField({
            id: 'custpage_loaded',
            type: serverWidget.FieldType.CHECKBOX,
            label: 'Loaded'
        });

        loaded.updateDisplayType({
            displayType:
                serverWidget.FieldDisplayType.HIDDEN
        });

        loaded.defaultValue =
            customers !== null ? 'T' : 'F';

        if (customers !== null) {
            const list = form.addSublist({
                id: 'custpage_customers',
                type: serverWidget.SublistType.LIST,
                label: 'Customers'
            });

            list.addMarkAllButtons();

            list.addField({
                id: 'custpage_select',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Select'
            });

            list.addField({
                id: 'custpage_customerid',
                type: serverWidget.FieldType.TEXT,
                label: 'Internal ID'
            });

            list.addField({
                id: 'custpage_name',
                type: serverWidget.FieldType.TEXT,
                label: 'Name'
            });

            list.addField({
                id: 'custpage_email',
                type: serverWidget.FieldType.EMAIL,
                label: 'Email'
            });

            list.addField({
                id: 'custpage_phone',
                type: serverWidget.FieldType.PHONE,
                label: 'Phone Number'
            });

            customers.forEach((customer, line) => {
                list.setSublistValue({
                    id: 'custpage_customerid',
                    line: line,
                    value: String(customer.id)
                });

                list.setSublistValue({
                    id: 'custpage_name',
                    line: line,
                    value: customer.name || ' '
                });

                if (customer.email) {
                    list.setSublistValue({
                        id: 'custpage_email',
                        line: line,
                        value: customer.email
                    });
                }

                if (customer.phone) {
                    list.setSublistValue({
                        id: 'custpage_phone',
                        line: line,
                        value: customer.phone
                    });
                }
            });

            form.addSubmitButton({
                label: 'Save Selected Customers'
            });

        } else {
            form.addSubmitButton({
                label: 'Show Customers'
            });
        }

        return form;
    }

    function getCustomers(params) {
        const activeSelected =
            params.custpage_active === 'T';

        const customerIds = [];

        /*
         * Find customers with Sales Orders
         * during the selected date period.
         */
        const orderSearch = search.create({
            type: search.Type.SALES_ORDER,

            filters: [
                ['mainline', 'is', 'T'],
                'AND',
                [
                    'trandate',
                    'within',
                    params.custpage_startdate,
                    params.custpage_enddate
                ]
            ],

            columns: [
                search.createColumn({
                    name: 'internalid',
                    sort: search.Sort.ASC
                }),

                search.createColumn({
                    name: 'entity'
                })
            ]
        });

        getAllResults(orderSearch).forEach(result => {
            const customerId = result.getValue({
                name: 'entity'
            });

            if (
                customerId &&
                customerIds.indexOf(customerId) === -1
            ) {
                customerIds.push(customerId);
            }
        });

        /*
         * No active customers found.
         */
        if (
            activeSelected &&
            customerIds.length === 0
        ) {
            return [];
        }

        /*
         * Only customers that are not marked inactive
         * in NetSuite are included.
         */
        const customerFilters = [
            ['isinactive', 'is', 'F']
        ];

        if (activeSelected) {
            customerFilters.push(
                'AND',
                ['internalid', 'anyof', customerIds]
            );

        } else if (customerIds.length > 0) {
            customerFilters.push(
                'AND',
                ['internalid', 'noneof', customerIds]
            );
        }

        const customerSearch = search.create({
            type: search.Type.CUSTOMER,

            filters: customerFilters,

            columns: [
                search.createColumn({
                    name: 'internalid',
                    sort: search.Sort.ASC
                }),

                search.createColumn({
                    name: 'entityid'
                }),

                search.createColumn({
                    name: 'email'
                }),

                search.createColumn({
                    name: 'phone'
                })
            ]
        });

        return getAllResults(customerSearch)
            .map(result => ({
                id: result.getValue({
                    name: 'internalid'
                }),

                name: result.getValue({
                    name: 'entityid'
                }),

                email: result.getValue({
                    name: 'email'
                }),

                phone: result.getValue({
                    name: 'phone'
                })
            }));
    }

    function saveCustomers(request) {
        const lineCount = request.getLineCount({
            group: 'custpage_customers'
        });

        const customerFlag =
            request.parameters.custpage_active === 'T';

        const employeeId =
            runtime.getCurrentUser().id;

        let savedCount = 0;

        for (let line = 0; line < lineCount; line++) {
            const selected =
                request.getSublistValue({
                    group: 'custpage_customers',
                    name: 'custpage_select',
                    line: line
                });

            if (selected !== 'T') {
                continue;
            }

            const customerId =
                request.getSublistValue({
                    group: 'custpage_customers',
                    name: 'custpage_customerid',
                    line: line
                });

            const customerName =
                request.getSublistValue({
                    group: 'custpage_customers',
                    name: 'custpage_name',
                    line: line
                });

            const email =
                request.getSublistValue({
                    group: 'custpage_customers',
                    name: 'custpage_email',
                    line: line
                });

            const phone =
                request.getSublistValue({
                    group: 'custpage_customers',
                    name: 'custpage_phone',
                    line: line
                });

            const customRecord = record.create({
                type: CUSTOM_RECORD,
                isDynamic: false
            });

            /*
             * Mandatory custom record Name field.
             */
            customRecord.setValue({
                fieldId: 'name',
                value: customerName ||
                    ('Customer ' + customerId)
            });

            /*
             * Created Employee.
             */
            customRecord.setValue({
                fieldId: 'custrecord1437',
                value: Number(employeeId)
            });

            /*
             * Customer Flag.
             * True for active and false for inactive.
             */
            customRecord.setValue({
                fieldId: 'custrecord1438',
                value: customerFlag
            });

            /*
             * Phone Number.
             */
            if (phone) {
                customRecord.setValue({
                    fieldId: 'custrecord1439',
                    value: phone
                });
            }

            /*
             * Email.
             */
            if (email) {
                customRecord.setValue({
                    fieldId: 'custrecord1440',
                    value: email
                });
            }

            /*
             * Customer ID.
             */
            customRecord.setValue({
                fieldId: 'custrecord1441',
                value: Number(customerId)
            });

            customRecord.save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });

            savedCount++;
        }

        return savedCount;
    }

    function showMessage(context, message) {
        const form = serverWidget.createForm({
            title: 'Customer Selection'
        });

        form.addField({
            id: 'custpage_message',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Message'
        }).defaultValue =
            '<h3>' + message + '</h3>';

        context.response.writePage(form);
    }

    function onRequest(context) {
        const request = context.request;
        const params = request.parameters;

        /*
         * First page load.
         */
        if (request.method === 'GET') {
            context.response.writePage(
                createForm({}, null)
            );

            return;
        }

        if (
            !params.custpage_startdate ||
            !params.custpage_enddate
        ) {
            showMessage(
                context,
                'Start Date and End Date are mandatory.'
            );

            return;
        }

        const active =
            params.custpage_active === 'T';

        const inactive =
            params.custpage_inactive === 'T';

        /*
         * Only one filter must be selected.
         */
        if (active === inactive) {
            showMessage(
                context,
                'Select either Active Customers or ' +
                'Inactive Customers.'
            );

            return;
        }

        /*
         * Save the selected customers.
         */
        if (params.custpage_loaded === 'T') {
            const savedCount =
                saveCustomers(request);

            if (savedCount === 0) {
                showMessage(
                    context,
                    'Please select at least one customer.'
                );

                return;
            }

            showMessage(
                context,
                savedCount +
                ' customer(s) saved successfully.'
            );

            return;
        }

        /*
         * Find and display customers.
         */
        const customers =
            getCustomers(params);

        context.response.writePage(
            createForm(params, customers)
        );
    }

    return {
        onRequest: onRequest
    };
});