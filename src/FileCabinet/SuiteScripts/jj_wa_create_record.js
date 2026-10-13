/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/record'],
    /**
 * @param{record} record
 */
    (record) => {
        /**
         * Defines the WorkflowAction script trigger point.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.workflowId - Internal ID of workflow which triggered this action
         * @param {string} scriptContext.type - Event type
         * @param {Form} scriptContext.form - Current form that the script uses to interact with the record
         * @since 2016.1
         */
        const onAction = (scriptContext) => {
            log.debug('TEST', 'Workflow Action Script Ran');
            let newRec = scriptContext.newRecord;
            let customRecord = record.create({
            type: 'customrecordcustomrecord_task_custom'
        });
 
        customRecord.setValue({
            fieldId: 'name',
            value: newRec.getValue({
                fieldId: 'title'
            })
        });
        customRecord.setValue({
            fieldId: 'custrecocustrecord_test_field',
            value: 'Test Value'
        });
        let customRecordId = customRecord.save();
 
        return customRecordId;
 
        }
 
        return {onAction};
    });