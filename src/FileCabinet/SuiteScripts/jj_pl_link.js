/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 */
define([], function () {

    function render(params) {

        var portlet = params.portlet;

        portlet.title = 'Purchase Quick Access';
        
        portlet.addLine({
            text:'📊 Orders',
            align:0
        });
        portlet.addLine({
            text: '📊 Open Purchase Order',
            url : 'https://td3111354.app.netsuite.com/app/accounting/transactions/transactionlist.nl?Transaction_TYPE=PurchOrd&whence=&siaT=1790749779897&siaWhc=%2Fapp%2Fcenter%2Fcard.nl&siaNv=ct3',
            target: '_blank',
            align:1
        });
        portlet.addLine({
            text:'📊 Vendor',
            align:0
        });

        portlet.addLine({
            text: '📈 Vendor Bills Pending Approval',
            url: 'https://td3111354.app.netsuite.com/app/accounting/transactions/transactionlist.nl?Transaction_TYPE=VendAuth&whence=&siaT=1790750668432&siaWhc=%2Fapp%2Fcenter%2Fcard.nl&siaNv=ct3',
            target: '_blank',
            align:1
        });
        portlet.addLine({
            text:'📊 Quick Actions',
            align:0
        });
        portlet.addLine({
            text:'📄 Create Purchase Order',
            url:'https://td3111354.app.netsuite.com/app/accounting/transactions/purchord.nl?whence=&siaT=1790750194169&siaWhc=%2Fapp%2Faccounting%2Ftransactions%2Fvendorbillvariance%2Fpostvendorbillvariances.nl&siaNv=ct2',
            target: '_blank',
            align:1
        })

        
    }

    return {
        render: render
    };
});