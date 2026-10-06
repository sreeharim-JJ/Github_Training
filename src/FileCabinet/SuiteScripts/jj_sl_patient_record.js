/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/ui/serverWidget'],
    /**
 * @param{record} record
 * @param{serverWidget} serverWidget
 */
    (record, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            if (scriptContext.request.method === 'GET') {
                let regForm = serverWidget.createForm({
                    title:'Patient Information Form'
                });
                regForm.addField({
                    id: 'custpage_name',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Name'
                }).isMandatory = true;
                regForm.addField({
                    id: 'custpage_age',
                    type: serverWidget.FieldType.INTEGER,
                    label: 'Age'
                });
                regForm.addField({
                    id: 'custpage_sex',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customlist935',
                    label: 'Sex'
                });
                regForm.addField({
                        id: 'custpage_address',
                        type: serverWidget.FieldType.TEXTAREA,
                        label: 'Address',
                       
                    });
               
               
                regForm.addSubmitButton({
                    label: 'Submit Button'
                });
                scriptContext.response.writePage({
                    pageObject:regForm
                });
            }
            else{
                let params = scriptContext.request.parameters;
 
                let patientRec = record.create({
                    type: 'customrecordcust_rec_patient',
                    isDynamic: true
                });
 
                patientRec.setValue({
                    fieldId: 'name',
                    value: params.custpage_name
                });
 
                patientRec.setValue({
                    fieldId: 'custrecord1409',
                    value: params.custpage_name
                });
 
                patientRec.setValue({
                    fieldId: 'custrecord1410',
                    value: params.custpage_age
                });
 
               
                    patientRec.setValue({
                        fieldId: 'custrecord1411',
                        value: params.custpage_sex
                    });
               
 
               
                    patientRec.setValue({
                        fieldId: 'custrecord1412',
                        value: params.custpage_address
                    });
               
 
                let patientId = patientRec.save();
                scriptContext.response.write(`
                    <h2>Patient Created Successfully</h2>
                    <p><b>Patient ID:</b> ${patientId}</p>
                    <p><b>Name:</b> ${params.custpage_name}</p>
                    <p><b>Age:</b> ${params.custpage_age}</p>
                    <p><b>Sex:</b> ${params.custpage_sex}</p>
                    <p><b>Address:</b> ${params.custpage_address}</p>
                `);
           
            }
        }
 
        return {onRequest}
 
    });