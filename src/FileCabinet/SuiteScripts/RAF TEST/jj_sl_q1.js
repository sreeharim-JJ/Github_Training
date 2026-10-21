/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

/******************************************************************************
********
 * ABC Industries
 *
 * ${OTP0000}: ${jj_sl_q1.js}
 *
 *
 ******************************************************************************
********
 *
 * Author: Jobin and Jismi IT Services
 *
 * Date Created : 13-October-2026
 *
 * Description : There is an external application called 
TVmaze.com - Your personal TV guide . From this application, we need to fetch TV shows details using API call display the results on a Suitelet page.
The expected working of the Suitelet page:
The Suitelet page must contain a search field for entering a TV shows name. After entering the show name in the search field, user needs to be click a button on the page, The button needs to be named “search shows“.
On this button click, The TV shows must be listed on the page based on the entered value in the search field. The TV shows detail must be displayed in the Result subtab.
 From the API response, the results are displayed as a sublist view, This sublist must be contains 4 columns. The colums are name, type, language and URL. These information will get response JSON.
 The API endpoint will be: https://api.tvmaze.com/search/shows?q={str}
Where "str" is the search input.
 *
 *
 * REVISION HISTORY
 *
 * @version 2.1  ABC-5 : 24-September-2026 : Created the initial build by JJI0044
 *
 *
 *
 *
 ******************************************************************************
*********/


define(['N/ui/serverWidget', 'N/https', 'N/log'], (serverWidget, https, log) => {

    const onRequest = (context) => {

        const form = serverWidget.createForm({
            title: 'TV Show Search'
        });

        const showField = form.addField({
            id: 'custpage_showname',
            type: serverWidget.FieldType.TEXT,
            label: 'Show Name'
        });

        form.addTab({
            id: 'custpage_resulttab',
            label: 'Result'
        });

        form.addSubmitButton({
            label: 'Search Shows'
        });

        if (context.request.method === 'POST') {

            const showName = context.request.parameters.custpage_showname || '';
            showField.defaultValue = showName;

            const sublist = form.addSublist({
                id: 'custpage_results',
                type: serverWidget.SublistType.LIST,
                label: 'TV Shows',
                tab: 'custpage_resulttab'
            });

            sublist.addField({
                id: 'custpage_name',
                type: serverWidget.FieldType.TEXT,
                label: 'Name'
            });

            sublist.addField({
                id: 'custpage_type',
                type: serverWidget.FieldType.TEXT,
                label: 'Type'
            });

            sublist.addField({
                id: 'custpage_language',
                type: serverWidget.FieldType.TEXT,
                label: 'Language'
            });

            sublist.addField({
                id: 'custpage_url',
                type: serverWidget.FieldType.TEXT,
                label: 'URL'
            });

            try {

                const response = https.get({
                    url: 'https://api.tvmaze.com/search/shows?q=' + encodeURIComponent(showName)
                });

                const data = JSON.parse(response.body);

                for (let i = 0; i < data.length; i++) {

                    const show = data[i].show;

                    if (show.name) {
                        sublist.setSublistValue({
                            id: 'custpage_name',
                            line: i,
                            value: show.name
                        });
                    }

                    if (show.type) {
                        sublist.setSublistValue({
                            id: 'custpage_type',
                            line: i,
                            value: show.type
                        });
                    }

                    if (show.language) {
                        sublist.setSublistValue({
                            id: 'custpage_language',
                            line: i,
                            value: show.language
                        });
                    }

                    if (show.url) {
                        sublist.setSublistValue({
                            id: 'custpage_url',
                            line: i,
                            value: show.url
                        });
                    }
                }

            } catch (e) {
                log.error({
                    title: 'API Error',
                    details: e
                });
            }
        }

        context.response.writePage(form);
    };

    return {
        onRequest
    };
});