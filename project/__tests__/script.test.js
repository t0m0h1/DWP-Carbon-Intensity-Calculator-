// __tests__/script.test.js


// test parseRange function

const { parseRange } = require('../script'); // Adjust the path based on your file structure

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



// add device and remove device functions
describe('addDevice', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="devicesContainer"></div>
        `;
        deviceCount = 1; // Reset deviceCount for each test
    });

    test('should add a new device element to the devices container', () => {
        addDevice();
        const devices = document.querySelectorAll('.device');
        expect(devices.length).toBe(1); // One device should be added
        expect(devices[0].querySelector('select')).toBeTruthy(); // Check if select element is present
        expect(devices[0].querySelector('input[type="number"]')).toBeTruthy(); // Check if number input is present
    });

    test('should increment deviceCount after adding a new device', () => {
        addDevice();
        addDevice();
        expect(deviceCount).toBe(3); // deviceCount starts at 1 and increments with each call
    });
});


describe('removeDevice', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="devicesContainer">
                <div class="device">
                    <button class="remove">Remove</button>
                </div>
                <div class="device">
                    <button class="remove">Remove</button>
                </div>
            </div>
        `;
    });

    test('should remove a device element from the devices container', () => {
        const removeButton = document.querySelector('.remove');
        removeDevice(removeButton);
        const devices = document.querySelectorAll('.device');
        expect(devices.length).toBe(1); // One device should be removed
    });
});




describe('fetchFactors', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('should fetch factors and return the response data', async () => {
        const mockData = { deviceFactors: {} };
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        const factors = await fetchFactors();
        expect(factors).toEqual(mockData);
        expect(fetch).toHaveBeenCalledWith('factors.json');
    });

    test('should throw an error if fetch fails', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
        });

        await expect(fetchFactors()).rejects.toThrow('Network response was not ok');
    });

    test('should throw an error if there is a network issue', async () => {
        fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

        await expect(fetchFactors()).rejects.toThrow('Failed to fetch');
    });
});



// test calculateCarbonFootprint function - most important function
describe('calculateCarbonFootprint', () => {
    let event;

    beforeEach(() => {
        // Mock the DOM
        document.body.innerHTML = `
            <input id="emailCount" value="10-20" />
            <input id="emailAttachmentCount" value="5-10" />
            <input id="teamsMessages" value="15" />
            <input id="teamsCallTime" value="30" />
            <input id="transportMode" value="car" />
            <input id="transportDistance" value="50" />
            <input id="printing" value="5-10" />
            <input id="wfhDays" value="3" />
            <input id="officeDays" value="2" />
            <input id="commuteType" value="bus" />
            <input id="commuteDistance" value="10" />
            <select name="deviceType[]"><option value="Laptop">Laptop</option></select>
            <input name="deviceUsage[]" value="1" />
            <div id="deviceUsage"></div>
            <div id="emailUsage"></div>
            <div id="teamsUsage"></div>
            <div id="transportation"></div>
            <div id="printing"></div>
            <div id="workingPatterns"></div>
            <div id="personaResult"></div>
        `;

        // Mock event
        event = { preventDefault: jest.fn() };

        // Mock fetchFactors to return predefined factors
        jest.spyOn(global, 'fetchFactors').mockResolvedValue({
            deviceFactors: {
                Laptop: { embodied: 50, usagePerHour: 0.2 },
            },
            emailFactors: {
                email: 0.1,
                attachmentEmail: 0.2,
            },
            teamsFactors: {
                messages: 0.05,
                calls: 0.1,
            },
            transportFactors: {
                car: 0.3,
                bus: 0.2,
            },
            printingFactors: {
                perPage: 0.01,
            },
            workingPatternsFactors: {
                office: 2,
                home: 1,
            },
            dataStorageFactors: {
                emailClearedMonthly: 0.1,
                oneDriveClearedMonthly: 0.15,
            },
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should calculate the correct total carbon footprint and update the DOM', async () => {
        await calculateCarbonFootprint(event);

        expect(document.getElementById('deviceUsage').innerText).toBe('Device Usage: 66.40 kg CO2e');
        expect(document.getElementById('emailUsage').innerText).toBe('Email Usage: 39.00 kg CO2e');
        expect(document.getElementById('teamsUsage').innerText).toBe('Teams Usage: 22.80 kg CO2e');
        expect(document.getElementById('transportation').innerText).toBe('Transportation: 780.00 kg CO2e');
        expect(document.getElementById('personaResult').innerText).toBe('Very High Carbon Footprint');
    });
});
