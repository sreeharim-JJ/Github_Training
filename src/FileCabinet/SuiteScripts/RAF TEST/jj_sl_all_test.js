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
    'N/url',
    'N/log'
], (
    serverWidget,
    record,
    search,
    https,
    runtime,
    email,
    url,
    log
) => {

    const QUERY_RECORD = 'customrecord946';

    const FEE_RECORD = 'customrecord_fee_details';
    const FEE_COURSE_FIELD = 'custrecord_fee_course';
    const FEE_AMOUNT_FIELD = 'custrecord_fee_amount';

    const ADMIN_ROLE_ID = '3';
    const EMAIL_AUTHOR = 4379;

    const API_KEY_PARAMETER = 'custscript_freecurrency_api_key';

    function onRequest(context) {
        try {
            const request = context.request;

            if (
                request.method === 'GET' &&
                request.parameters.action === 'calculate'
            ) {
                return calculateFee(context);
            }

            if (request.method === 'GET') {
                return createForm(context);
            }

            saveRegistration(context);

        } catch (e) {
            log.error({
                title: 'Akshaya Tuition Fee Error',
                details: e
            });

            context.response.write({
                output:
                    '<h2>Operation Failed</h2>' +
                    '<p>' + escapeHtml(e.message) + '</p>'
            });
        }
    }

    function createForm(context) {
        const form = serverWidget.createForm({
            title: 'Akshaya Institute Tuition Fee Query'
        });

        form.clientScriptModulePath =
            './akshaya_tuition_client.js';

        form.addField({
            id: 'custpage_name',
            type: serverWidget.FieldType.TEXT,
            label: 'Name'
        }).isMandatory = true;

        form.addField({
            id: 'custpage_country',
            type: serverWidget.FieldType.TEXT,
            label: 'Country'
        }).isMandatory = true;

        form.addField({
            id: 'custpage_age',
            type: serverWidget.FieldType.INTEGER,
            label: 'Age'
        });

        form.addField({
            id: 'custpage_phone',
            type: serverWidget.FieldType.PHONE,
            label: 'Phone Number'
        });

        form.addField({
            id: 'custpage_email',
            type: serverWidget.FieldType.EMAIL,
            label: 'Email Address'
        }).isMandatory = true;

        addLanguageField(form);
        addCourseField(form);

        form.addField({
            id: 'custpage_address',
            type: serverWidget.FieldType.TEXTAREA,
            label: 'Address'
        });

        const baseCurrency = form.addField({
            id: 'custpage_basecurrency',
            type: serverWidget.FieldType.TEXT,
            label: 'Base Currency'
        });

        baseCurrency.defaultValue = 'INR';

        baseCurrency.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        addTransactionCurrencyField(form);

        const amount = form.addField({
            id: 'custpage_amount',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Fee Amount INR'
        });

        amount.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        const exchangeRate = form.addField({
            id: 'custpage_exchangerate',
            type: serverWidget.FieldType.FLOAT,
            label: 'Exchange Rate'
        });

        exchangeRate.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        const convertedAmount = form.addField({
            id: 'custpage_convertedamount',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Transaction Currency Amount'
        });

        convertedAmount.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        form.addSubmitButton({
            label: 'Submit Tuition Fee Query'
        });

        context.response.writePage({
            pageObject: form
        });
    }

    function addLanguageField(form) {
        const language = form.addField({
            id: 'custpage_language',
            type: serverWidget.FieldType.SELECT,
            label: 'Language'
        });

        language.isMandatory = true;

        language.addSelectOption({
            value: '',
            text: ''
        });

        [
            'English',
            'Malayalam',
            'Hindi',
            'Tamil'
        ].forEach(value => {
            language.addSelectOption({
                value: value,
                text: value
            });
        });
    }

    function addCourseField(form) {
        const course = form.addField({
            id: 'custpage_course',
            type: serverWidget.FieldType.SELECT,
            label: 'Course'
        });

        course.isMandatory = true;

        course.addSelectOption({
            value: '',
            text: ''
        });

        search.create({
            type: FEE_RECORD,
            filters: [
                ['isinactive', 'is', 'F']
            ],
            columns: [
                search.createColumn({
                    name: FEE_COURSE_FIELD,
                    sort: search.Sort.ASC
                })
            ]
        }).run().each(result => {
            const courseName =
                result.getText({
                    name: FEE_COURSE_FIELD
                }) ||
                result.getValue({
                    name: FEE_COURSE_FIELD
                });

            if (courseName) {
                course.addSelectOption({
                    value: String(result.id),
                    text: String(courseName)
                });
            }

            return true;
        });
    }

    function addTransactionCurrencyField(form) {
        const currency = form.addField({
            id: 'custpage_transactioncurrency',
            type: serverWidget.FieldType.SELECT,
            label: 'Transaction Currency'
        });

        currency.isMandatory = true;

        currency.addSelectOption({
            value: '',
            text: ''
        });

        [
            'INR',
            'USD',
            'EUR',
            'AED',
            'GBP'
        ].forEach(value => {
            currency.addSelectOption({
                value: value,
                text: value
            });
        });
    }

    function calculateFee(context) {
        const courseId =
            context.request.parameters.courseid;

        const transactionCurrency =
            context.request.parameters.currency;

        const courseDetails =
            getCourseDetails(courseId);

        let exchangeRate = 1;

        if (transactionCurrency !== 'INR') {
            exchangeRate =
                getExchangeRate(transactionCurrency);
        }

        const convertedAmount = roundAmount(
            courseDetails.feeAmount * exchangeRate
        );

        context.response.setHeader({
            name: 'Content-Type',
            value: 'application/json'
        });

        context.response.write({
            output: JSON.stringify({
                success: true,
                courseName: courseDetails.courseName,
                feeAmount: courseDetails.feeAmount,
                baseCurrency: 'INR',
                transactionCurrency: transactionCurrency,
                exchangeRate: exchangeRate,
                convertedAmount: convertedAmount
            })
        });
    }

    function getCourseDetails(courseId) {
        if (!courseId) {
            throw new Error('Please select a course.');
        }

        const feeRecord = record.load({
            type: FEE_RECORD,
            id: courseId,
            isDynamic: false
        });

        const courseName =
            feeRecord.getText({
                fieldId: FEE_COURSE_FIELD
            }) ||
            feeRecord.getValue({
                fieldId: FEE_COURSE_FIELD
            });

        const feeAmount = Number(
            feeRecord.getValue({
                fieldId: FEE_AMOUNT_FIELD
            })
        );

        if (!feeAmount || feeAmount <= 0) {
            throw new Error(
                'A valid INR fee is not configured for this course.'
            );
        }

        return {
            courseName: String(courseName),
            feeAmount: feeAmount
        };
    }

    function getExchangeRate(transactionCurrency) {
        if (!transactionCurrency) {
            throw new Error(
                'Please select a transaction currency.'
            );
        }

        if (transactionCurrency === 'INR') {
            return 1;
        }

        const apiKey =
            runtime.getCurrentScript().getParameter({
                name: API_KEY_PARAMETER
            });

        if (!apiKey) {
            throw new Error(
                'Freecurrencyapi API key parameter is empty.'
            );
        }

        const apiUrl =
            'https://api.freecurrencyapi.com/v1/latest' +
            '?base_currency=INR' +
            '&currencies=' +
            encodeURIComponent(transactionCurrency);

        const response = https.get({
            url: apiUrl,
            headers: {
                apikey: apiKey,
                Accept: 'application/json'
            }
        });

        if (Number(response.code) !== 200) {
            throw new Error(
                'Currency API request failed. HTTP status: ' +
                response.code +
                '. Response: ' +
                response.body
            );
        }

        let responseData;

        try {
            responseData = JSON.parse(response.body);
        } catch (e) {
            throw new Error(
                'Currency API returned invalid JSON.'
            );
        }

        const exchangeRate = Number(
            responseData &&
            responseData.data &&
            responseData.data[transactionCurrency]
        );

        if (!exchangeRate || exchangeRate <= 0) {
            throw new Error(
                'Exchange rate was not returned for ' +
                transactionCurrency +
                '.'
            );
        }

        return exchangeRate;
    }

    function saveRegistration(context) {
        const p = context.request.parameters;

        validateSubmission(p);

        const courseDetails =
            getCourseDetails(p.custpage_course);

        const transactionCurrency =
            p.custpage_transactioncurrency;

        const exchangeRate =
            transactionCurrency === 'INR'
                ? 1
                : getExchangeRate(transactionCurrency);

        const convertedAmount = roundAmount(
            courseDetails.feeAmount * exchangeRate
        );

        const registration = record.create({
            type: QUERY_RECORD,
            isDynamic: true
        });

        setValue(
            registration,
            'name',
            p.custpage_name
        );

        setValue(
            registration,
            'custrecord1442',
            p.custpage_name
        );

        setValue(
            registration,
            'custrecord1443',
            p.custpage_country
        );

        if (p.custpage_age) {
            setValue(
                registration,
                'custrecord1444',
                Number(p.custpage_age)
            );
        }

        setValue(
            registration,
            'custrecord1445',
            p.custpage_phone
        );

        setValue(
            registration,
            'custrecord1446',
            p.custpage_email
        );

        setText(
            registration,
            'custrecord1447',
            p.custpage_language
        );

        setText(
            registration,
            'custrecord1455',
            courseDetails.courseName
        );

        setText(
            registration,
            'custrecord1448',
            'INR'
        );

        setText(
            registration,
            'custrecord1449',
            transactionCurrency
        );

        setValue(
            registration,
            'custrecord1450',
            courseDetails.feeAmount
        );

        setValue(
            registration,
            'custrecord1451',
            exchangeRate
        );

        setValue(
            registration,
            'custrecord1452',
            convertedAmount
        );

        setValue(
            registration,
            'custrecord1453',
            p.custpage_address
        );

        const registrationId = registration.save({
            enableSourcing: true,
            ignoreMandatoryFields: false
        });

        const recordLink =
            createRecordLink(registrationId);

        const recipients =
            getAdministratorEmployees();

        if (!recipients.length) {
            throw new Error(
                'Registration was created, but no active Administrator employees with email addresses were found.'
            );
        }

        sendNotification({
            recipients: recipients,
            registrationId: registrationId,
            recordLink: recordLink,
            applicantName: p.custpage_name,
            emailAddress: p.custpage_email,
            courseName: courseDetails.courseName,
            feeAmount: courseDetails.feeAmount,
            transactionCurrency: transactionCurrency,
            exchangeRate: exchangeRate,
            convertedAmount: convertedAmount
        });

        log.audit({
            title: 'Tuition Fee Query Created',
            details: {
                registrationId: registrationId,
                recipients: recipients,
                recordLink: recordLink
            }
        });

        context.response.write({
            output:
                '<h2>Tuition Fee Query Submitted</h2>' +
                '<p><b>Registration ID:</b> ' +
                registrationId +
                '</p>' +
                '<p><b>Name:</b> ' +
                escapeHtml(p.custpage_name) +
                '</p>' +
                '<p><b>Course:</b> ' +
                escapeHtml(courseDetails.courseName) +
                '</p>' +
                '<p><b>Fee Amount:</b> INR ' +
                courseDetails.feeAmount.toFixed(2) +
                '</p>' +
                '<p><b>Transaction Currency:</b> ' +
                escapeHtml(transactionCurrency) +
                '</p>' +
                '<p><b>Exchange Rate:</b> ' +
                exchangeRate +
                '</p>' +
                '<p><b>Converted Amount:</b> ' +
                escapeHtml(transactionCurrency) +
                ' ' +
                convertedAmount.toFixed(2) +
                '</p>' +
                '<p>Administrator notification sent successfully.</p>'
        });
    }

    function validateSubmission(p) {
        if (!p.custpage_name) {
            throw new Error('Name is required.');
        }

        if (!p.custpage_country) {
            throw new Error('Country is required.');
        }

        if (!p.custpage_email) {
            throw new Error('Email Address is required.');
        }

        if (!p.custpage_language) {
            throw new Error('Language is required.');
        }

        if (!p.custpage_course) {
            throw new Error('Course is required.');
        }

        if (!p.custpage_transactioncurrency) {
            throw new Error(
                'Transaction Currency is required.'
            );
        }
    }

    function getAdministratorEmployees() {
        const employeeIds = {};
        const recipients = [];

        search.create({
            type: search.Type.EMPLOYEE,
            filters: [
                ['isinactive', 'is', 'F'],
                'AND',
                ['email', 'isnotempty', ''],
                'AND',
                ['role', 'anyof', ADMIN_ROLE_ID]
            ],
            columns: [
                search.createColumn({
                    name: 'internalid'
                })
            ]
        }).run().each(result => {
            const employeeId = Number(
                result.getValue({
                    name: 'internalid'
                })
            );

            if (
                employeeId &&
                !employeeIds[employeeId]
            ) {
                employeeIds[employeeId] = true;
                recipients.push(employeeId);
            }

            return true;
        });

        return recipients;
    }

    function createRecordLink(registrationId) {
        const relativeUrl = url.resolveRecord({
            recordType: QUERY_RECORD,
            recordId: registrationId,
            isEditMode: false
        });

        const domain = url.resolveDomain({
            hostType: url.HostType.APPLICATION
        });

        return 'https://' + domain + relativeUrl;
    }

    function sendNotification(data) {
        const safeName =
            escapeHtml(data.applicantName);

        const safeEmail =
            escapeHtml(data.emailAddress);

        const safeCourse =
            escapeHtml(data.courseName);

        const safeCurrency =
            escapeHtml(data.transactionCurrency);

        const body =
            '<h2>Tuition Fee Query Received</h2>' +
            '<p>A new tuition fee query was submitted.</p>' +
            '<p><b>Record ID:</b> ' +
            data.registrationId +
            '</p>' +
            '<p><b>Applicant:</b> ' +
            safeName +
            '</p>' +
            '<p><b>Email:</b> ' +
            safeEmail +
            '</p>' +
            '<p><b>Course:</b> ' +
            safeCourse +
            '</p>' +
            '<p><b>Base Currency:</b> INR</p>' +
            '<p><b>Fee Amount:</b> INR ' +
            data.feeAmount.toFixed(2) +
            '</p>' +
            '<p><b>Transaction Currency:</b> ' +
            safeCurrency +
            '</p>' +
            '<p><b>Exchange Rate:</b> ' +
            data.exchangeRate +
            '</p>' +
            '<p><b>Converted Amount:</b> ' +
            safeCurrency +
            ' ' +
            data.convertedAmount.toFixed(2) +
            '</p>' +
            '<p>' +
            data.recordLink +
            'View Tuition Fee Query Record</a></p>';

        email.send({
            author: EMAIL_AUTHOR,
            recipients: data.recipients,
            subject:
                'Tuition Fee Query Received for Training',
            body: body,
            relatedRecords: {
                customRecord: {
                    id: data.registrationId,
                    recordType: QUERY_RECORD
                }
            }
        });
    }

    function setValue(rec, fieldId, value) {
        if (
            value !== '' &&
            value !== null &&
            value !== undefined
        ) {
            rec.setValue({
                fieldId: fieldId,
                value: value
            });
        }
    }

    function setText(rec, fieldId, text) {
        if (
            text !== '' &&
            text !== null &&
            text !== undefined
        ) {
            rec.setText({
                fieldId: fieldId,
                text: text
            });
        }
    }

    function roundAmount(value) {
        return Math.round(
            Number(value) * 100
        ) / 100;
    }

    function escapeHtml(value) {
        const text =
            value === null ||
            value === undefined
                ? ''
                : String(value);

        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    return {
        onRequest: onRequest
    };
});