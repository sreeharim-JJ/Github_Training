/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/search', 'N/email'], (search, email) => {

    const execute = () => {

        try {

            let body = 'Open Inventory Details\n\n';
            let inventoryCount = 0;

            const inventorySearch = search.create({
                type: 'item',
                filters: [
    
                    ],
                columns: [
                    'itemid',
                    'reorderpoint',
                    'quantityavailable'
                ]
            });

            inventorySearch.run().each(result => {

                let item = result.getText('itemid');
                const reorder = result.getValue('reorderpoint');
                const quantity = result.getValue('quantityavailable');
                log.debug({
title: 'Item',
details:
'quantity = ' + quantity +
', reorderpoint = ' + reorder
});
inventoryCount++;
                body +=
                    'Item: ' + item + '\n' +
                    '--Reorder Point ' + reorder +','+'--Quantity ' + quantity;
                    

                return true;
            });

            log.debug({
                title: 'Inventory Count',
                details: body
            });

            if (reorder > quantity) {

                email.send({
                    author: -5, 
                    recipients: -5, 
                    subject: 'Quantity Less Than ReorderPoint',
                    body: body
                });

                log.audit({
                    title: 'Email Sent',
                    details: 'Item Report sent to Administrator'
                });

            } else {

                log.debug({
                    title: 'No Item Detail',
                    details: 'No records found'
                });
            }

        } catch (e) {

            log.error({
                title: 'Script Error',
                details: e
            });
        }
    };

    return {
        execute: execute
    };
});