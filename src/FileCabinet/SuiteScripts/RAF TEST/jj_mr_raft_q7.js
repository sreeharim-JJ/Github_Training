/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
    'N/runtime',
    'N/search',
    'N/render',
    'N/email',
    'N/format',
    'N/log'
], function (
    runtime,
    search,
    render,
    email,
    format,
    log
) {

    const EMAIL_AUTHOR = -5;

    function getInputData() {

        log.audit({
            title: 'Map/Reduce Started',
            details: 'Searching for active customers'
        });

        return search.create({
            type: search.Type.CUSTOMER,
            filters: [
                ['isinactive', search.Operator.IS, 'F']
            ],
            columns: [
                search.createColumn({
                    name: 'internalid',
                    sort: search.Sort.ASC
                })
            ]
        });
    }

    function map(context) {

        const customerId = '';

        try {
            const result = JSON.parse(context.value);
            customerId = Number(result.id);

            const script = runtime.getCurrentScript();

            const folderId = Number(
                script.getParameter({
                    name: 'custscript_stmt_folder_id'
                })
            );

            const startDateValue = script.getParameter({
                name: 'custscript_stmt_start_date'
            });

            if (!customerId) {
                throw new Error('Customer internal ID is missing.');
            }

            if (!folderId) {
                throw new Error('Folder ID is missing.');
            }

            if (!startDateValue) {
                throw new Error('Start date is missing.');
            }

            const startDate = formatStatementDate(startDateValue);

            const statementDate = format.format({
                value: new Date(),
                type: format.Type.DATE
            });

            log.audit({
                title: 'Creating Customer Statement',
                details: JSON.stringify({
                    customerId: customerId,
                    folderId: folderId,
                    startDate: startDate,
                    statementDate: statementDate
                })
            });

            const statementFile = render.statement({
                entityId: customerId,
                printMode: render.PrintMode.PDF,
                startDate: startDate,
                statementDate: statementDate,
                openTransactionsOnly: false,
                consolidateStatements: false,
                inCustLocale: true
            });

            statementFile.name =
                customerId + '_' + createTimestamp() + '.pdf';

            statementFile.folder = folderId;

            const fileId = statementFile.save();

            log.audit({
                title: 'Statement Created',
                details: JSON.stringify({
                    customerId: customerId,
                    fileId: fileId,
                    fileName: statementFile.name
                })
            });

            context.write({
                key: String(customerId),
                value: JSON.stringify({
                    success: true,
                    customerId: customerId,
                    fileId: fileId
                })
            });

        } catch (error) {

            log.error({
                title: 'Customer Statement Error: ' + customerId,
                details: JSON.stringify({
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                })
            });

            context.write({
                key: String(customerId || 'UNKNOWN'),
                value: JSON.stringify({
                    success: false,
                    customerId: customerId,
                    message: error.message || String(error)
                })
            });
        }
    }

    function summarize(summary) {

        const script = runtime.getCurrentScript();

        const recipient = script.getParameter({
            name: 'custscript_stmt_email'
        });

        const folderId = script.getParameter({
            name: 'custscript_stmt_folder_id'
        });

        const folderName = script.getParameter({
            name: 'custscript_stmt_folder_name'
        });

        const successCount = 0;
        const failureCount = 0;
        const errorMessages = [];

        if (summary.inputSummary.error) {
            errorMessages.push(
                'Input error: ' + summary.inputSummary.error
            );
        }

        summary.mapSummary.errors.iterator().each(
            function (key, value) {

                failureCount++;

                if (errorMessages.length < 20) {
                    errorMessages.push(
                        'Customer ' + key + ': ' + getMapError(value)
                    );
                }

                return true;
            }
        );

        summary.output.iterator().each(
            function (key, value) {

                try {
                    const result = JSON.parse(value);

                    if (result.success) {
                        successCount++;
                    } else {
                        failureCount++;

                        if (errorMessages.length < 20) {
                            errorMessages.push(
                                'Customer ' + key + ': ' +
                                result.message
                            );
                        }
                    }

                } catch (error) {

                    failureCount++;

                    if (errorMessages.length < 20) {
                        errorMessages.push(
                            'Customer ' + key +
                            ': Unable to read processing result.'
                        );
                    }
                }

                return true;
            }
        );

        log.audit({
            title: 'Map/Reduce Completed',
            details: JSON.stringify({
                folderId: folderId,
                folderName: folderName,
                successful: successCount,
                failed: failureCount,
                usage: summary.usage,
                yields: summary.yields
            })
        });

        if (!recipient) {
            log.error({
                title: 'Email Not Sent',
                details: 'Notification email address is missing.'
            });

            return;
        }

        const emailBody =
            'Customer statement generation has completed.\n\n' +
            'Folder name: ' + folderName + '\n' +
            'Folder internal ID: ' + folderId + '\n' +
            'Statements created: ' + successCount + '\n' +
            'Statements failed: ' + failureCount + '\n' +
            'Governance usage: ' + summary.usage + '\n' +
            'Number of yields: ' + summary.yields;

        if (errorMessages.length > 0) {
            emailBody +=
                '\n\nErrors:\n' +
                errorMessages.join('\n');
        }

        try {
            email.send({
                author: EMAIL_AUTHOR,
                recipients: recipient,
                subject: failureCount > 0
                    ? 'Customer statement generation completed with errors'
                    : 'Customer statement generation completed successfully',
                body: emailBody
            });

            log.audit({
                title: 'Completion Email Sent',
                details: recipient
            });

        } catch (error) {

            log.error({
                title: 'Completion Email Error',
                details: JSON.stringify({
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                })
            });
        }
    }

    function formatStatementDate(value) {

        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');

        if (!match) {
            throw new Error(
                'Invalid start date. Use YYYY-MM-DD format.'
            );
        }

        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);

        const date = new Date(year, month - 1, day);

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            throw new Error('Invalid start date value.');
        }

        return format.format({
            value: date,
            type: format.Type.DATE
        });
    }

    function createTimestamp() {

        const date = new Date();

        return date.getFullYear() +
            pad(date.getMonth() + 1) +
            pad(date.getDate()) + '_' +
            pad(date.getHours()) +
            pad(date.getMinutes()) +
            pad(date.getSeconds()) +
            String(date.getMilliseconds()).padStart(3, '0');
    }

    function pad(value) {
        return String(value).padStart(2, '0');
    }

    function getMapError(value) {

        try {
            const parsed = JSON.parse(value);
            return parsed.message || value;

        } catch (error) {
            return value;
        }
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
});