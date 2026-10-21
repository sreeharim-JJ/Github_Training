/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/ui/serverWidget',
    'N/record',
    'N/search',
    'N/https',
    'N/runtime',
    'N/email',
    'N/url'
], function (ui, record, search, https, runtime, email, url) {

    var QUERY_REC = '';
    var FEE_REC = 'customrecord950';

    function onRequest(context) {
        try {
            var req = context.request;

            if (req.parameters.action === 'getfee') {
                var amount = getFee(req.parameters.language);
                var converted = convert(amount, req.parameters.currency);

                context.response.setHeader({
                    name: 'Content-Type',
                    value: 'application/json'
                });

                context.response.write({
                    output: JSON.stringify({
                        amount: amount,
                        converted: converted
                    })
                });

                return;
            }

            if (req.method === 'GET') {
                showForm(context);
            } else {
                saveRecord(context);
            }

        } catch (e) {
            log.error('ERROR', e);

            context.response.write({
                output: 'Error: ' + e.message
            });
        }
    }

    function showForm(context) {
        var form = ui.createForm({
            title: 'Tuition Fee Query'
        });

        form.clientScriptModulePath = './jj_cs_tuition_fee.js';

        addField(form, 'custpage_name', 'Name', ui.FieldType.TEXT);
        addField(form, 'custpage_country', 'Country', ui.FieldType.TEXT);
        addField(form, 'custpage_age', 'Age', ui.FieldType.INTEGER);
        addField(form, 'custpage_phone', 'Phone', ui.FieldType.PHONE);
        addField(form, 'custpage_email', 'Email Address', ui.FieldType.EMAIL);

        var language = form.addField({
            id: 'custpage_language',
            label: 'Language',
            type: ui.FieldType.SELECT,
            source: 'customlist_akshaya_languages'
        });
        language.isMandatory = true;

        var base = form.addField({
            id: 'custpage_base',
            label: 'Base Currency',
            type: ui.FieldType.TEXT
        });

        base.defaultValue = 'INR';

        base.updateDisplayType({
            displayType: ui.FieldDisplayType.INLINE
        });

        var currency = form.addField({
            id: 'custpage_currency',
            label: 'Transaction Currency',
            type: ui.FieldType.SELECT
        });

        currency.isMandatory = true;

        currency.addSelectOption({
            value: '',
            text: ''
        });

        [
            'INR', 'USD', 'EUR', 'GBP',
            'AUD', 'CAD', 'SGD', 'JPY'
        ].forEach(function (code) {
            currency.addSelectOption({
                value: code,
                text: code
            });
        });

        var amount = form.addField({
            id: 'custpage_amount',
            label: 'Amount',
            type: ui.FieldType.CURRENCY
        });

        amount.updateDisplayType({
            displayType: ui.FieldDisplayType.INLINE
        });

        var exchange = form.addField({
            id: 'custpage_exchange',
            label: 'Exchange Rate',
            type: ui.FieldType.CURRENCY
        });

        exchange.updateDisplayType({
            displayType: ui.FieldDisplayType.INLINE
        });

        var endpoint = form.addField({
            id: 'custpage_endpoint',
            label: 'Endpoint',
            type: ui.FieldType.LONGTEXT
        });

        endpoint.defaultValue = url.resolveScript({
            scriptId: runtime.getCurrentScript().id,
            deploymentId: runtime.getCurrentScript().deploymentId,
            returnExternalUrl: true
        });

        endpoint.updateDisplayType({
            displayType: ui.FieldDisplayType.HIDDEN
        });

        form.addSubmitButton({
            label: 'Submit'
        });

        context.response.writePage(form);
    }

    function addField(form, id, label, type) {
        var field = form.addField({
            id: id,
            label: label,
            type: type
        });

        field.isMandatory = true;
    }

    function getFee(languageId) {
        var result = search.create({
            type: FEE_REC,
            filters: [
                ['custrecord_afd_language', 'anyof', languageId],
                'AND',
                ['isinactive', 'is', 'F']
            ],
            columns: ['custrecord_afd_fee_amount']
        }).run().getRange({
            start: 0,
            end: 1
        });

        if (!result.length) {
            throw new Error('Course fee is not configured.');
        }

        return Number(
            result[0].getValue('custrecord_afd_fee_amount')
        );
    }

    function convert(amount, currency) {
        if (currency === 'INR') {
            return amount;
        }

        var apiKey = runtime.getCurrentScript().getParameter({
            name: 'custscript_currency_api_key'
        });

        if (!apiKey) {
            throw new Error('Currency API key is missing.');
        }

        var response = https.get({
            url:
                'https://api.freecurrencyapi.com/v1/latest' +
                '?apikey=' + encodeURIComponent(apiKey) +
                '&base_currency=INR' +
                '&currencies=' + encodeURIComponent(currency)
        });

        if (Number(response.code) !== 200) {
            throw new Error(
                'Currency API error: ' + response.code
            );
        }

        var data = JSON.parse(response.body);
        var rate = Number(data.data[currency]);

        if (!rate) {
            throw new Error('Exchange rate was not received.');
        }

        return Number((amount * rate).toFixed(2));
    }

    function saveRecord(context) {
        var p = context.request.parameters;

        // Recalculate on server
        var amount = getFee(p.custpage_language);
        var converted = convert(amount, p.custpage_currency);

        var rec = record.create({
            type: QUERY_REC
        });

        rec.setValue({
            fieldId: 'name',
            value: p.custpage_name
        });

        var values = {
            custrecord_atq_applicant_name: p.custpage_name,
            custrecord_atq_country: p.custpage_country,
            custrecord_atq_age: Number(p.custpage_age),
            custrecord_atq_phone: p.custpage_phone,
            custrecord_atq_email: p.custpage_email,
            custrecord_atq_language: p.custpage_language,
            custrecord_atq_base_currency: 'INR',
            custrecord_atq_transaction_currency: p.custpage_currency,
            custrecord_atq_fee_amount: amount,
            custrecord_atq_exchange_rate: converted
        };

        Object.keys(values).forEach(function (fieldId) {
            rec.setValue({
                fieldId: fieldId,
                value: values[fieldId]
            });
        });

        var recordId = rec.save();

        sendAdminEmail(recordId, p.custpage_name);

        context.response.write({
            output:
                '<h2>Query submitted successfully</h2>' +
                '<p>Record ID: ' + recordId + '</p>'
        });
    }

    function sendAdminEmail(recordId, applicantName) {
        var script = runtime.getCurrentScript();

        var author = Number(script.getParameter({
            name: 'custscript_email_author'
        }));

        var adminRole = script.getParameter({
            name: 'custscript_admin_role'
        });

        if (!author || !adminRole) {
            throw new Error(
                'Email Author or Admin Role parameter is missing.'
            );
        }

        var domain = url.resolveDomain({
            hostType: url.HostType.APPLICATION,
            accountId: runtime.accountId
        });

        var path = url.resolveRecord({
            recordType: QUERY_REC,
            recordId: recordId,
            isEditMode: false
        });

        var recordLink = 'https://' + domain + path;

        search.create({
            type: search.Type.EMPLOYEE,
            filters: [
                ['isinactive', 'is', 'F'],
                'AND',
                ['email', 'isnotempty', ''],
                'AND',
                ['role', 'anyof', adminRole]
            ],
            columns: [
                search.createColumn({
                    name: 'internalid',
                    summary: search.Summary.GROUP
                })
            ]
        }).run().each(function (result) {

            var employeeId = Number(result.getValue({
                name: 'internalid',
                summary: search.Summary.GROUP
            }));

            email.send({
                author: author,
                recipients: employeeId,
                subject: 'Tuition Fee Query Received for Training',
                body:
                    '<p>A tuition fee query was received from ' +
                    applicantName +
                    '.</p>' +
                    '<p>' + recordLink + '' +
                    'Open Tuition Fee Query Record</a></p>'
            });

            return true;
        });
    }

    return {
        onRequest: onRequest
    };
});