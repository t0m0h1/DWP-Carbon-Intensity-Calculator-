// Device data points are in kg CO2e
// Transport factors are in kg CO2e per km converted to miles



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

    const toggleInfoButton = document.getElementById("toggleInfo");
    const infoText = document.getElementById("infoText");

    toggleInfoButton.addEventListener("click", () => {
        if (infoText.style.display === "none") {
            infoText.style.display = "block";
        } else {
            infoText.style.display = "none";
        }
    });
});

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
            <option value="Second Monitor">Second Monitor</option> <!-- New option for Monitor -->
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


// existing parseRange function
// Assumed both min and max values were always numbers.


// function parseRange(range) {
//     if (range === 'none') return [0, 0];
//     const parts = range.split('-');
//     if (parts.length === 2) {
//         const min = parseFloat(parts[0].trim());
//         const max = parseFloat(parts[1].trim());
//         if (!isNaN(min) && !isNaN(max)) return [min, max];
//     }
//     console.warn(`Unexpected range format: ${range}`);
//     return [0, 0];
// }


// new parseRange function 
function parseRange(range) {
    if (range === 'none') return [0, 0];
    
    const parts = range.split('-');
    if (parts.length === 2) {
        const min = parseFloat(parts[0].trim());
        const maxPart = parts[1].trim();
        const max = maxPart === '+' ? Infinity : parseFloat(maxPart);
        
        if (!isNaN(min) && (max === Infinity || !isNaN(max))) {
            return [min, max];
        }
    }
    
    console.warn(`Unexpected range format: ${range}`);
    return [0, 0];
}




