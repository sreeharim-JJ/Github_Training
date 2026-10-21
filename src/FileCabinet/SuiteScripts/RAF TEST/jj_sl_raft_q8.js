/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/http'], (serverWidget, http) => {

    function onRequest(context) {

        const form = serverWidget.createForm({
            title: 'University List'
        });

        const countryFld = form.addField({
            id: 'custpage_country',
            type: serverWidget.FieldType.SELECT,
            label: 'Country'
        });

        countryFld.isMandatory = true;

        countryFld.addSelectOption({ value: '', text: '' });
        countryFld.addSelectOption({ value: 'India', text: 'India' });
        countryFld.addSelectOption({ value: 'China', text: 'China' });
        countryFld.addSelectOption({ value: 'Japan', text: 'Japan' });

        const selectedCountry = context.request.parameters.custpage_country;

        if (selectedCountry) {
            countryFld.defaultValue = selectedCountry;
        }

        const sublist = form.addSublist({
            id: 'custpage_universitylist',
            type: serverWidget.SublistType.LIST,
            label: 'Universities'
        });

        sublist.addField({
            id: 'custpage_countryname',
            type: serverWidget.FieldType.TEXT,
            label: 'Country Name'
        });

        sublist.addField({
            id: 'custpage_state',
            type: serverWidget.FieldType.TEXT,
            label: 'State/Province'
        });

        sublist.addField({
            id: 'custpage_webpage',
            type: serverWidget.FieldType.URL,
            label: 'Web Page'
        });

        if (selectedCountry) {

        const response = http.get({
    url: 'http://universities.hipolabs.com/search?country=' +encodeURIComponent(selectedCountry)
});

            const universities = JSON.parse(response.body);

            for (let i = 0; i < universities.length; i++) {

                const uni = universities[i];

                if (uni.country) {
                    sublist.setSublistValue({
                        id: 'custpage_countryname',
                        line: i,
                        value: uni.country
                    });
                }

                if (uni['state-province']) {
                    sublist.setSublistValue({
                        id: 'custpage_state',
                        line: i,
                        value: uni['state-province']
                    });
                }

                if (uni.web_pages && uni.web_pages.length > 0) {
                    sublist.setSublistValue({
                        id: 'custpage_webpage',
                        line: i,
                        value: uni.web_pages[0]
                    });
                }
            }
        }

        form.addSubmitButton({
            label: 'Submit'
        });

        context.response.writePage(form);
    }

    return {
        onRequest: onRequest
    };
});