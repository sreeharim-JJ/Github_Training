/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/log'], (record, log) => {

    const onAction = (scriptContext) => {
        try {

            const taskValue = getTaskValue();
            return createProject(taskValue);

            function getTaskValue() {
                const newRec = scriptContext.newRecord;

                const taskTitle = newRec.getValue({
                    fieldId: 'title'
                });

                const taskAssignee = newRec.getText({
                    fieldId: 'assigned'
                });

                const estimatedHours =
                    parseFloat(
                        newRec.getValue({
                            fieldId: 'custevent4'
                        })
                    ) || 0;

                const complexityScore = estimatedHours * 10;

                let projectCategory = '';

                if (complexityScore > 100) {
                    projectCategory = 'Complex';
                } else if (complexityScore >= 50) {
                    projectCategory = 'Moderate';
                } else {
                    projectCategory = 'Simple';
                }

                return {
                    taskTitle,
                    taskAssignee,
                    estimatedHours,
                    complexityScore,
                    projectCategory
                };
            }

            function createProject(taskValue) {

                const projectRec = record.create({
                    type: 'customrecordcustom_recordfield'
                });

                projectRec.setValue({
                    fieldId: 'name',
                    value: taskValue.taskTitle || 'Untitled Project'
                });

                if (taskValue.taskAssignee) {
                    projectRec.setValue({
                        fieldId: 'custrecord1433',
                        value: taskValue.taskAssignee
                    });
                }

                projectRec.setValue({
                    fieldId: 'custrecord1434',
                    value: taskValue.estimatedHours
                });

                projectRec.setValue({
                    fieldId: 'custrecord1435',
                    value: taskValue.complexityScore
                });

                projectRec.setValue({
                    fieldId: 'custrecord1436',
                    value: taskValue.projectCategory
                });

                const projectId = projectRec.save();

                log.audit({
                    title: 'Custom Project Created',
                    details: 'Project ID: ' + projectId
                });

                return projectId;
            }

        } catch (error) {

            log.error({
                title: error.name,
                details: error.message
            });

            throw error;
        }
    };

    return {
        onAction
    };
});
