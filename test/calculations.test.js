const expect = require('chai').expect;
const calculations = require('../calculations');

const cashInSettings = {
    "percents": 0.03,
    "max": {
        "amount": 5
    }
};

const cashOutSettingsLegal = {
    "percents": 0.3,
    "min": {
        "amount": 0.5
    }
};

const cashOutSettingsNatural = {
    "percents": 0.3,
    "week_limit": {
        "amount": 1000
    }
};

const mockTransactions = [
    { "date": "2016-01-05", "user_id": 1, "operation": { "amount": 200.00 } },
    { "date": "2016-01-06", "user_id": 2, "operation": { "amount": 300.00 } },
    { "date": "2016-01-06", "user_id": 1, "operation": { "amount": 30000 } },
    { "date": "2016-01-07", "user_id": 1, "operation": { "amount": 1000.00 } },
    { "date": "2016-01-07", "user_id": 1, "operation": { "amount": 100.00 } },
    { "date": "2016-01-10", "user_id": 1, "operation": { "amount": 100.00 } },
    { "date": "2016-01-10", "user_id": 2, "operation": { "amount": 1000000.00 } },
    { "date": "2016-01-10", "user_id": 3, "operation": { "amount": 1000.00 } },
    { "date": "2016-02-15", "user_id": 1, "operation": { "amount": 300.00 } },
    { "date": "2016-02-16", "user_id": 1, "operation": { "amount": 50.00 } },
    { "date": "2016-02-17", "user_id": 1, "operation": { "amount": 20.28 } },
    { "date": "2016-02-18", "user_id": 1, "operation": { "amount": 638.29 } }
]

userCashOuts = {};
const cashInExpectations = [0.06, 0.09, 5.00, 0.30, 0.03, 0.03, 5.00, 0.30, 0.09, 0.02, 0.01, 0.20];
const cashOutExpectationsLegal = [0.60, 0.90, 90.00, 3.00, 0.50, 0.50, 3000.00, 3.00, 0.90, 0.50, 0.50, 1.92];
const cashOutExpectationsNatural = [0.00, 0.00, 87.60, 3.00, 0.30, 0.30, 2997.90, 0.00, 0.00, 0.00, 0.00, 0.03];
//const totalWeekCashOutExpectationsNaturalAtTransaction = [200, 300, 30200, 31200, 31300, 31400, 1000300, 1000, 300, 350, 370.28, 1008.57];

describe('Calculations test', () => {
    describe('cash in test', () => {
        for (let i = 0; i < mockTransactions.length; i++) {
            it('should return ' + cashInExpectations[i], () => {
                const result = calculations.feeForCashIn(mockTransactions[i], cashInSettings);
                expect(result).to.equal(cashInExpectations[i]);
            })
        }
    });
    describe('cash out test for legal', () => {
        for (let i = 0; i < mockTransactions.length; i++) {
            it('should return ' + cashOutExpectationsLegal[i], () => {
                const result = calculations.feeForCashOutLegal(mockTransactions[i], cashOutSettingsLegal);
                expect(result).to.equal(cashOutExpectationsLegal[i]);
            })
        }
    });
    describe('cash out test for natural', () => {
        for (let i = 0; i < mockTransactions.length; i++) {
            it('should return ' + cashOutExpectationsNatural[i], () => {
                const result = calculations.feeForCashOutNatural(mockTransactions[i], cashOutSettingsNatural, userCashOuts);
                expect(result[1]).to.equal(cashOutExpectationsNatural[i]);
            })
        }
    });

});