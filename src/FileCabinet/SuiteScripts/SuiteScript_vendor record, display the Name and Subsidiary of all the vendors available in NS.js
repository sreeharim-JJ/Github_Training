// When you create a vendor record, display the Name and Subsidiary of all the vendors available in your NetSuite account.

/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/ui/serverWidget'], function (search, serverWidget) {

    function beforeLoad(context) {

        if (context.type !== context.UserEventType.CREATE) {
            return;
        }

        var form = context.form;

        var sublist = form.addSublist({
            id: 'custpage_vendor_list',
            type: serverWidget.SublistType.LIST,
            label: 'Existing Vendors'
        });

        sublist.addField({
            id: 'custpage_vendor_name',
            type: serverWidget.FieldType.TEXT,
            label: 'Vendor Name'
        });

        sublist.addField({
            id: 'custpage_subsidiary',
            type: serverWidget.FieldType.TEXT,
            label: 'Subsidiary'
        });

        var vendorSearch = search.create({
            type: search.Type.VENDOR,
            columns: [
                search.createColumn({ name: 'entityid' }),
                search.createColumn({ name: 'subsidiary' })
            ]
        });

        var line = 0;

        vendorSearch.run().each(function (result) {

            var vendorName = result.getValue('entityid') || '';
            var subsidiary = result.getText('subsidiary') || '';

            sublist.setSublistValue({
                id: 'custpage_vendor_name',
                line: line,
                value: vendorName
            });

            if (subsidiary) {
                sublist.setSublistValue({
                    id: 'custpage_subsidiary',
                    line: line,
                    value: subsidiary
                });
            }

            line++;
            return true;
        });
    }

    return {
        beforeLoad: beforeLoad
    };
});