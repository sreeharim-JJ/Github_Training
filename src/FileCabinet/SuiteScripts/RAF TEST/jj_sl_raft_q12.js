/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(
['N/ui/serverWidget','N/search','N/record','N/runtime','N/log','N/file','N/email'],
function (serverWidget,search,record,runtime,log,file,email) {
    const PAGE_SIZE = 10;

    function onRequest(context) {

        try {

            if (context.request.method === 'GET') {

                var req = context.request;
                var page = parseInt(req.parameters.page || 0);

                var form = serverWidget.createForm({
                    title: 'Purchase Order Email Report'
                });

                form.addSubmitButton({
                    label: 'Send Report'
                });

                var empFld = form.addField({
                    id: 'custpage_employee',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Created By',
                    source: 'employee'
                });

                if (req.parameters.custpage_employee) {
                    empFld.defaultValue =
                        req.parameters.custpage_employee;
                }

                var sublist = form.addSublist({
                    id: 'custpage_pos',
                    type: serverWidget.SublistType.INLINEEDITOR,
                    label: 'Pending Billing Purchase Orders'
                });

                sublist.addField({
                    id: 'custpage_select',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Select'
                });

                sublist.addField({
                    id: 'custpage_poid',
                    type: serverWidget.FieldType.TEXT,
                    label: 'PO Internal ID'
                });

                sublist.addField({
                    id: 'custpage_pono',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Document Number'
                });

                sublist.addField({
                    id: 'custpage_vendor',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Vendor'
                });

                sublist.addField({
                    id: 'custpage_creator',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Created By'
                });

                sublist.addField({
                    id: 'custpage_total',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Total Amount'
                });

                sublist.addField({
                    id: 'custpage_reason',
                    type: serverWidget.FieldType.TEXTAREA,
                    label: 'Delay Reason'
                });

                var filters = [
                    ['type', 'anyof', 'PurchOrd'],
                    'AND',
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['status', 'anyof', 'PurchOrd:F'],
                    'AND',
                    ['datecreated', 'onorbefore', 'daysago30']
                ];

                if (req.parameters.custpage_employee) {

                    filters.push('AND');
                    filters.push([
                        'createdby',
                        'anyof',
                        req.parameters.custpage_employee
                    ]);
                }

                var poSearch = search.create({
                    type: search.Type.PURCHASE_ORDER,
                    filters: filters,
                    columns: [
                        'internalid',
                        'tranid',
                        'entity',
                        'createdby',
                        'total'
                    ]
                });

                var pagedData = poSearch.runPaged({
                    pageSize: PAGE_SIZE
                });

                if (pagedData.count > 0) {

                    var pageData = pagedData.fetch({
                        index: page
                    });

                    for (var i = 0; i < pageData.data.length; i++) {

                        var r = pageData.data[i];

                        sublist.setSublistValue({
                            id: 'custpage_poid',
                            line: i,
                            value: r.getValue('internalid').toString()
                        });

                        sublist.setSublistValue({
                            id: 'custpage_pono',
                            line: i,
                            value: r.getValue('tranid')
                        });

                        if (r.getText('entity')) {
                            sublist.setSublistValue({
                                id: 'custpage_vendor',
                                line: i,
                                value: r.getText('entity')
                            });
                        }

                        if (r.getText('createdby')) {
                            sublist.setSublistValue({
                                id: 'custpage_creator',
                                line: i,
                                value: r.getText('createdby')
                            });
                        }

                        if (r.getValue('total')) {
                            sublist.setSublistValue({
                                id: 'custpage_total',
                                line: i,
                                value: r.getValue('total')
                            });
                        }
                    }
                }

                form.addField({
                    id: 'custpage_pageinfo',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: ' '
                }).defaultValue =
                    '<div style="padding:10px;">Page ' +
                    (page + 1) +
                    ' of ' +
                    pagedData.pageRanges.length +
                    '</div>';

                context.response.writePage(form);

            } else {

                if (
                    runtime.getCurrentScript()
                        .getRemainingUsage() < 200
                ) {
                    throw Error('Low Governance');
                }

                var req = context.request;

                var lineCount = req.getLineCount({
                    group: 'custpage_pos'
                });

                var excelRows = [];
                var supervisorMap = {};

                for (var i = 0; i < lineCount; i++) {

                    var selected = req.getSublistValue({
                        group: 'custpage_pos',
                        name: 'custpage_select',
                        line: i
                    });

                    if (selected !== 'T') {
                        continue;
                    }

                    var poId = req.getSublistValue({
                        group: 'custpage_pos',
                        name: 'custpage_poid',
                        line: i
                    });

                    var reason = req.getSublistValue({
                        group: 'custpage_pos',
                        name: 'custpage_reason',
                        line: i
                    }) || '';

                    var poInfo = search.lookupFields({
                        type: search.Type.PURCHASE_ORDER,
                        id: poId,
                        columns: [
                            'tranid',
                            'entity',
                            'createdby',
                            'total'
                        ]
                    });

                    var employeeId = '';
                    var supervisorId = '';

                    if (
                        poInfo.createdby &&
                        poInfo.createdby.length
                    ) {
                        employeeId =
                            poInfo.createdby[0].value;
                    }

                    if (employeeId) {

                        var empInfo =
                            search.lookupFields({
                                type: search.Type.EMPLOYEE,
                                id: employeeId,
                                columns: ['supervisor']
                            });

                        if (
                            empInfo.supervisor &&
                            empInfo.supervisor.length
                        ) {
                            supervisorId =
                                empInfo.supervisor[0].value;
                        }
                    }

                    var parentRec = record.create({
                        type: 'customrecord954'
                    });

                    parentRec.setValue({
                        fieldId: 'custrecord1457',
                        value: poId
                    });

                    parentRec.setValue({
                        fieldId: 'custrecord1458',
                        value: reason
                    });

                    if (employeeId) {
                        parentRec.setValue({
                            fieldId: 'custrecord1459',
                            value: employeeId
                        });
                    }

                    if (supervisorId) {
                        parentRec.setValue({
                            fieldId: 'custrecord1460',
                            value: supervisorId
                        });
                    }

                    parentRec.setValue({
                        fieldId: 'custrecord1461',
                        value: new Date()
                    });

                    parentRec.setValue({
    fieldId: 'name',
    value: 'PO Delay ' + poId
});

log.debug('BEFORE PARENT SAVE', 'Parent');
var parentId = parentRec.save();
log.debug('AFTER PARENT SAVE', parentId);

                    var lineRec = record.create({
                        type: 'customrecord_po_delay_line'
                    });

                    lineRec.setValue({
                        fieldId:
                            'custrecord_po_line_parent',
                        value: parentId
                    });

                    lineRec.setValue({
                        fieldId:
                            'custrecord_po_line_po',
                        value: poId
                    });

                    lineRec.setValue({
                        fieldId: 'custrecord1463',
                        value: reason
                    });
                    lineRec.setValue({
    fieldId: 'name',
    value: 'PO Line ' + poId
});

                   log.debug('BEFORE CHILD SAVE', 'Child');
lineRec.save();
log.debug('AFTER CHILD SAVE', 'Saved');

                    excelRows.push({
                        doc:
                            poInfo.tranid || '',
                        memo:
                            reason,
                        customer:
                            poInfo.entity &&
                            poInfo.entity.length
                                ? poInfo.entity[0].text
                                : '',
                        amount:
                            poInfo.total || 0
                    });

                    if (supervisorId) {
                        supervisorMap[
                            supervisorId
                        ] = true;
                    }
                }

                var xml =
                    '<?xml version="1.0"?>' +
                    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
                    '<Worksheet ss:Name="PO Report">' +
                    '<Table>' +

                    '<Row>' +
                    '<Cell><Data ss:Type="String">Document Number</Data></Cell>' +
                    '<Cell><Data ss:Type="String">Memo</Data></Cell>' +
                    '<Cell><Data ss:Type="String">Customer</Data></Cell>' +
                    '<Cell><Data ss:Type="String">Total Amount</Data></Cell>' +
                    '</Row>';

                excelRows.forEach(function (r) {

                    xml +=
                        '<Row>' +

                        '<Cell><Data ss:Type="String">' +
                        r.doc +
                        '</Data></Cell>' +

                        '<Cell><Data ss:Type="String">' +
                        r.memo +
                        '</Data></Cell>' +

                        '<Cell><Data ss:Type="String">' +
                        r.customer +
                        '</Data></Cell>' +

                        '<Cell><Data ss:Type="Number">' +
                        r.amount +
                        '</Data></Cell>' +

                        '</Row>';
                });

                xml +=
                    '</Table>' +
                    '</Worksheet>' +
                    '</Workbook>';

                log.debug('FILE OBJECT', file);
       var excelFile = file.create({
    name: 'PendingBillingPOReport.xls',
    fileType: file.Type.PLAINTEXT,
    contents: xml
});

    try {

    log.debug('EMAIL TEST START');

    email.send({
        author: 4866,
        recipients: [4866],
        subject: 'Test Email',
        body: 'Test'
    });

    log.debug('EMAIL TEST SUCCESS');

} catch (e) {

    log.error('EMAIL ERROR', JSON.stringify({
        name: e.name,
        message: e.message,
        stack: e.stack
    }));
}

    log.debug('EMAIL SENT');


                context.response.write(
                    'Report generated and emails sent successfully.'
                );
            }

        } catch (e) {

            log.error({
                title: 'PO REPORT ERROR',
                details: e
            });

            context.response.write(
                'ERROR : ' +
                e.name +
                ' - ' +
                e.message
            );
        }
    }

    return {
        onRequest: onRequest
    };

});