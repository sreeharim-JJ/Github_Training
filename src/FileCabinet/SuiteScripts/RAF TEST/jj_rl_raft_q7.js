/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record', 'N/search', 'N/task', 'N/log'],

function(record, search, task, log) {

    var MR_SCRIPT_ID = 'customscriptjj_mr_raft_q7';
    var MR_DEPLOYMENT_ID = 'customdeploy1';

    function post(requestBody) {

        log.audit({
            title: 'START',
            details: JSON.stringify(requestBody)
        });

        try {

            var folderName = requestBody.folderName || requestBody['folder name'];
            var emailAddress = requestBody.emailAddress || requestBody['email address'];
            var startDate = requestBody.startDate;

            log.audit({
                title: 'REQUEST VALUES',
                details: {
                    folderName: folderName,
                    emailAddress: emailAddress,
                    startDate: startDate
                }
            });

            if (!folderName || !emailAddress || !startDate) {
                return {
                    success: false,
                    message: 'folderName, emailAddress and startDate are required'
                };
            }

            var folderSearch = search.create({
                type: search.Type.FOLDER,
                filters: [
                    ['name', 'is', folderName]
                ]
            }).run().getRange({
                start: 0,
                end: 1
            });

            if (folderSearch.length > 0) {

                log.audit({
                    title: 'FOLDER EXISTS',
                    details: folderName
                });

                return {
                    success: false,
                    message: 'Folder already exists'
                };
            }

            log.audit({
                title: 'CREATING FOLDER',
                details: folderName
            });

            var folderRec = record.create({
                type: record.Type.FOLDER
            });

            folderRec.setValue({
                fieldId: 'name',
                value: folderName
            });

            var folderId = folderRec.save();

            log.audit({
                title: 'FOLDER CREATED',
                details: folderId
            });

            var mrTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: MR_SCRIPT_ID,
                deploymentId: MR_DEPLOYMENT_ID,
                params: {
                    custscript_stmt_folder_id: folderId,
                    custscript_stmt_folder_name: folderName,
                    custscript_stmt_email: emailAddress,
                    custscript_stmt_start_date: startDate
                }
            });

            log.audit({
                title: 'SUBMITTING MAP REDUCE',
                details: MR_SCRIPT_ID
            });

            var taskId = mrTask.submit();

            log.audit({
                title: 'MAP REDUCE SUBMITTED',
                details: taskId
            });

            return {
                success: true,
                folderId: folderId,
                taskId: taskId,
                message: 'Processing started'
            };

        } catch (e) {

            log.error({
                title: 'ERROR',
                details: e
            });

            return {
                success: false,
                error: e.name,
                message: e.message
            };
        }
    }

    return {
        post: post
    };

});