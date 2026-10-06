/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define([
    'N/search',
    'N/record',
    'N/email',
    'N/runtime',
    'N/log'
], function (search, record, email, runtime, log) {

    function execute(context) {

        var poSearch = search.create({
            type: 'transaction',
            filters: [
                ['type','is','purchaseorder']
                ['mainline', 'is', 'T'],
                'AND',
                ['datecreated', 'onorafter', 'today'],

            ],
            columns: [
                'internalid',
                'tranid',
                'employee'
            ]
        });

        poSearch.run().each(function (result) {

            try {

                var poId = result.getValue('internalid');
                var employeeId = result.getValue('employee');

                if (!employeeId) {
                    return true;
                }

                var poRec = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: poId
                });

                var lineCount = poRec.getLineCount({
                    sublistId: 'item'
                });

                var missingVendorItems = [];

                for (var i = 0; i < lineCount; i++) {

                    var itemId = poRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });

                    if (!itemId) {
                        continue;
                    }

                    var itemLookup = search.lookupFields({
                        type: search.Type.ITEM,
                        id: itemId,
                        columns: ['itemid']
                    });

                    var itemName = itemLookup.itemid || itemId;

                    var vendorSearch = search.create({
                        type: 'item',
                        filters: [
                            ['internalid', 'anyof', itemId]
                        ],
                        columns: [
                            search.createColumn({
                                name: 'vendor'
                            }),
                            search.createColumn({
                                name: 'preferredvendor'
                            })
                        ]
                    });

                    var hasPreferredVendor = false;

                    vendorSearch.run().each(function (vendorResult) {

                        var preferredVendor = vendorResult.getValue({
                            name: 'preferredvendor'
                        });

                        if (preferredVendor) {
                            hasPreferredVendor = true;
                        }

                        return false;
                    });

                    if (!hasPreferredVendor) {
                        missingVendorItems.push(itemName);
                    }
                }

                if (missingVendorItems.length > 0) {

                    var body = '';

                    missingVendorItems.forEach(function (itemName) {
                        body += 'No preferred vendor is added for the item "' +
                                itemName +
                                '". Please update the preferred vendor.<br/><br/>';
                    });

                    email.send({
                        author: runtime.getCurrentUser().id,
                        recipients: employeeId,
                        subject: 'Items Missing Preferred Vendor',
                        body: body
                    });

                    log.audit({
                        title: 'Email Sent',
                        details: 'PO ' + poId +
                                 ' - Employee ' + employeeId
                    });
                }

            } catch (e) {

                log.error({
                    title: 'PO Processing Error',
                    details: e
                });
            }

            return true;
        });
    }

    return {
        execute: execute
    };

});