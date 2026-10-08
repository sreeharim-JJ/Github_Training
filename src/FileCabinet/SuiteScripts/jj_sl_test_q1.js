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
                    title:'Registration Form'
                });
                regForm.addField({
                    id: 'custpage_name',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Name'
                }).isMandatory = true;
                regForm.addField({
                    id: 'custpage_fathername',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Father Name'
                }).isMandatory = true;
                regForm.addField({
                    id: 'custpage_age',
                    type: serverWidget.FieldType.INTEGER,
                    label: 'Age'
                });
                regForm.addField({
                    id: 'custpage_phone',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Phone Number'
                });
                 regForm.addField({
                        id: 'custpage_email',
                        type: serverWidget.FieldType.EMAIL,
                        label: 'Email',
                    }).isMandatory = true;
                regForm.addField({
                        id: 'custpage_address',
                        type: serverWidget.FieldType.TEXTAREA,
                        label: 'Address',
                       
                    });
               
               
                regForm.addSubmitButton({
                    label: 'Submit'
                });
                scriptContext.response.writePage({
                    pageObject:regForm
                });
            }
            else{
                let params = scriptContext.request.parameters;
 
                let regRec = record.create({
                    type: 'customrecordjj_sl_registration_form_test',
                    isDynamic: true
                });
 
                regRec.setValue({
                    fieldId: 'name',
                    value: params.custpage_name
                });
 
                regRec.setValue({
                    fieldId: 'custrecord1427',
                    value: params.custpage_name
                });
 
                regRec.setValue({
                    fieldId: 'custrecord1428',
                    value: params.custpage_age
                });
 
               
                    regRec.setValue({
                        fieldId: 'custrecord1429',
                        value: params.custpage_phone
                    });
               
 
               
                    regRec.setValue({
                        fieldId: 'custrecord1430',
                        value: params.custpage_email
                    });

                    regRec.setValue({
                        fieldId: 'custrecord1431',
                        value:params.custpage_fathername
                    })
                     regRec.setValue({
                        fieldId: 'custrecord1432',
                        value:params.custpage_address
                    })
               
 
                let regId = regRec.save();
                scriptContext.response.write(`
                    <h2>Registration SUccessful</h2>
                    <p><b>Reg ID:</b> ${regId}</p>
                    <p><b>Name:</b> ${params.custpage_name}</p>
                    <p><b>Age:</b> ${params.custpage_age}</p>
                    <p><b>Father's Name:</b> ${params.custpage_fathername}</p>
                    <p><b>Address:</b> ${params.custpage_address}</p>
                    <p><b>Email:</b> ${params.custpage_email}</p>
                `);
           
            }
        }
 
        return {
            onRequest:onRequest
        }
 
    });