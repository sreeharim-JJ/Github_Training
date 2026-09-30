/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

/******************************************************************************
********
 * ABC Industries
 *
 * ${OTP0000}: ${jj_cs_itemtobe_added.js}
 *
 *
 ******************************************************************************
********
 *
 * Author: Jobin and Jismi IT Services
 *
 * Date Created : 28-September-2026
 *
 * Description : Allow the item to be added when creating a sales order if the amount is greater than 200. Otherwise give an alert. 
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

define(['N/ui/dialog'], function(dialog) {

    function validateLine(context) {

        var currentRecord = context.currentRecord;

        if (context.sublistId === 'item') {

            var amount = currentRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'amount'
            });

            if (amount <= 200) {

                dialog.alert({
                    title: 'Validation Error',
                    message: 'Amount should be greater than 200.'
                });

                return false;
            }
        }

        return true;
    }

    return {
        validateLine: validateLine
    };

});