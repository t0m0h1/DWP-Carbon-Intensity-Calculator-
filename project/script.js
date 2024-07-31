// device data points are in kg CO2e
// transport factors are in kg CO2e per km converted to miles





// Fetch carbon factors
async function fetchFactors() {
    try {
        const response = await fetch('factors.json');
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch factors:', error);
        alert('Failed to fetch carbon factors. Please try again later.');
        throw error;
    }
}

// Manipulate the DOM to add or remove devices
let deviceCount = 1;

function addDevice() {
    const container = document.getElementById('devicesContainer');
    const newDevice = document.createElement('div');
    newDevice.className = 'device';
    newDevice.innerHTML = `
        <label for="deviceType${deviceCount}">Device Type:</label>
        <select id="deviceType${deviceCount}" name="deviceType[]" aria-label="Select Device Type" required>
            <option value="Desktop">Desktop</option>
            <option value="Laptop">Laptop</option>
            <option value="Smartphone">Smartphone</option>
        </select>
        <label for="deviceUsage${deviceCount}">Length of Use (years):</label>
        <input type="number" id="deviceUsage${deviceCount}" name="deviceUsage[]" min="1" step="1" aria-label="Enter Length of Use in Years" required>
        <button type="button" class="remove" onclick="removeDevice(this)">Remove</button>
    `;
    container.appendChild(newDevice);
    deviceCount++;
}

function removeDevice(button) {
    const container = document.getElementById('devicesContainer');
    container.removeChild(button.parentElement);
}

// Calculate the carbon footprint
async function calculateCarbonFootprint(event) {
    event.preventDefault(); // Prevent page refresh

    let factors;
    try {
        factors = await fetchFactors();
    } catch {
        return; // Exit if fetching factors fails
    }

    // Get values from the inputs
    const emailCount = parseFloat(document.getElementById('emailCount').value) || 0;
    const emailAttachmentCount = parseFloat(document.getElementById('emailAttachmentCount').value) || 0;
    const teamsMessages = parseFloat(document.getElementById('teamsMessages').value) || 0;
    const teamsCallTime = parseFloat(document.getElementById('teamsCallTime').value) || 0;
    const transportMode = document.getElementById('transportMode').value;
    const transportDistanceMiles = parseFloat(document.getElementById('transportDistance').value) || 0;
    const laptopUsageHours = parseFloat(document.getElementById('laptopUsageHours').value) || 0;
    const desktopUsageHours = parseFloat(document.getElementById('desktopUsageHours').value) || 0;
    const smartphoneUsageHours = parseFloat(document.getElementById('smartphoneUsageHours').value) || 0;
    const printing = document.getElementById('printing').value;
    const officePercentage = parseFloat(document.getElementById('officePercentage').value) || 0;
    const workDays = parseFloat(document.getElementById('workDays').value) || 0;

    // Calculate carbon emissions for devices
    let totalDeviceCarbon = 0;
    const deviceTypes = document.getElementsByName('deviceType[]');
    const deviceUsages = document.getElementsByName('deviceUsage[]');
    for (let i = 0; i < deviceTypes.length; i++) {
        const deviceType = deviceTypes[i].value;
        const deviceUsageYears = parseFloat(deviceUsages[i].value) || 0;
        const deviceFactor = factors.deviceFactors[deviceType] || {};
        const embodiedCarbon = deviceFactor.embodied || 0;
        const usageCarbonPerHour = deviceFactor.usagePerHour || 0;

        let deviceUsageHours = 0;
        if (deviceType === 'Desktop') {
            deviceUsageHours = desktopUsageHours;
        } else if (deviceType === 'Laptop') {
            deviceUsageHours = laptopUsageHours;
        } else if (deviceType === 'Smartphone') {
            deviceUsageHours = smartphoneUsageHours;
        }

        const annualUsageCarbon = deviceUsageYears > 0 ? (deviceUsageHours * 52 * usageCarbonPerHour) : 0;

        // Add embodied carbon and annual usage carbon
        totalDeviceCarbon += embodiedCarbon + annualUsageCarbon;
    }

    // Calculate carbon emissions for emails
    const emailCarbon = (emailCount * (factors.emailFactors.email || 0) * 52) + 
                        (emailAttachmentCount * (factors.emailFactors.attachmentEmail || 0) * 52);

    // Calculate carbon emissions for Teams messages and calls
    const teamsMessageCarbon = teamsMessages * (factors.teamsFactors.messages || 0) * 52;
    const teamsCallCarbon = teamsCallTime * (factors.teamsFactors.calls || 0) * 52;

    // Calculate carbon emissions for transport (using miles)
    const officeTransportMiles = transportDistanceMiles * (officePercentage / 100);
    const homeTransportMiles = transportDistanceMiles * ((100 - officePercentage) / 100);
    const officeTransportCarbon = officeTransportMiles * (factors.transportFactors[transportMode] || 0) * (workDays / 5);
    const homeTransportCarbon = homeTransportMiles * (factors.transportFactors[transportMode] || 0) * ((5 - workDays) / 5);
    const transportCarbon = officeTransportCarbon + homeTransportCarbon;

    // Calculate carbon emissions for printing
    let printingCarbon = 0;
    if (printing === '5-10') {
        printingCarbon = 7.5 * (factors.printingFactors.perPage || 0) * 52;
    } else if (printing === '10-50') {
        printingCarbon = 30 * (factors.printingFactors.perPage || 0) * 52;
    } else if (printing === '20/day') {
        printingCarbon = 20 * (factors.printingFactors.perPage || 0) * 365;
    }

    // Total carbon footprint
    const totalCarbon = totalDeviceCarbon + emailCarbon + teamsMessageCarbon + teamsCallCarbon + transportCarbon + printingCarbon;

    // Update the results in the HTML
    document.getElementById('totalCarbon').innerText = `${totalCarbon.toFixed(2)}`;
}
