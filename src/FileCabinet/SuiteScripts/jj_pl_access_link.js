/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 */
define([], function () {

    function render(params) {

        var portlet = params.portlet;

        portlet.title = 'Finance Quick Access';

        // -------------------------
        // Reports
        // -------------------------

        portlet.addLine({
            text: '📊 Reports',
            align: 0
        });

        portlet.addLine({
            text: '📈 Quarterly Revenue Report',
            url: '/app/common/search/savedsearchresults.nl?searchid=1626&saverun=T&whence=',
            align: 1
        });

        portlet.addLine({
            text: '💰 Outstanding Invoices',
            url: '#',
            align: 1
        });

        portlet.addLine({
            text: '📄 Profit & Loss Report',
            url: '#',
            align: 1
        });

        // -------------------------
        // Analytics
        // -------------------------

        portlet.addLine({
            text: '📉 Analytics',
            align: 0
        });

        portlet.addLine({
            text: '📊 Revenue Dashboard',
            url: '#',
            align: 1
        });

        portlet.addLine({
            text: '📈 Cash Flow Dashboard',
            url: '#',
            align: 1
        });

        portlet.addLine({
            text: '📉 Expense Analysis',
            url: '#',
            align: 1
        });

        // -------------------------
        // Quick Actions
        // -------------------------

        portlet.addLine({
            text: '⚡ Quick Actions',
            align: 0
        });

        portlet.addLine({
            text: '➕ Create Invoice',
            url: 'https://td3111354.app.netsuite.com/app/accounting/transactions/custinvc.nl?whence=&siaT=1790740948923&siaWhc=%2Fapp%2Fcenter%2Fcard.nl&siaNv=ct2',
            align: 1
        });

        portlet.addLine({
            text: '💵 Record Customer Payment',
            url: '#',
            align: 1
        });

        portlet.addLine({
            text: '👤 Add Customer',
            url: 'https://td3111354.app.netsuite.com/app/common/entity/custjob.nl?whence=&siaT=1790741362652&siaWhc=%2Fapp%2Faccounting%2Ftransactions%2Fcustinvc.nl&siaNv=ct3',
            align: 1
        });
    }

    return {
        render: render
    };
});