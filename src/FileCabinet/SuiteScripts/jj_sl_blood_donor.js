/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/search', 'N/ui/serverWidget'],
    /**
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (search, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            let regForm = serverWidget.createForm({
                title:'Blood Donors'
            });
 
            regForm.addField({
                id: 'custpage_bld_grp',
                type: serverWidget.FieldType.SELECT,
                label: 'Blood Group',
                source: 'customlist927'
            });
 
            regForm.addSubmitButton({
                label: 'Search'
            });
            let sublist = regForm.addSublist({
                id: 'custpage_sublistid',
                type: serverWidget.SublistType.LIST,
                label: 'Blood Donor'
            });
            sublist.addField({
                id: 'custpage_name',
                type: serverWidget.FieldType.TEXT,
                label: 'Name'
            });
            sublist.addField({
                id: 'custpage_phno',
                type: serverWidget.FieldType.TEXT,
                label: 'Phone Number'
            });
           
            let bloodGroup = scriptContext.request.parameters.custpage_bld_grp;
            let filters = [                
            ];
            if (bloodGroup) {
                    filters.push(['custrecord1414','anyof',bloodGroup]);
                }
            let soSearch= search.create({
                type:'customrecord926',
                isPublic:true,
                filters:filters,
               
                columns:[
                    search.createColumn({name:'custrecord1413'}),
                    search.createColumn({name:'custrecord1415'}),
                ]
            });
               
        let line = 0;
        soSearch.run().each(function(result){
            let name = result.getValue('custrecord1413'|| '');
            let phoneNumber = result.getValue('custrecord1415'|| '');
 
 
            if (name) {
    sublist.setSublistValue({
        id: 'custpage_name',
        line: line,
        value: name
    });
}

if (phoneNumber) {
    sublist.setSublistValue({
        id: 'custpage_phno',
        line: line,
        value: phoneNumber
    });
}
 
            line++;
            return true
        });
            scriptContext.response.writePage({
            pageObject:regForm
        });
        }
 
        return {onRequest}
 
    });