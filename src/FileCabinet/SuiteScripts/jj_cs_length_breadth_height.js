/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

/******************************************************************************
********
 * ABC Industries
 *
 * ${OTP0000}: ${jj_cs_length_breadth_height.js}
 *
 *
 ******************************************************************************
********
 *
 * Author: Jobin and Jismi IT Services
 *
 * Date Created : 28-September-2026
 *
 * Description : Create 3 custom fields “length", "breadth "and “height” in the item record. Add a field “container box” in the sublist line of the sales order.
 *               The value of the container box must be ‘length*breadth*height’. The amount must be ‘rate*container box’.
 *               Add the line only if the amount is equal to ‘rate*container box’.
 * 
 * REVISION HISTORY
 *
 * @version 2.1  ABC-5 : 28-September-2026 : Created the initial build by JJI0044
 *
 *
 *
 *
 ******************************************************************************
*********/

define(['N/search', 'N/ui/dialog'], function(search, dialog) {

    function postSourcing(context) {

        var currentRecord = context.currentRecord;

        if (
            context.sublistId === 'item' &&
            (context.fieldId === 'item' || context.fieldId === 'rate')
        ) {
            calculateContainerBox(currentRecord);
        }
    }

    function calculateContainerBox(currentRecord) {

        var itemId = currentRecord.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item'
        });

        if (!itemId) {
            return;
        }

        var itemDetails;

        try {
            itemDetails = search.lookupFields({
                type: search.Type.ITEM,
                id: itemId,
                columns: [
                    'custitem24',
                    'custitem25',
                    'custitem26'
                ]
            });
        } catch (error) {
            console.log('Item lookup error: ' + error.message);
            return;
        }

        var length = parseFloat(itemDetails.custitem24) || 0;
        var breadth = parseFloat(itemDetails.custitem25) || 0;
        var height = parseFloat(itemDetails.custitem26) || 0;

        var containerBox = length * breadth * height;

        var rate = parseFloat(
            currentRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate'
            })
        ) || 0;

        var calculatedAmount = rate * containerBox;

        currentRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol16',
            value: containerBox,
            ignoreFieldChange: true
        });

        currentRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'amount',
            value: calculatedAmount,
            ignoreFieldChange: true
        });

        console.log('Length: ' + length);
        console.log('Breadth: ' + breadth);
        console.log('Height: ' + height);
        console.log('Container Box: ' + containerBox);
        console.log('Rate: ' + rate);
        console.log('Calculated Amount: ' + calculatedAmount);
    }

    function validateLine(context) {

        var currentRecord = context.currentRecord;

        if (context.sublistId !== 'item') {
            return true;
        }

        calculateContainerBox(currentRecord);

        var rate = parseFloat(
            currentRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate'
            })
        ) || 0;

        var containerBox = parseFloat(
            currentRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol16'
            })
        ) || 0;

        var amount = parseFloat(
            currentRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'amount'
            })
        ) || 0;

        var expectedAmount = rate * containerBox;

        /*
         * Rounding is used to avoid decimal precision differences,
         * such as 100.0000001 versus 100.
         */
        var actualRounded = Math.round(amount * 100) / 100;
        var expectedRounded = Math.round(expectedAmount * 100) / 100;

        if (actualRounded !== expectedRounded) {

            dialog.alert({
                title: 'Invalid Amount',
                message:
                    'The item line cannot be added.' +
                    '\n\nContainer Box: ' + containerBox +
                    '\nRate: ' + rate +
                    '\nEntered Amount: ' + amount +
                    '\nExpected Amount: ' + expectedAmount
            });

            return false;
        }

        return true;
    }

    return {
        postSourcing: postSourcing,
        validateLine: validateLine
    };
});