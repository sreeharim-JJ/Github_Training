/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define([
    'N/search',
    'N/ui/dialog'
], (
    search,
    dialog
) => {

    const fieldChanged = (context) => {
        try {
            if (
                context.sublistId !==
                'custpage_itemsublist'
            ) {
                return;
            }

            const currentRecord =
                context.currentRecord;

            if (
                context.fieldId ===
                'custpage_item'
            ) {
                const itemId =
                    currentRecord
                        .getCurrentSublistValue({
                            sublistId:
                                'custpage_itemsublist',
                            fieldId:
                                'custpage_item'
                        });

                if (!itemId) {
                    return;
                }

                const itemDetails =
                    search.lookupFields({
                        type: search.Type.ITEM,
                        id: itemId,
                        columns: [
                            'salesdescription',
                            'baseprice'
                        ]
                    });

                const description =
                    itemDetails.salesdescription ||
                    '';

                const price = Number(
                    itemDetails.baseprice
                );

                currentRecord
                    .setCurrentSublistValue({
                        sublistId:
                            'custpage_itemsublist',
                        fieldId:
                            'custpage_description',
                        value: description,
                        ignoreFieldChange: true
                    });

                currentRecord
                    .setCurrentSublistValue({
                        sublistId:
                            'custpage_itemsublist',
                        fieldId:
                            'custpage_price',
                        value: price,
                        ignoreFieldChange: true
                    });

                calculateAmount(currentRecord);
            }

            if (
                context.fieldId ===
                    'custpage_quantity' ||
                context.fieldId ===
                    'custpage_price'
            ) {
                calculateAmount(currentRecord);
            }

        } catch (error) {
            dialog.alert({
                title: 'Error',
                message: error.message
            });
        }
    };

    const calculateAmount = (
        currentRecord
    ) => {
        const quantity = Number(
            currentRecord
                .getCurrentSublistValue({
                    sublistId:
                        'custpage_itemsublist',
                    fieldId:
                        'custpage_quantity'
                })
        ) || 0;

        const price = Number(
            currentRecord
                .getCurrentSublistValue({
                    sublistId:
                        'custpage_itemsublist',
                    fieldId:
                        'custpage_price'
                })
        ) || 0;

        currentRecord
            .setCurrentSublistValue({
                sublistId:
                    'custpage_itemsublist',
                fieldId:
                    'custpage_amount',
                value: quantity * price,
                ignoreFieldChange: true
            });
    };

    const validateLine = (context) => {
        if (
            context.sublistId !==
            'custpage_itemsublist'
        ) {
            return true;
        }

        const currentRecord =
            context.currentRecord;

        const item =
            currentRecord
                .getCurrentSublistValue({
                    sublistId:
                        'custpage_itemsublist',
                    fieldId:
                        'custpage_item'
                });

        const quantity = Number(
            currentRecord
                .getCurrentSublistValue({
                    sublistId:
                        'custpage_itemsublist',
                    fieldId:
                        'custpage_quantity'
                })
        );

        const priceValue =
            currentRecord
                .getCurrentSublistValue({
                    sublistId:
                        'custpage_itemsublist',
                    fieldId:
                        'custpage_price'
                });

        const price = Number(priceValue);

        if (!item) {
            dialog.alert({
                title: 'Missing Item',
                message:
                    'Please choose an item.'
            });

            return false;
        }

        if (
            !quantity ||
            quantity <= 0
        ) {
            dialog.alert({
                title: 'Missing Quantity',
                message:
                    'Quantity is mandatory.'
            });

            return false;
        }

        if (
            priceValue === '' ||
            priceValue === null ||
            priceValue === undefined ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            dialog.alert({
                title: 'Missing Price',
                message:
                    'Price is mandatory.'
            });

            return false;
        }

        calculateAmount(currentRecord);

        return true;
    };

    const saveRecord = (context) => {
        const lineCount =
            context.currentRecord
                .getLineCount({
                    sublistId:
                        'custpage_itemsublist'
                });

        if (lineCount < 1) {
            dialog.alert({
                title: 'Missing Items',
                message:
                    'Please enter at least one item.'
            });

            return false;
        }

        return true;
    };

    return {
        fieldChanged,
        validateLine,
        saveRecord
    };
});