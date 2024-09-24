// __tests__/script.test.js


// test parseRange function

const { parseRange } = require('../project/script'); // Adjust the path based on your file structure

describe('parseRange', () => {
    test('returns [0, 0] for "none"', () => {
        expect(parseRange('none')).toEqual([0, 0]);
    });

    test('returns correct range for valid input', () => {
        expect(parseRange('10-20')).toEqual([10, 20]);
    });

    test('returns [10, Infinity] for "10-+"', () => {
        expect(parseRange('10-+')).toEqual([10, Infinity]);
    });

    test('returns [0, 0] for invalid format', () => {
        expect(parseRange('invalid')).toEqual([0, 0]);
    });
});



// test printing emissions function

const { calculatePrintingEmissions } = require('../script'); // Adjust the path

describe('calculatePrintingEmissions', () => {
    const perPageFactor = 0.1; // Example factor for testing

    test('calculates correct emissions for 5-10 pages', () => {
        expect(calculatePrintingEmissions('5-10', perPageFactor)).toBeCloseTo(7.5 * perPageFactor * 52);
    });

    test('calculates correct emissions for 10-50 pages', () => {
        expect(calculatePrintingEmissions('10-50', perPageFactor)).toBeCloseTo(30 * perPageFactor * 52);
    });

    test('calculates correct emissions for 20 pages a day', () => {
        expect(calculatePrintingEmissions('20/day', perPageFactor)).toBeCloseTo(20 * perPageFactor * 365);
    });

    test('returns 0 for invalid printing input', () => {
        expect(calculatePrintingEmissions('invalid', perPageFactor)).toBe(0);
    });
});


