/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define([
    'N/ui/serverWidget',
    'N/search',
    'N/record',
    'N/redirect',
    'N/log',
    'N/error'
], function (serverWidget, search, record,log,error, redirect) {

    var CUSTOM_RECORD = 'customrecord956';

    var EXPENSE_CATEGORY_ID = 5; // CHANGE THIS

    function onRequest(context) {

        if (context.request.method === 'GET') {

            var form = serverWidget.createForm({
                title: 'J&J Onam 2024 Employee Commission'
            });

            var sublist = form.addSublist({
                id: 'custpage_employees',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'Employees'
            });

            sublist.addField({
                id: 'custpage_select',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Select'
            });

            sublist.addField({
                id: 'custpage_employee',
                type: serverWidget.FieldType.SELECT,
                source: 'employee',
                label: 'Employee'
            });

            sublist.addField({
                id: 'custpage_sales',
                type: serverWidget.FieldType.CURRENCY,
                label: '2023 Sales'
            });

            sublist.addField({
                id: 'custpage_commission',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Commission (2%)'
            });

            loadEmployees(sublist);

            form.addSubmitButton({
                label: 'Save'
            });

            context.response.writePage(form);

        } else {

            var lineCount = context.request.getLineCount({
                group: 'custpage_employees'
            });

            for (var i = 0; i < lineCount; i++) {

                var selected = context.request.getSublistValue({
                    group: 'custpage_employees',
                    name: 'custpage_select',
                    line: i
                });

                if (selected !== 'T') {
                    continue;
                }

                var employeeId = context.request.getSublistValue({
                    group: 'custpage_employees',
                    name: 'custpage_employee',
                    line: i
                });

                if (!employeeId) {
                    continue;
                }

                var salesAmount =
                    parseFloat(
                        context.request.getSublistValue({
                            group: 'custpage_employees',
                            name: 'custpage_sales',
                            line: i
                        })
                    ) || 0;

                var commissionAmount =
                    parseFloat(
                        context.request.getSublistValue({
                            group: 'custpage_employees',
                            name: 'custpage_commission',
                            line: i
                        })
                    ) || 0;

                try {

    processEmployee(
        employeeId,
        salesAmount,
        commissionAmount
    );

} catch (e) {

    log.error({
        title: 'FULL ERROR',
        details: JSON.stringify({
            name: e.name,
            message: e.message,
            stack: e.stack
        })
    });

    throw error.create({
        name: 'DEBUG_ERROR',
        message: e.name + ' :: ' + e.message
    });
}
            }

            context.response.write('Completed Successfully');
        }
    }

    function loadEmployees(sublist) {

        var line = 0;

        search.create({
            type: search.Type.EMPLOYEE,
            filters: [
                ['salesrep', 'is', 'T'],
                'AND',
                ['isinactive', 'is', 'F']
            ],
            columns: [
                'internalid'
            ]
        }).run().each(function(emp){

            var employeeId = emp.getValue('internalid');

            var salesAmount = get2023Sales(employeeId);

            var commissionAmount = salesAmount * 0.02;

            sublist.setSublistValue({
                id: 'custpage_employee',
                line: line,
                value: employeeId
            });

            if (salesAmount > 0) {

                sublist.setSublistValue({
                    id: 'custpage_sales',
                    line: line,
                    value: salesAmount.toString()
                });
            }

            if (commissionAmount > 0) {

                sublist.setSublistValue({
                    id: 'custpage_commission',
                    line: line,
                    value: commissionAmount.toString()
                });
            }

            line++;
            return true;
        });
    }

    function get2023Sales(employeeId) {

        var totalSales = 0;

        search.create({
            type: search.Type.INVOICE,
            filters: [
                ['salesrep','anyof',employeeId],
                'AND',
                ['mainline','is','T'],
                'AND',
                ['trandate','within','1/1/2023','12/31/2023']
            ],
            columns: [
                search.createColumn({
                    name: 'amount',
                    summary: search.Summary.SUM
                })
            ]
        }).run().each(function(r){

            totalSales =
                parseFloat(
                    r.getValue({
                        name:'amount',
                        summary:search.Summary.SUM
                    })
                ) || 0;

            return false;
        });

        return totalSales;
    }

   function processEmployee(employeeId, salesAmount, commissionAmount) {

    var commissionId = getCommissionRecord(employeeId);

    if (commissionId) {

        record.submitFields({
            type: CUSTOM_RECORD,
            id: commissionId,
            values: {
                custrecord1465: commissionAmount,
                custrecord1466: salesAmount,
                custrecord1468: '2023'
            }
        });

    } else {

        var commRec = record.create({
            type: CUSTOM_RECORD
        });

        // REQUIRED because Include Name Field is enabled
        commRec.setValue({
            fieldId: 'name',
            value: 'Commission-' + employeeId + '-2023'
        });

        commRec.setValue({
            fieldId: 'custrecord1464',
            value: employeeId
        });

        commRec.setValue({
            fieldId: 'custrecord1465',
            value: commissionAmount
        });

        commRec.setValue({
            fieldId: 'custrecord1466',
            value: salesAmount
        });

        commRec.setValue({
            fieldId: 'custrecord1468',
            value: '2023'
        });

        commissionId = commRec.save({
            enableSourcing: true,
            ignoreMandatoryFields: false
        });
    }

    try {

        var expenseReportId = createOrUpdateExpenseReport(
            employeeId,
            commissionAmount
        );

        if (expenseReportId) {

            record.submitFields({
                type: CUSTOM_RECORD,
                id: commissionId,
                values: {
                    custrecord1467: expenseReportId
                }
            });
        }

    } catch (e) {

        log.error({
            title: 'EXPENSE REPORT ERROR',
            details: e.name + ' : ' + e.message
        });
    }
}

    function getCommissionRecord(employeeId) {

        var commissionId = '';

        search.create({
            type: CUSTOM_RECORD,
            filters: [
                ['custrecord1464','anyof',employeeId]
            ],
            columns: [
                'internalid'
            ]
        }).run().each(function(r){

            commissionId = r.getValue('internalid');
            return false;
        });

        return commissionId;
    }

    function createOrUpdateExpenseReport(employeeId, commissionAmount) {

        var expenseReportId = '';

        search.create({
            type: 'expensereport',
            filters: [
                ['entity','anyof',employeeId]
            ],
            columns: [
                'internalid'
            ]
        }).run().each(function(r){

            expenseReportId = r.getValue('internalid');
            return false;
        });

        if (expenseReportId) {

            var expenseReport = record.load({
    type: record.Type.EXPENSE_REPORT,
    id: expenseReportId,
    isDynamic: true
});
            var lineCount =
                expenseReport.getLineCount({
                    sublistId:'expense'
                });

            if (lineCount > 0) {

                expenseReport.selectLine({
                    sublistId:'expense',
                    line:0
                });

                expenseReport.setCurrentSublistValue({
                    sublistId:'expense',
                    fieldId:'amount',
                    value:commissionAmount
                });

                expenseReport.commitLine({
                    sublistId:'expense'
                });
            }

            return expenseReport.save();
        }

       var er = record.create({
    type: record.Type.EXPENSE_REPORT,
    isDynamic: true
});

        er.setValue({
            fieldId:'entity',
            value:employeeId
        });

        er.selectNewLine({
            sublistId:'expense'
        });

        er.setCurrentSublistValue({
            sublistId:'expense',
            fieldId:'category',
            value:EXPENSE_CATEGORY_ID
        });

        er.setCurrentSublistValue({
            sublistId:'expense',
            fieldId:'amount',
            value:commissionAmount
        });

        er.setCurrentSublistValue({
            sublistId:'expense',
            fieldId:'memo',
            value:'Onam 2024 Commission'
        });

        er.commitLine({
            sublistId:'expense'
        });

        return er.save();
    }

    return {
        onRequest: onRequest
    };

});