/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 */
define(['N/search'], function(search) {

    function render(params) {

        var portlet = params.portlet;
        portlet.title = '🎂 Staff Birthday Tracker';

        var employeeSearch = search.create({
            type: search.Type.EMPLOYEE,
            filters: [
                ['isinactive', 'is', 'F'],
                'AND',
                ['formulanumeric: EXTRACT(MONTH FROM {birthdate})',
                 'equalto',
                 new Date().getMonth() + 1]
            ],
            columns: [
                search.createColumn({
                    name: 'entityid',
                    sort: search.Sort.ASC
                }),
                'department',
                'birthdate'
            ]
        });

        var html =
            '<table style="width:100%; border-collapse:collapse;">' +
            '<tr>' +
            '<th><b>Name</b></th>' +
            '<th><b>Department</b></th>' +
            '<th><b>Birthday</b></th>' +
            '</tr>';

        employeeSearch.run().each(function(result) {

            html += '<tr>' +
                '<td>' + (result.getValue('entityid') || '') + '</td>' +
                '<td>' + (result.getText('department') || '') + '</td>' +
                '<td>' + (result.getValue('birthdate') || '') + '</td>' +
                '</tr>';

            return true;
        });

        html += '</table>';

        portlet.html = html;
    }

    return {
        render: render
    };
});