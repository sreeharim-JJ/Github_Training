/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
 
 
/******************************************************************************
********
 * ABC Industries
 *
 * ${OTP0000}: ${jj_rl_sales_order_get.js}
 *
 *
 ******************************************************************************
********
 *
 * Author: Jobin and Jismi IT Services
 *
 * Date Created : 24-September-2026
 *
 * Description : Return the details of a specified sales order. Return “Does not exist” if there is no sales order with the specified id.
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

    (record, log) => {

        const get = (requestParams) => {

            try {

                log.debug('GET Triggered', JSON.stringify(requestParams));

                let salesOrderData = record.load({
                    type: record.Type.SALES_ORDER,
                    id: requestParams.salesorderid,
                    isDynamic: true
                });

                let items = [];

                let lineCount = salesOrderData.getLineCount({
                    sublistId: 'item'
                });

                let transactionId = salesOrderData.getValue({
                    fieldId: 'tranid'
                });

                let customer = salesOrderData.getValue({
                    fieldId: 'entity'
                });

                let dateCreated = salesOrderData.getValue({
                    fieldId: 'trandate'
                });

                let orderStatus = salesOrderData.getValue({
                    fieldId: 'orderstatus'
                });

                let subsidiary = salesOrderData.getValue({
                    fieldId: 'subsidiary'
                });

                let memo = salesOrderData.getValue({
                    fieldId: 'memo'
                });

                let totalAmount = salesOrderData.getValue({
                    fieldId: 'total'
                });

                for (let i = 0; i < lineCount; i++) {

                    let item = salesOrderData.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });

                    let quantity = salesOrderData.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });

                    let amount = salesOrderData.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: i
                    });

                    items.push({
                        item: item,
                        quantity: quantity,
                        amount: amount
                    });

                    log.debug({
                        title: 'Items',
                        details: 'Item: ' + item +
                                 ' Quantity: ' + quantity +
                                 ' Amount: ' + amount
                    });
                }

                return {
                    transactionId: transactionId,
                    customer: customer,
                    dateCreated: dateCreated,
                    orderStatus: orderStatus,
                    subsidiary: subsidiary,
                    memo: memo,
                    totalAmount: totalAmount,
                    items: items
                };

            } catch (e) {

                log.error({
                    title: 'Error',
                    details: e
                });

                return 'Does not exist';
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
 