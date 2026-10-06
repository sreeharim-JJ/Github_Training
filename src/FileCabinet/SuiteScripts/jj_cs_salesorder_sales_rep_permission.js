/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

/******************************************************************************
********
 * ABC Industries
 *
 * ${OTP0000}: ${jj_cs_salesorder_sales_order_permission.js}
 *
 *
 ******************************************************************************
********
 *
 * Author: Jobin and Jismi IT Services
 *
 * Date Created : 28-September-2026
 *
 * Description : Give a warning when a sales order is created for an amount less than 10000. 
 *               Create the sales order only if the sales rep allows it to create. 
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

define([], function() {

    function saveRecord(context) {

        var currentRecord = context.currentRecord;

        var totalAmount = parseFloat(
            currentRecord.getValue({
                fieldId: 'total'
            })
        ) || 0;

        console.log('Sales Order Total: ' + totalAmount);

        if (totalAmount < 10000) {

            var proceed = confirm(
                'Warning: Sales Order amount is less than 10,000.\n\n' +
                'Click OK to save the Sales Order.\n' +
                'Click Cancel to stop saving.'
            );

            if (!proceed) {
                return false;
            }
        }

        return true;
    }

    return {
        saveRecord: saveRecord
    };

});