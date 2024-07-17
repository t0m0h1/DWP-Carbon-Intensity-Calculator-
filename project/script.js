// script.js:
// Fetches the factors from the factors.json file.
// Retrieves the user inputs from the form.
// Calculates the carbon emissions for devices, emails, transport, and usage hours.
// Sums up all the emissions to get the total carbon footprint.
// Updates the results section in the HTML to display the total carbon emissions and a breakdown of the emissions by category.


document.getElementById('carbonForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Fetch the factors from JSON
    const response = await fetch('carbonFactors.json');
    const factors = await response.json();
    
    // Get values from the form
    const deviceType = document.getElementById('deviceType').value;
    const deviceUsage = parseFloat(document.getElementById('deviceUsage').value);
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
    
    // Calculate carbon emissions for devices
    const deviceCarbon = (factors.deviceFactors[deviceType] * deviceUsage);
    
    // Calculate carbon emissions for email
    const emailCarbon = (emailCount * factors.emailFactors.email * 52) + 
                        (emailAttachmentCount * factors.emailFactors.attachmentEmail * 52);
    
    // Calculate carbon emissions for transport
    const transportCarbon = transportDistance * factors.transportFactors[transportMode];
    
    // Calculate carbon emissions for usage hours
    const laptopUsageCarbon = (laptopUsageHours * factors.usageHoursFactors.Laptop * 52 * laptops);
    const desktopUsageCarbon = (desktopUsageHours * factors.usageHoursFactors.Desktop * 52 * desktops);
    const smartphoneUsageCarbon = (smartphoneUsageHours * factors.usageHoursFactors.Smartphone * 52 * smartphones);
    
    // Total carbon footprint
    const totalCarbon = deviceCarbon + emailCarbon + transportCarbon + laptopUsageCarbon + desktopUsageCarbon + smartphoneUsageCarbon;
    
    // Update the results in the HTML
    document.getElementById('totalCarbon').innerText = totalCarbon.toFixed(2);
    document.getElementById('breakdown').innerHTML = `
        <p>Devices: ${deviceCarbon.toFixed(2)} kg CO2e</p>
        <p>Emails: ${emailCarbon.toFixed(2)} kg CO2e</p>
        <p>Transport: ${transportCarbon.toFixed(2)} kg CO2e</p>
        <p>Laptop Usage: ${laptopUsageCarbon.toFixed(2)} kg CO2e</p>
        <p>Desktop Usage: ${desktopUsageCarbon.toFixed(2)} kg CO2e</p>
        <p>Smartphone Usage: ${smartphoneUsageCarbon.toFixed(2)} kg CO2e</p>
    `;
});
