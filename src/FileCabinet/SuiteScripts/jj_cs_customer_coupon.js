/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

/******************************************************************************
********
 * ABC Industries
 *
 * ${OTP0000}: ${jj_cs_customer_coupon.js}
 *
 *
 ******************************************************************************
********
 *
 * Author: Jobin and Jismi IT Services
 *
 * Date Created : 25-September-2026
 *
 * Description : Create a custom checkbox “Apply Coupon” in the customer record. Also create another custom textbox “Coupon Code”.  
if ‘Apply Coupon’ is checked, Enable ‘Coupon Code’  
if ‘Apply Coupon’ is unchecked, disable ‘Coupon Code’ and erase its contents.  
You must enter a Coupon Code of length 5 when Apply Coupon is checked. If Apply Coupon is checked and the length of the Coupon Code is not 5, display an alert message regarding the length restriction and do not submit the form.
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

define(['N/ui/dialog'],
/**
 * @param{dialog} dialog
 */
function(dialog) {
   
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    const pageInit = (scriptContext) => {

        const currentRecord = scriptContext.currentRecord;

        const applyCoupon = currentRecord.getValue({
            fieldId: 'custentity28'
        });

        const couponField = currentRecord.getField({
            fieldId: 'custentity29'
        });

        couponField.isDisabled = !applyCoupon;

        console.log('Page Init');
        console.log('Apply Coupon:', applyCoupon);
    };

    const fieldChanged = (scriptContext) => {

        const currentRecord = scriptContext.currentRecord;

        if (scriptContext.fieldId === 'custentity28') {

            const applyCoupon = currentRecord.getValue({
                fieldId: 'custentity28'
            });

            console.log('Field Changed');
            console.log('Apply Coupon:', applyCoupon);

            const couponField = currentRecord.getField({
                fieldId: 'custentity29'
            });

            if (applyCoupon) {

                couponField.isDisabled = false;
                console.log('Coupon Field Enabled');

            } else {

                currentRecord.setValue({
                    fieldId: 'custentity29',
                    value: ''
                });

                couponField.isDisabled = true;

                console.log('Coupon Field Disabled');
                console.log('Coupon Code Cleared');
            }
        }
    };

 const saveRecord = (scriptContext) => {

    const applyCoupon = scriptContext.currentRecord.getValue({fieldId:'custentity28'});
        const couponCode = scriptContext.currentRecord.getValue({fieldId:'custentity29'});
        if (applyCoupon && couponCode.length !== 5){
            dialog.alert({
            title: 'Invalid Coupon Code',
            message: 'Coupon Code must be exactly 5 characters long.'
            });
            return false;
        }
        return true
    }
    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    };

});