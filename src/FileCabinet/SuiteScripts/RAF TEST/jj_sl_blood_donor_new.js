/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/ui/serverWidget','N/record','N/search','N/format'
], ( serverWidget, record, search, format) => {

    const onRequest = (context) => {

        const request = context.request;

        // SAVE DONOR

        if (
            request.method === 'POST' &&
            request.parameters.custpage_action === 'SAVE'
        ) {

            const donor = record.create({
    type: 'customrecord957',
    isDynamic: true
});

            donor.setValue({
                fieldId: 'custrecord1469',
                value: request.parameters.custpage_fname
            });

            donor.setValue({
                fieldId: 'custrecord1470',
                value: request.parameters.custpage_lname
            });

            donor.setValue({
                fieldId: 'custrecord1471',
                value: request.parameters.custpage_gender
            });

            donor.setValue({
                fieldId: 'custrecord1472',
                value: request.parameters.custpage_phone
            });

            donor.setValue({
                fieldId: 'custrecord1473',
                value: request.parameters.custpage_blood
            });

            const donationDate = format.parse({
    value: request.parameters.custpage_date,
    type: format.Type.DATE
});

donor.setValue({
    fieldId: 'custrecord1474',
    value: donationDate
});
var recName =
    (request.parameters.custpage_fname || '') +
    ' ' +
    (request.parameters.custpage_lname || '');

donor.setValue({
    fieldId: 'name',
    value: recName.trim()
});

log.debug('Record Name', recName);

            donor.save();
        }

        // FORM

        const form = serverWidget.createForm({
            title: 'Blood Donor Management'
        });

    //    form.clientScriptModulePath =
    // 'src/FileCabinet/SuiteScripts/RAF TEST/jj_cs_blood_donor_new.js';


        // ACTION


        const actionField = form.addField({
            id: 'custpage_action',
            type: serverWidget.FieldType.TEXT,
            label: 'Action'
        });

        actionField.updateDisplayType({
            displayType:
                serverWidget.FieldDisplayType.HIDDEN
        });

        actionField.defaultValue = 'SAVE';

        // DONOR DETAILS

        form.addField({
            id: 'custpage_fname',
            type: serverWidget.FieldType.TEXT,
            label: 'First Name'
        });

        form.addField({
            id: 'custpage_lname',
            type: serverWidget.FieldType.TEXT,
            label: 'Last Name'
        });

        const genderField = form.addField({
            id: 'custpage_gender',
            type: serverWidget.FieldType.SELECT,
            label: 'Gender'
        });

        genderField.addSelectOption({
            value: '',
            text: ''
        });

        genderField.addSelectOption({
            value: 'Male',
            text: 'Male'
        });

        genderField.addSelectOption({
            value: 'Female',
            text: 'Female'
        });

        form.addField({
            id: 'custpage_phone',
            type: serverWidget.FieldType.PHONE,
            label: 'Phone Number'
        });

        const bloodField = form.addField({
            id: 'custpage_blood',
            type: serverWidget.FieldType.SELECT,
            label: 'Blood Group'
        });

        bloodField.addSelectOption({
            value: '',
            text: ''
        });

        [
            'A+',
            'A-',
            'B+',
            'B-',
            'AB+',
            'AB-',
            'O+',
            'O-'
        ].forEach(group => {

            bloodField.addSelectOption({
                value: group,
                text: group
            });

        });

        form.addField({
            id: 'custpage_date',
            type: serverWidget.FieldType.DATE,
            label: 'Last Donation Date'
        });

        form.addSubmitButton({
            label: 'Save Donor'
        });

        // SEARCH

        form.addFieldGroup({
            id: 'custpage_searchgrp',
            label: 'Search Eligible Donors'
        });

        const searchBlood = form.addField({
            id: 'custpage_searchblood',
            type: serverWidget.FieldType.TEXT,
            label: 'Blood Group',
            container: 'custpage_searchgrp'
        });

        const searchName = form.addField({
            id: 'custpage_searchname',
            type: serverWidget.FieldType.TEXT,
            label: 'Name',
            container: 'custpage_searchgrp'
        });

        searchBlood.defaultValue =
            request.parameters.custpage_searchblood || '';

        searchName.defaultValue =
            request.parameters.custpage_searchname || '';

        form.addButton({
            id: 'custpage_send',
            label: 'Send To Another Account',
            functionName: 'sendDonor'
        });

        // SUBLIST

        const sublist = form.addSublist({
            id: 'custpage_results',
            type: serverWidget.SublistType.LIST,
            label: 'Eligible Donors'
        });

        sublist.addField({
            id: 'custpage_select',
            type: serverWidget.FieldType.CHECKBOX,
            label: 'Select'
        });

        const donorIdFld = sublist.addField({
            id: 'custpage_donorid',
            type: serverWidget.FieldType.TEXT,
            label: 'Donor ID'
        });

        donorIdFld.updateDisplayType({
            displayType:
                serverWidget.FieldDisplayType.HIDDEN
        });

        sublist.addField({
            id: 'custpage_name',
            type: serverWidget.FieldType.TEXT,
            label: 'Name'
        });

        sublist.addField({
            id: 'custpage_gendercol',
            type: serverWidget.FieldType.TEXT,
            label: 'Gender'
        });

        sublist.addField({
            id: 'custpage_phonecol',
            type: serverWidget.FieldType.TEXT,
            label: 'Phone'
        });

        sublist.addField({
            id: 'custpage_bloodcol',
            type: serverWidget.FieldType.TEXT,
            label: 'Blood Group'
        });

        sublist.addField({
            id: 'custpage_datecol',
            type: serverWidget.FieldType.TEXT,
            label: 'Last Donation Date'
        });

        // SEARCH FILTERS

        const filters = [
            ['custrecord1474', 'onorbefore', 'daysago90']
        ];

        if (
            request.parameters.custpage_searchblood
        ) {

            filters.push('AND');

            filters.push([
                'custrecord1473',
                'is',
                request.parameters.custpage_searchblood
            ]);
        }

        const donorSearch = search.create({
            type: 'customrecord957',
            filters: filters,
            columns: [
                'custrecord1469',
                'custrecord1470',
                'custrecord1471',
                'custrecord1472',
                'custrecord1473',
                'custrecord1474'
            ]
        });

        let line = 0;

        donorSearch.run().each(result => {

            const fullName =
                (result.getValue('custrecord1469') || '') +
                ' ' +
                (result.getValue('custrecord1470') || '');

            const enteredName =
                request.parameters
                    .custpage_searchname || '';

            if (
                enteredName &&
                !fullName
                    .toLowerCase()
                    .includes(
                        enteredName.toLowerCase()
                    )
            ) {
                return true;
            }

            sublist.setSublistValue({
                id: 'custpage_donorid',
                line,
                value: String(result.id)
            });

            sublist.setSublistValue({
                id: 'custpage_name',
                line,
                value: fullName
            });

            if (
                result.getValue('custrecord1471')
            ) {

                sublist.setSublistValue({
                    id: 'custpage_gendercol',
                    line,
                    value:
                        result.getValue(
                            'custrecord1471'
                        )
                });

            }

            if (
                result.getValue('custrecord1472')
            ) {

                sublist.setSublistValue({
                    id: 'custpage_phonecol',
                    line,
                    value:
                        result.getValue(
                            'custrecord1472'
                        )
                });

            }

            if (
                result.getValue('custrecord1473')
            ) {

                sublist.setSublistValue({
                    id: 'custpage_bloodcol',
                    line,
                    value:
                        result.getValue(
                            'custrecord1473'
                        )
                });

            }

            if (
                result.getText('custrecord1474')
            ) {

                sublist.setSublistValue({
                    id: 'custpage_datecol',
                    line,
                    value:
                        result.getText(
                            'custrecord1474'
                        )
                });

            }

            line++;
            return true;
        });

        context.response.writePage(form);
    };

    return {
        onRequest
    };

});