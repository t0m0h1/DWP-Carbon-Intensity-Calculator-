
// device data points are in kg CO2e
// transport factors are in kg CO2e per km converted to miles






// manipulate the DOM to add or remove devices

let deviceCount = 1;

function addDevice() {
    const container = document.getElementById('devicesContainer');
    const newDevice = document.createElement('div');
    newDevice.className = 'device';
    newDevice.innerHTML = `
        <h2>Device</h2>
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

// Function to remove a device input
function removeDevice(button) {
    const container = document.getElementById('devicesContainer');
    container.removeChild(button.parentElement);
}







// Function to calculate the total carbon footprint
async function calculateCarbonFootprint(event) {
    event.preventDefault(); // Prevent page refresh

    let factors;
    try {
        const response = await fetch('factors.json');
        if (!response.ok) throw new Error('Network response was not ok');
        factors = await response.json();
    } catch (error) {
        console.error('Failed to fetch factors:', error);
        alert('Failed to fetch carbon factors. Please try again later.');
        return;
    }

    // Get values from the inputs
    const emailCount = parseFloat(document.getElementById('emailCount').value) || 0;
    const emailAttachmentCount = parseFloat(document.getElementById('emailAttachmentCount').value) || 0;
    const transportMode = document.getElementById('transportMode').value;
    const transportDistanceKm = parseFloat(document.getElementById('transportDistance').value) || 0;
    const laptopUsageHours = parseFloat(document.getElementById('laptopUsageHours').value) || 0;
    const desktopUsageHours = parseFloat(document.getElementById('desktopUsageHours').value) || 0;
    const smartphoneUsageHours = parseFloat(document.getElementById('smartphoneUsageHours').value) || 0;
    const laptops = parseInt(document.getElementById('laptops').value) || 0;
    const desktops = parseInt(document.getElementById('desktops').value) || 0;
    const smartphones = parseInt(document.getElementById('smartphones').value) || 0;

    // Convert transport distance from kilometers to miles
    const transportDistanceMiles = transportDistanceKm * 0.621371;

    // Calculate carbon emissions for multiple devices
    let totalDeviceCarbon = 0;
    const deviceTypes = document.getElementsByName('deviceType[]');
    const deviceUsages = document.getElementsByName('deviceUsage[]');
    for (let i = 0; i < deviceTypes.length; i++) {
        const deviceType = deviceTypes[i].value;
        const deviceUsageYears = parseFloat(deviceUsages[i].value) || 0;
        const deviceFactor = factors.deviceFactors[deviceType] || {};
        const embodiedCarbon = deviceFactor.embodied || 0;
        const usageCarbonPerHour = deviceFactor.usagePerHour || 0;
        
        // Embodied carbon is one-time; usage carbon is calculated for the given years
        totalDeviceCarbon += (embodiedCarbon + (usageCarbonPerHour * deviceUsageYears * 8760)); // 8760 hours/year
    }

    // Calculate carbon emissions for email
    const emailCarbon = (emailCount * (factors.emailFactors.email || 0) * 52) + 
                        (emailAttachmentCount * (factors.emailFactors.attachmentEmail || 0) * 52);

    // Calculate carbon emissions for transport (using miles)
    const transportCarbon = transportDistanceMiles * (factors.transportFactors[transportMode] || 0);

    // Calculate usage carbon for laptops, desktops, and smartphones
    const laptopUsageCarbon = laptopUsageHours * (factors.usageHoursFactors.Laptop || 0) * 52 * laptops;
    const desktopUsageCarbon = desktopUsageHours * (factors.usageHoursFactors.Desktop || 0) * 52 * desktops;
    const smartphoneUsageCarbon = smartphoneUsageHours * (factors.usageHoursFactors.Smartphone || 0) * 52 * smartphones;

    // Total carbon footprint
    const totalCarbon = totalDeviceCarbon + emailCarbon + transportCarbon + laptopUsageCarbon + desktopUsageCarbon + smartphoneUsageCarbon;

    // Update the results in the HTML
    document.getElementById('totalCarbon').innerText = `${totalCarbon.toFixed(2)} kg CO2e`;
}
