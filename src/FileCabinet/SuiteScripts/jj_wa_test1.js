/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/log'], (log) => {

    const onAction = (context) => {

        const rec = context.newRecord;

        const dob = rec.getValue({
            fieldId: 'birthdate'
        });

        if (!dob) {
            log.debug('DOB Missing', 'Birthdate is empty');
            return;
        }

        const today = new Date();
        const birthDate = new Date(dob);

        let age = today.getFullYear() - birthDate.getFullYear();

        log.debug('Calculated Age', age);

        return age;
    };

    return {
        onAction
    };
});
