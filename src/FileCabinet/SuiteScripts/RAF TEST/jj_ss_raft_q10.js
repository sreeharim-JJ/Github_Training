/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search','N/runtime','N/record','N/file','N/email'],
(search,runtime,record,file,email) => {

    const execute = (scriptContext) => {

        log.debug('SCRIPT START', 'Scheduled Script Started');

        const salesorderSearchObj = search.create({
            type: "salesorder",
            settings:[
                {name:"consolidationtype",value:"ACCTTYPE"},
                {name:"includeperiodendtransactions",value:"F"}
            ],
            filters:[
                ["type","anyof","SalesOrd"],
                "AND",
                ["status","anyof","SalesOrd:B"],
                "AND",
                ["trandate","on","10/16/2026"],
                "AND",
                ["mainline","is","T"]
            ],
            columns:[
                search.createColumn({name:"tranid"}),
                search.createColumn({name:"internalid"}),
                search.createColumn({name:"amount"}),
                search.createColumn({name:"entity"})
            ]
        });

        let csvContent = 'Customer Name,Sales Order Number,Internal Id,Total Amount\n';
        let closedCount = 0;

        log.debug('BEFORE SEARCH', 'Starting Search');

        salesorderSearchObj.run().each(function(result){

            let docNo = result.getValue({name:'tranid'});
            let internalId = result.getValue({name:'internalid'});
            let amount = result.getValue({name:'amount'});
            let customerName = result.getText({name:'entity'});

            log.debug('SEARCH RESULT', {
                docNo: docNo,
                internalId: internalId,
                amount: amount,
                customerName: customerName
            });

            try {

                let soRec = record.load({
                    type: record.Type.SALES_ORDER,
                    id: internalId
                });

                log.debug('RECORD LOADED', internalId);

                let lineCount = soRec.getLineCount({
                    sublistId: 'item'
                });

                log.debug('LINE COUNT', lineCount);

                for (let i = 0; i < lineCount; i++) {

                    log.debug('CLOSING LINE', i);

                    soRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'isclosed',
                        line: i,
                        value: true
                    });
                }

                let saveId = soRec.save();

                log.debug('RECORD SAVED', saveId);

                closedCount++;

            } catch (e) {

                log.error('SALES ORDER ERROR', e);

            }

            csvContent +=
                customerName + ',' +
                docNo + ',' +
                internalId + ',' +
                amount + '\n';

            return true;
        });

        log.debug('TOTAL CLOSED COUNT', closedCount);

        log.debug(
            'REMAINING USAGE',
            runtime.getCurrentScript().getRemainingUsage()
        );

        let csvFile = file.create({
            name: 'salesorderclose.csv',
            fileType: file.Type.CSV,
            contents: csvContent
        });

        log.debug('CSV CREATED', csvFile.name);

        if (closedCount > 0) {

            log.debug('EMAIL BLOCK', 'Entered');

            try {
                email.send({
                    author: -5,
                    recipients: 5211,
                    subject: 'sales order closed',
                    body: 'sales order closed successfully',
                    attachments: [csvFile]
                });

                log.audit('EMAIL SUCCESS', 'Email Sent Successfully');

            } catch (e) {

                log.error('EMAIL ERROR', e);

            }

        } else {

            log.debug('EMAIL SKIPPED', 'closedCount is 0');

        }

        log.debug('SCRIPT END', 'Completed');
    }

    return {
        execute
    };

});