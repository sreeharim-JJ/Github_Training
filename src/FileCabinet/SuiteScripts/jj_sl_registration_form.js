/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget'], (serverWidget) => {

    const onRequest = (context) => {

        const form = serverWidget.createForm({
            title: 'Registration Form'
        });

        form.addField({
            id: 'custpage_name',
            type: serverWidget.FieldType.TEXT,
            label: 'Name'
        });

        form.addField({
            id: 'custpage_age',
            type: serverWidget.FieldType.INTEGER,
            label: 'Age'
        });

        form.addField({
            id: 'custpage_phone',
            type: serverWidget.FieldType.PHONE,
            label: 'Phone Number'
        });

        form.addField({
            id: 'custpage_email',
            type: serverWidget.FieldType.EMAIL,
            label: 'Email'
        });

        form.addField({
            id: 'custpage_father',
            type: serverWidget.FieldType.TEXT,
            label: "Father's Name"
        });

        form.addField({
            id: 'custpage_address',
            type: serverWidget.FieldType.TEXTAREA,
            label: 'Address'
        });

        form.addSubmitButton({
            label: 'Submit'
        });

        context.response.writePage(form);
    };

    return {
        onRequest
    };
});