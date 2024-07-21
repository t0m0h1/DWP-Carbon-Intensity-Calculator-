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

function removeDevice(button) {
    const container = document.getElementById('devicesContainer');
    container.removeChild(button.parentElement);
}

async function calculateCarbonFootprint(event) {
    event.preventDefault(); // Prevent page refresh

    // Fetch the factors from JSON
    const response = await fetch('factors.json');
    const factors = await response.json();

    // Get values from the inputs
    const emailCount = parseFloat(document.getElementById('emailCount').value);
    const emailAttachmentCount = parseFloat(document.getElementById('emailAttachmentCount').value);
    const transportMode = document.getElementById('transportMode').value;
    const transportDistance = parseFloat(document.getElementById('transportDistance').value);
    const laptopUsageHours = parseFloat(document.getElementById('laptopUsageHours').value);
    const desktopUsageHours = parseFloat(document.getElementById('desktopUsageHours').value);
    const smartphoneUsageHours = parseFloat(document.getElementById('smartphoneUsageHours').value);
    const laptops = parseInt(document.getElementById('laptops').value);
    const desktops = parseInt(document.getElementById('desktops').value);
    const smartphones = parseInt(document.getElementById('smartphones').value);

    console.log("Inputs:", { emailCount, emailAttachmentCount, transportMode, transportDistance, laptopUsageHours, desktopUsageHours, smartphoneUsageHours, laptops, desktops, smartphones });

    // Calculate carbon emissions for multiple devices
    let totalDeviceCarbon = 0;
    const deviceTypes = document.getElementsByName('deviceType[]');
    const deviceUsages = document.getElementsByName('deviceUsage[]');
    for (let i = 0; i < deviceTypes.length; i++) {
        const deviceType = deviceTypes[i].value;
        const deviceUsage = parseFloat(deviceUsages[i].value);
        totalDeviceCarbon += (factors.deviceFactors[deviceType] * deviceUsage);
    }
    console.log("Total Device Carbon:", totalDeviceCarbon);

    // Calculate carbon emissions for email
    const emailCarbon = (emailCount * factors.emailFactors.email * 52) + 
                        (emailAttachmentCount * factors.emailFactors.attachmentEmail * 52);
    console.log("Email Carbon:", emailCarbon);

    // Calculate carbon emissions for transport
    const transportCarbon = transportDistance * factors.transportFactors[transportMode];
    console.log("Transport Carbon:", transportCarbon);

    // Calculate carbon emissions for usage hours
    const laptopUsageCarbon = (laptopUsageHours * factors.usageHoursFactors.Laptop * 52 * laptops);
    const desktopUsageCarbon = (desktopUsageHours * factors.usageHoursFactors.Desktop * 52 * desktops);
    const smartphoneUsageCarbon = (smartphoneUsageHours * factors.usageHoursFactors.Smartphone * 52 * smartphones);
    console.log("Laptop Usage Carbon:", laptopUsageCarbon);
    console.log("Desktop Usage Carbon:", desktopUsageCarbon);
    console.log("Smartphone Usage Carbon:", smartphoneUsageCarbon);

    // Total carbon footprint
    const totalCarbon = totalDeviceCarbon + emailCarbon + transportCarbon + laptopUsageCarbon + desktopUsageCarbon + smartphoneUsageCarbon;
    console.log("Total Carbon:", totalCarbon);

    // Update the results in the HTML
    document.getElementById('totalCarbon').innerText = totalCarbon + " kg CO2e";


};
