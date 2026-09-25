/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

/******************************************************************************
********
 * ABC Industries
 *
 * ${OTP0000}: ${jj_cs_sales_order_checkbox.js}
 *
 *
 ******************************************************************************
********
 *
 * Author: Jobin and Jismi IT Services
 *
 * Date Created : 25-September-2026
 *
 * Description : Create a custom checkbox and textbox in the sales order record. When the value of the checkbox is changed, from false to true, set the value of the custom textbox as “passed”. When the value of the checkbox is changed from true to false, set the value of the textbox as “failed”.  
 * 
 * REVISION HISTORY
 *
 * @version 2.1  ABC-5 : 25-September-2026 : Created the initial build by JJI0044
 *
 *
 *
 *
 ******************************************************************************
*********/

define(['N/ui/dialog'], function(dialog) {

    function fieldChanged(scriptContext) {

        const currentRecord = scriptContext.currentRecord;

        if (scriptContext.fieldId === 'custbody19') {

            const checkboxValue = currentRecord.getValue({
                fieldId: 'custbody19'
            });

            console.log('Checkbox Value:', checkboxValue);

            if (checkboxValue) {

                currentRecord.setValue({
                    fieldId: 'custbody20',
                    value: 'passed'
                });

                console.log('Textbox set to passed');

            } else {

                currentRecord.setValue({
                    fieldId: 'custbody20',
                    value: 'failed'
                });

                console.log('Textbox set to failed');
            }
        }
    }

    return {
        fieldChanged: fieldChanged
    };

});