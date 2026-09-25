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

define(['N/record', 'N/log'],

    (record, log) => {

        const get = (requestParams) => {
        try {

            log.debug('GET Triggered', JSON.stringify(requestParams));

            let salesOrder = record.load({
                type: record.Type.SALES_ORDER,
                id: requestParams.salesorderid
            });

            let items = [];
            let lineCount = salesOrder.getLineCount({
                sublistId: 'item'
            });

            for (let i = 0; i < lineCount; i++) {

                items.push({
                    itemName: salesOrder.getSublistText({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    }),
                    quantity: salesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    }),
                    rate: salesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: i
                    }),
                    amount: salesOrder.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: i
                    })
                });
            }

            let response = {
                salesOrderId: salesOrder.id,
                transactionNumber: salesOrder.getValue('tranid'),
                customer: salesOrder.getText('entity'),
                itemCount: lineCount,
                items: items
            };

            if (lineCount > 2) {
                response.message = 'Sales order contains more than 2 items';
            }

            log.debug('Response', JSON.stringify(response));

            return response;

        } catch (e) {

            log.error('Error', e);

            if (e.name === 'RCRD_DSNT_EXIST') {
                return 'Does not exist';
            }

            return {
                success: false,
                error: e.message
            };
        }
    };

    return {
        get: get
    };



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