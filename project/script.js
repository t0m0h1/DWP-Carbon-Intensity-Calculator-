console.log("Calculating carbon"); // Check if the function execution is triggered

// Carbon intensities in kg CO2e per unit
const carbonFactors = {
    email: 0.0003,
    emailAttachment: 0.03,
    teamsCall: 0.06, // per hour
    teamsMessage: 0.0002,
    trainTravel: 0.041, // per km
    carTravel: 0.271, // per km
    laptopUsage: 0.05, // per hour
    desktopUsage: 0.1, // per hour
    smartphoneUsage: 0.02, // per hour
    laptopEmbodied: 200, // per device over lifespan
    desktopEmbodied: 600, // per device over lifespan
    smartphoneEmbodied: 70, // per device over lifespan
    lifespan: 1560 // estimated usage hours over 3 years (52 weeks * 30 hours)
};

// Retrieve values from form
const emails = parseInt(document.getElementById('emailCount').value) || 0;
const emailsAttachment = parseInt(document.getElementById('emailAttachmentCount').value) || 0;
const teamsCalls = parseFloat(document.getElementById('teamsCalls').value) || 0;
const teamsMessages = parseInt(document.getElementById('teamsMessages').value) || 0;
const transportMode = document.getElementById('transportMode').value;
const transportDistance = parseFloat(document.getElementById('transportDistance').value) || 0;
const laptopUsageHours = parseFloat(document.getElementById('laptopUsageHours').value) || 0;
const desktopUsageHours = parseFloat(document.getElementById('desktopUsageHours').value) || 0;
const smartphoneUsageHours = parseFloat(document.getElementById('smartphoneUsageHours').value) || 0;
const laptops = parseInt(document.getElementById('laptops').value) || 0;
const desktops = parseInt(document.getElementById('desktops').value) || 0;
const smartphones = parseInt(document.getElementById('smartphones').value) || 0;

// Calculate operational carbon emissions
let totalCarbon = 0;
totalCarbon += emails * carbonFactors.email;
totalCarbon += emailsAttachment * carbonFactors.emailAttachment;
totalCarbon += teamsCalls * carbonFactors.teamsCall;
totalCarbon += teamsMessages * carbonFactors.teamsMessage;

// Calculate transport carbon based on selected mode
if (transportMode === "Train") {
    totalCarbon += transportDistance * carbonFactors.trainTravel;
} else if (transportMode === "Car") {
    totalCarbon += transportDistance * carbonFactors.carTravel;
}

totalCarbon += laptopUsageHours * carbonFactors.laptopUsage;
totalCarbon += desktopUsageHours * carbonFactors.desktopUsage;
totalCarbon += smartphoneUsageHours * carbonFactors.smartphoneUsage;

// Calculate embodied carbon emissions over their lifespan
let embodiedCarbon = 0;
embodiedCarbon += (laptops * carbonFactors.laptopEmbodied) / carbonFactors.lifespan * laptopUsageHours;
embodiedCarbon += (desktops * carbonFactors.desktopEmbodied) / carbonFactors.lifespan * desktopUsageHours;
embodiedCarbon += (smartphones * carbonFactors.smartphoneEmbodied) / carbonFactors.lifespan * smartphoneUsageHours;

// Total carbon emissions
totalCarbon += embodiedCarbon;

// Display the result
document.getElementById('totalCarbon').innerText = totalCarbon.toFixed(2);

// Detailed breakdown
document.getElementById('breakdown').innerHTML = `
    <p>Operational Carbon: ${(totalCarbon - embodiedCarbon).toFixed(2)} kg CO2e</p>
    <p>Embodied Carbon: ${embodiedCarbon.toFixed(2)} kg CO2e</p>
    `;

    // Store data in local storage
    const formData = {
        emailCount: emails,
        emailAttachmentCount: emailsAttachment,
        teamsCalls: teamsCalls,
        teamsMessages: teamsMessages,
        transportMode: transportMode,
        transportDistance: transportDistance,
        laptopUsageHours: laptopUsageHours,
        desktopUsageHours: desktopUsageHours,
        smartphoneUsageHours: smartphoneUsageHours,
        laptops: laptops,
        desktops: desktops,
        smartphones: smartphones
    };
    try {
        localStorage.setItem('carbonFormData', JSON.stringify(formData));
    } catch (e) {
        console.error('Error saving to localStorage', e);
    }


// Load data from local storage on page load
window.onload = function() {
    try {
        const formData = JSON.parse(localStorage.getItem('carbonFormData'));
        if (formData) {
            document.getElementById('emailCount').value = formData.emailCount;
            document.getElementById('emailAttachmentCount').value = formData.emailAttachmentCount;
            document.getElementById('teamsCalls').value = formData.teamsCalls;
            document.getElementById('teamsMessages').value = formData.teamsMessages;
            document.getElementById('transportMode').value = formData.transportMode;
            document.getElementById('transportDistance').value = formData.transportDistance;
            document.getElementById('laptopUsageHours').value = formData.laptopUsageHours;
            document.getElementById('desktopUsageHours').value = formData.desktopUsageHours;
            document.getElementById('smartphoneUsageHours').value = formData.smartphoneUsageHours;
            document.getElementById('laptops').value = formData.laptops;
            document.getElementById('desktops').value = formData.desktops;
            document.getElementById('smartphones').value = formData.smartphones;
        }
    } catch (e) {
        console.error('Error loading from localStorage', e);
    }
};