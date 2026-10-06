/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record'],
function(serverWidget, record) {

    function onRequest(context) {

        if (context.request.method == 'GET') {

            let form = serverWidget.createForm({
                title: 'Customer Information Form'
            });

            form.addField({
                id: 'custpage_name',
                type: serverWidget.FieldType.TEXT,
                label: 'Name'
            });

            form.addField({
                id: 'custpage_email',
                type: serverWidget.FieldType.EMAIL,
                label: 'Email'
            });

            form.addField({
                id: 'custpage_phone',
                type: serverWidget.FieldType.PHONE,
                label: 'Phone'
            });

            form.addField({
                id: 'custpage_salesrep',
                type: serverWidget.FieldType.SELECT,
                label: 'Sales Rep',
                source: 'employee'
            });

            form.addField({
                id: 'custpage_subsidiary',
                type: serverWidget.FieldType.SELECT,
                label: 'Subsidiary',
                source: 'subsidiary'
            });

            form.addSubmitButton({
                label: 'Submit'
            });

            context.response.writePage(form);

        } else {

            let name = context.request.parameters.custpage_name;
            let email = context.request.parameters.custpage_email;
            let phone = context.request.parameters.custpage_phone;
            let salesRep = context.request.parameters.custpage_salesrep;
            let subsidiary = context.request.parameters.custpage_subsidiary;

            
            let customerRec = record.create({
                type: record.Type.CUSTOMER
            });

            customerRec.setValue({
                fieldId: 'companyname',
                value: name
            });

            customerRec.setValue({
                fieldId: 'email',
                value: email
            });

            customerRec.setValue({
                fieldId: 'phone',
                value: phone
            });

            if (salesRep) {
                customerRec.setValue({
                    fieldId: 'salesrep',
                    value: salesRep
                });
            }

            if (subsidiary) {
                customerRec.setValue({
                    fieldId: 'subsidiary',
                    value: subsidiary
                });
            }

            let customerId = customerRec.save();

            let form = serverWidget.createForm({
                title: 'Customer Information Form'
            });

            let result = form.addField({
                id: 'custpage_result',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Result'
            });

            result.defaultValue =
                '<h3>Customer Created Successfully</h3>' +
                '<p><b>Customer ID:</b> ' + customerId + '</p>' +
                '<p><b>Name:</b> ' + name + '</p>' +
                '<p><b>Email:</b> ' + email + '</p>' +
                '<p><b>Phone:</b> ' + phone + '</p>' +
                '<p><b>Sales Rep:</b> ' + salesRep + '</p>' +
                '<p><b>Subsidiary:</b> ' + subsidiary + '</p>';

            context.response.writePage(form);
        }
    }

    return {
        onRequest: onRequest
    };
});