/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

/******************************************************************************
********
 * ABC Industries
 *
 * ${OTP0000}: ${jj_rl_sales_order.js}
 *
 *
 ******************************************************************************
********
 *
 * Author: Jobin and Jismi IT Services
 *
 * Date Created : 24-September-2026
 *
 * Description : Create a sales order record
 *
 * REVISION HISTORY
 *
 * @version 2.1  ABC-5 : 24-September-2026 : Created the initial build by JJI0044
 *
 *
 *
 *
 ******************************************************************************
*********/


define(['N/record', 'N/log'],
    /**
 * @param{record} record
 */
    (record, log) => {
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

    try {

        log.debug("POST Triggered", JSON.stringify(requestBody));

        let salesOrder = record.create({
            type: record.Type.SALES_ORDER,
            isDynamic: true
        });

        salesOrder.setValue({
            fieldId: 'entity',
            value: requestBody.customername
        });

        salesOrder.selectNewLine({
            sublistId: 'item'
        });

        salesOrder.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            value: requestBody.itemname
        });


        salesOrder.commitLine({
            sublistId: 'item'
        });

        let salesOrderId = salesOrder.save();

        log.debug({
            title: 'Sales Order Created',
            details: salesOrderId
        });

        let result = {
            salesOrderId: salesOrderId
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

};

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