/****
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define([], () => {

    const onAction = (context) => {

        const rec = context.newRecord;

        const total = parseFloat(rec.getValue({
            fieldId: 'total'
        })) || 0;

        let approvalStatus;

        if (total > 500) {
            approvalStatus = 'Pending Approval';
        } else {
            approvalStatus = 'Approved';
        }

        rec.setValue({
            fieldId: 'custbody25',
            value: approvalStatus
        });

        return approvalStatus;
    };

    return {
        onAction
    };
});