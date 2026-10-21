/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/render', 'N/search', 'N/url','N/file'],
    /**
 * @param{render} render
 * @param{search} search
 * @param{url} url
 */
    (render, search, url,file) => {
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
            let invoiceSearch = search.create({
                type: search.Type.INVOICE,
                filters: [
                    ['tranid', 'is', requestBody.DocumentNo]
                ],
                columns: ['internalid']
            });
            let results = invoiceSearch.run().getRange({
                start: 0,
                end: 1
            });
            if (results.length > 0){
                let invoiceId = results[0].getValue({
                    name: 'internalid'
                });
                let pdfFile = render.transaction({
                    entityId: Number(invoiceId),
                    printMode: render.PrintMode.PDF
                });
                pdfFile.name = requestBody.DocumentNo + '.pdf';
                pdfFile.folder = 6864;
                pdfFile.isOnline = true;
 
                let fileId = pdfFile.save();
                let fileObj = file.load({
                    id: fileId
                });
                log.debug({
                    title: 'fileObj.url',
                    details: fileObj.url
                });
                return{
                        recordName :requestBody.recordName,
                        documentNo:requestBody.DocumentNo,
                        url: 'https://td3111354.app.netsuite.com'+fileObj.url
                        }
 
            }
            else{
                return{
                        recordName :requestBody.recordName,
                        documentNo:requestBody.DocumentNo,
                        url:'no invoice found'
                        }
            }
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