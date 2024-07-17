async function calculateCarbonFootprint() {
    // Fetch the factors from JSON
    const response = await fetch('factors.json');
    const factors = await response.json();

    // Get values from the inputs
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

    console.log("Inputs:", { deviceType, deviceUsage, emailCount, emailAttachmentCount, transportMode, transportDistance, laptopUsageHours, desktopUsageHours, smartphoneUsageHours, laptops, desktops, smartphones });

    // Calculate carbon emissions for devices
    const deviceCarbon = (factors.deviceFactors[deviceType] * deviceUsage);
    console.log("Device Carbon:", deviceCarbon);

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
    const totalCarbon = deviceCarbon + emailCarbon + transportCarbon + laptopUsageCarbon + desktopUsageCarbon + smartphoneUsageCarbon;
    console.log("Total Carbon:", totalCarbon);

    // Update the results in the HTML
    document.getElementById('totalCarbon').innerText = totalCarbon.toFixed(2);

    // breakdown not required yet

    // document.getElementById('breakdown').innerHTML = `
    //     <p>Devices: ${deviceCarbon.toFixed(2)} kg CO2e</p>
    //     <p>Emails: ${emailCarbon.toFixed(2)} kg CO2e</p>
    //     <p>Transport: ${transportCarbon.toFixed(2)} kg CO2e</p>
    //     <p>Laptop Usage: ${laptopUsageCarbon.toFixed(2)} kg CO2e</p>
    //     <p>Desktop Usage: ${desktopUsageCarbon.toFixed(2)} kg CO2e</p>
    //     <p>Smartphone Usage: ${smartphoneUsageCarbon.toFixed(2)} kg CO2e</p>
    // `;
}