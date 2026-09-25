/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

/******************************************************************************
********
 * ABC Industries
 *
 * ${OTP0000}: ${jj_rl_employee_updation.js}
 *
 *
 ******************************************************************************
********
 *
 * Author: Jobin and Jismi IT Services
 *
 * Date Created : 25-September-2026
 *
 * Description : Update the Employee, memo and location fields of any purchase order from an external application.
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


define(['N/record','N/log'],
    /**
 * @param{record} record
 */
    (record,log) => {
        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const get = (requestParams) => {

        }

        /**
         * Defines the function that is executed when a PUT request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body are passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const put = (requestBody) => {
            try{
            log.debug("PUT REQUEST Triggered", JSON.stringify(requestBody));
            let purchaseOrderId = record.submitFields({
                type:record.Type.PURCHASE_ORDER,
                id:requestBody.purchaseorderid,
                values:{
                    employee:requestBody.employee,
                    memo:"updated purchase order through RESTlet script",
                    location:requestBody.location
                }
            });
             log.debug({
            title: 'Customer Record Created',
            details: purchaseOrderId
        });

        let result = {
            purchaseorderid: purchaseOrderId,
            "message":"updated successfully"
        };

        log.debug({
            title: 'Result',
            details: JSON.stringify(result)
        });

        return result;
    
    } catch (e) {

        log.error({
            title: 'Error Name',
            details: e.name
        });

        log.error({
            title: 'Error Message',
            details: e.message
        });

        log.error({
            title: 'Error Stack',
            details: e.stack
        });

        return {
            success: false,
            error: e.message
        };
    }
}

        /**
         * Defines the function that is executed when a POST request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const post = (requestBody) => {

        }

        /**
         * Defines the function that is executed when a DELETE request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters are passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const doDelete = (requestParams) => {

        }

        return {get, put, post, delete: doDelete}

    });