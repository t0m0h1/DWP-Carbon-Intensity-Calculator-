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
            <option value="Laptop">Laptop</option>
            <option value="Desktop">Desktop</option>
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


// Convert selected range to min and max values
function parseRange(range) {
    // Handle 'none' case
    if (range === 'none') return [0, 0];

    // Split the range by '-'
    const parts = range.split('-');

    // If split results in exactly two parts, try to parse them as numbers
    if (parts.length === 2) {
        const min = parseFloat(parts[0].trim());
        const max = parseFloat(parts[1].trim());

        // Check if both min and max are valid numbers
        if (!isNaN(min) && !isNaN(max)) {
            return [min, max];
        }
    }

    // If split failed or values aren't valid numbers, return default [0, 0]
    console.warn(`Unexpected range format: ${range}`);
    return [0, 0];
}



async function calculateCarbonFootprint(event) {
    event.preventDefault(); // Prevent page refresh

    let factors;
    try {
        factors = await fetchFactors();
    } catch {
        return; // Exit if fetching factors fails
    }

    // Get values from the inputs
    const emailCount = document.getElementById('emailCount').value;
    const emailAttachmentCount = document.getElementById('emailAttachmentCount').value;
    const teamsMessages = document.getElementById('teamsMessages').value;
    const teamsCallTime = document.getElementById('teamsCallTime').value;
    const transportMode = document.getElementById('transportMode').value;
    const transportDistance = document.getElementById('transportDistance').value;
    const printing = document.getElementById('printing').value;

    const wfhDays = parseFloat(document.getElementById('wfhDays').value) || 0;
    const officeDays = parseFloat(document.getElementById('officeDays').value) || 0;
    const commuteType = document.getElementById('commuteType').value;
    const commuteDistance = parseFloat(document.getElementById('commuteDistance').value) || 0;

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

        // Calculate annual usage carbon
        const annualUsageCarbon = deviceUsageYears > 0 ? (52 * usageCarbonPerHour * 8) : 0; // Assume 8 hours/day

        // Add embodied carbon and annual usage carbon
        totalDeviceCarbon += embodiedCarbon + annualUsageCarbon;
    }

    // Update the breakdown for device usage
    document.getElementById('deviceUsage').innerText = `Device Usage: ${totalDeviceCarbon.toFixed(2)} kg CO2e`;

    // Calculate carbon emissions for emails
    const [emailMin, emailMax] = parseRange(emailCount);
    const [attachmentMin, attachmentMax] = parseRange(emailAttachmentCount);
    const emailCarbon = ((emailMin + emailMax) / 2 * factors.emailFactors.email || 0 * 52) + 
                        ((attachmentMin + attachmentMax) / 2 * factors.emailFactors.attachmentEmail || 0 * 52);

    // Update the breakdown for email usage
    document.getElementById('emailUsage').innerText = `Email Usage: ${emailCarbon.toFixed(2)} kg CO2e`;

    // Calculate carbon emissions for Teams messages and calls
    const teamsMessageCarbon = (parseRange(teamsMessages)[0] * (factors.teamsFactors.messages || 0) * 52);
    const teamsCallCarbon = (parseRange(teamsCallTime)[0] * (factors.teamsFactors.calls || 0) * 52);

    // Update the breakdown for Teams usage
    document.getElementById('teamsUsage').innerText = `Teams Usage: ${(teamsMessageCarbon + teamsCallCarbon).toFixed(2)} kg CO2e`;

    // Calculate carbon emissions for transport
    const transportDistanceMiles = parseRange(transportDistance)[0];
    const totalTransportDistance = transportDistanceMiles * 52; // Convert weekly distance to yearly
    const transportCarbon = totalTransportDistance * (factors.transportFactors[transportMode] || 0);

    // Update the breakdown for transportation
    document.getElementById('transportation').innerText = `Transportation: ${transportCarbon.toFixed(2)} kg CO2e`;

    // Calculate carbon emissions for printing
    let printingCarbon = 0;
    if (printing === '5-10') {
        printingCarbon = 7.5 * (factors.printingFactors.perPage || 0) * 52;
    } else if (printing === '10-50') {
        printingCarbon = 30 * (factors.printingFactors.perPage || 0) * 52;
    } else if (printing === '20/day') {
        printingCarbon = 20 * (factors.printingFactors.perPage || 0) * 365;
    }

    // Update the breakdown for printing
    document.getElementById('printing').innerText = `Printing: ${printingCarbon.toFixed(2)} kg CO2e`;

    // Calculate carbon emissions for working patterns
    const officeDaysPerYear = officeDays * 52;
    const wfhDaysPerYear = wfhDays * 52;
    const commuteDistancePerYear = commuteDistance * 365;
    
    const officeCarbon = officeDaysPerYear * factors.workingPatternsFactors.office;
    const wfhCarbon = wfhDaysPerYear * factors.workingPatternsFactors.home;
    const commuteCarbon = commuteDistancePerYear * (factors.transportFactors[commuteType] || 0);

    // Update the breakdown for working patterns
    document.getElementById('workingPatterns').innerText = `Working Patterns: ${(officeCarbon + wfhCarbon + commuteCarbon).toFixed(2)} kg CO2e`;

    // Total carbon footprint
    const totalCarbon = totalDeviceCarbon + emailCarbon + teamsMessageCarbon + teamsCallCarbon + transportCarbon + printingCarbon + officeCarbon + wfhCarbon + commuteCarbon;

    // Update the total carbon footprint
    document.getElementById('totalCarbon').innerText = `${totalCarbon.toFixed(2)} kg CO2e`;
}











// Collapsible section logic
document.addEventListener("DOMContentLoaded", () => {
    const collapsibles = document.querySelectorAll(".collapsible");

    collapsibles.forEach((collapsible) => {
        collapsible.addEventListener("click", function () {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    });
});