async function calculateCarbonFootprint(event) {
    event.preventDefault();

    let factors;
    try {
        factors = await fetchFactors();
    } catch {
        return;
    }

    // Extract and process data as before
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

    // Calculate emissions from devices
    let totalDeviceCarbon = 0;
    const deviceTypes = document.getElementsByName('deviceType[]');
    const deviceUsages = document.getElementsByName('deviceUsage[]');
    for (let i = 0; i < deviceTypes.length; i++) {
        const deviceType = deviceTypes[i].value;
        const deviceUsageYears = parseFloat(deviceUsages[i].value) || 0;
        const deviceFactor = factors.deviceFactors[deviceType] || {};
        const embodiedCarbon = deviceFactor.embodied || 0;
        const usageCarbonPerHour = deviceFactor.usagePerHour || 0;

        const annualUsageCarbon = deviceUsageYears > 0 ? (52 * usageCarbonPerHour * 8) : 0;
        totalDeviceCarbon += embodiedCarbon + annualUsageCarbon;
    }

    document.getElementById('deviceUsage').innerText = `Device Usage: ${totalDeviceCarbon.toFixed(2)} kg CO2e`;

    // Calculate emissions from emails
    const [emailMin, emailMax] = parseRange(emailCount);
    const [attachmentMin, attachmentMax] = parseRange(emailAttachmentCount);
    const emailCarbon = ((emailMin + emailMax) / 2 * factors.emailFactors.email || 0 * 52) + 
                        ((attachmentMin + attachmentMax) / 2 * factors.emailFactors.attachmentEmail || 0 * 52);

    document.getElementById('emailUsage').innerText = `Email Usage: ${emailCarbon.toFixed(2)} kg CO2e`;

    // Calculate emissions from Teams
    const teamsMessageCarbon = (parseRange(teamsMessages)[0] * (factors.teamsFactors.messages || 0) * 52);
    const teamsCallCarbon = (parseRange(teamsCallTime)[0] * (factors.teamsFactors.calls || 0) * 52);

    document.getElementById('teamsUsage').innerText = `Teams Usage: ${(teamsMessageCarbon + teamsCallCarbon).toFixed(2)} kg CO2e`;

    // Calculate emissions from transportation
    const transportDistanceMiles = parseRange(transportDistance)[0];
    const totalTransportDistance = transportDistanceMiles * 52;
    const transportCarbon = totalTransportDistance * (factors.transportFactors[transportMode] || 0);

    document.getElementById('transportation').innerText = `Transportation: ${transportCarbon.toFixed(2)} kg CO2e`;

    // Calculate emissions from printing
    let printingCarbon = 0;
    if (printing === '5-10') {
        printingCarbon = 7.5 * (factors.printingFactors.perPage || 0) * 52;
    } else if (printing === '10-50') {
        printingCarbon = 30 * (factors.printingFactors.perPage || 0) * 52;
    } else if (printing === '20/day') {
        printingCarbon = 20 * (factors.printingFactors.perPage || 0) * 365;
    }

    document.getElementById('printing').innerText = `Printing: ${printingCarbon.toFixed(2)} kg CO2e`;

    // Calculate emissions from working patterns
    const officeDaysPerYear = officeDays * 52;
    const wfhDaysPerYear = wfhDays * 52;
    const commuteDistancePerYear = commuteDistance * 365;

    const officeCarbon = officeDaysPerYear * factors.workingPatternsFactors.office;
    const wfhCarbon = wfhDaysPerYear * factors.workingPatternsFactors.home;
    const commuteCarbon = commuteDistancePerYear * (factors.transportFactors[commuteType] || 0);

    document.getElementById('workingPatterns').innerText = `Working Patterns: ${(officeCarbon + wfhCarbon + commuteCarbon).toFixed(2)} kg CO2e`;

    // Calculate emissions from data storage
    const emailClearFrequency = document.getElementById('emailClearFrequency').value;
    const onedriveClearFrequency = document.getElementById('onedriveClearFrequency').value;

    const emailClearCarbon = {
        'never': 0,
        'monthly': factors.dataStorageFactors.emailClearedMonthly || 0,
        'quarterly': factors.dataStorageFactors.emailClearedMonthly * 3 || 0,
        'yearly': factors.dataStorageFactors.emailClearedMonthly * 12 || 0,
        'more_than_yearly': factors.dataStorageFactors.emailClearedMonthly * 15 || 0
    }[emailClearFrequency] || 0;

    const onedriveClearCarbon = {
        'never': 0,
        'monthly': factors.dataStorageFactors.oneDriveClearedMonthly || 0,
        'quarterly': factors.dataStorageFactors.oneDriveClearedMonthly * 3 || 0,
        'yearly': factors.dataStorageFactors.oneDriveClearedMonthly * 12 || 0,
        'more_than_yearly': factors.dataStorageFactors.oneDriveClearedMonthly * 15 || 0
    }[onedriveClearFrequency] || 0;

    const dataStorageCarbon = (emailClearCarbon + onedriveClearCarbon) * 52;

    // Update total emissions
    const totalCarbon = totalDeviceCarbon + emailCarbon + teamsMessageCarbon + teamsCallCarbon + transportCarbon + printingCarbon + officeCarbon + wfhCarbon + commuteCarbon + dataStorageCarbon;
    document.getElementById('totalCarbon').innerText = `${totalCarbon.toFixed(2)} kg CO2e`;

    // Update chart
    const ctx = document.getElementById('emissionsChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [
                'Device Usage',
                'Email Usage',
                'Teams Usage',
                'Transportation',
                'Printing',
                'Working Patterns',
                'Data Storage'
            ],
            datasets: [{
                data: [
                    totalDeviceCarbon,
                    emailCarbon,
                    teamsMessageCarbon + teamsCallCarbon,
                    transportCarbon,
                    printingCarbon,
                    officeCarbon + wfhCarbon + commuteCarbon,
                    dataStorageCarbon
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw.toFixed(2) + ' kg CO2e';
                        }
                    }
                }
            }
        }
    });

    // Categorize user based on total carbon footprint
    const thresholds = {
        low: 100, // kg CO2e
        medium: 250, // kg CO2e
        high: 500 // kg CO2e
    };

    let persona = '';
    if (totalCarbon <= thresholds.low) {
        persona = 'Eco-Friendly';
    } else if (totalCarbon <= thresholds.medium) {
        persona = 'Average';
    } else if (totalCarbon <= thresholds.high) {
        persona = 'High Carbon Footprint';
    } else {
        persona = 'Very High Carbon Footprint';
    }

    document.getElementById('personaResult').innerText = persona;
}



// Exporting functions for testing
module.exports = { 
    parseRange,
    calculateCarbonFootprint,
    addDevice,
    removeDevice,
    fetchFactors
};