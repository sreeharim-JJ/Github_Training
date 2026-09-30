/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/search'], function(search) {

    function validateLine(context) {

        var currentRecord = context.currentRecord;

        if (context.sublistId !== 'item') {
            return true;
        }

        var itemId = currentRecord.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item'
        });

        var qty = parseFloat(
            currentRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity'
            })
        ) || 0;

        if (!itemId) {
            return true;
        }

        var itemFields = search.lookupFields({
            type: search.Type.ITEM,
            id: itemId,
            columns: ['itemid', 'custitem27']
        });

        var itemName = itemFields.itemid || 'Item';
        var minQty = parseFloat(itemFields.custitem27) || 0;

        if (minQty <= 0) {
            return true;
        }

        if (qty < minQty) {

            alert(
                'Item: ' + itemName +
                '\nMinimum Order Quantity Required: ' + minQty +
                '\nEntered Quantity: ' + qty
            );

            return false;
        }

        return true;
    }

    return {
        validateLine: validateLine
    };

});