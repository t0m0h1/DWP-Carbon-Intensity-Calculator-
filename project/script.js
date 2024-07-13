function calculateCarbon() {
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
    const trainTravel = parseFloat(document.getElementById('transportDistance').value) || 0; // Assuming distance is entered for train
    const carTravel = parseFloat(document.getElementById('transportDistance').value) || 0; // Assuming distance is entered for car
    const laptopHours = parseFloat(document.getElementById('laptopHours').value) || 0;
    const desktopHours = parseFloat(document.getElementById('desktopHours').value) || 0;
    const smartphoneHours = parseFloat(document.getElementById('smartphoneHours').value) || 0;
    const laptops = parseInt(document.getElementById('laptops').value) || 0;
    const desktops = parseInt(document.getElementById('desktops').value) || 0;
    const smartphones = parseInt(document.getElementById('smartphones').value) || 0;

    // Calculate operational carbon emissions
    let totalCarbon = 0;
    totalCarbon += emails * carbonFactors.email;
    totalCarbon += emailsAttachment * carbonFactors.emailAttachment;
    totalCarbon += teamsCalls * carbonFactors.teamsCall;
    totalCarbon += teamsMessages * carbonFactors.teamsMessage;
    totalCarbon += trainTravel * carbonFactors.trainTravel;
    totalCarbon += carTravel * carbonFactors.carTravel;
    totalCarbon += laptopHours * carbonFactors.laptopUsage;
    totalCarbon += desktopHours * carbonFactors.desktopUsage;
    totalCarbon += smartphoneHours * carbonFactors.smartphoneUsage;

    // Calculate embodied carbon emissions
    let embodiedCarbon = 0;
    embodiedCarbon += (laptops * carbonFactors.laptopEmbodied) / carbonFactors.lifespan * laptopHours;
    embodiedCarbon += (desktops * carbonFactors.desktopEmbodied) / carbonFactors.lifespan * desktopHours;
    embodiedCarbon += (smartphones * carbonFactors.smartphoneEmbodied) / carbonFactors.lifespan * smartphoneHours;

    // Total carbon emissions
    totalCarbon += embodiedCarbon;

    // Display the result
    document.getElementById('totalCarbon').innerText = totalCarbon.toFixed(2);

    // Detailed breakdown
    document.getElementById('breakdown').innerHTML = `
        <p>Operational Carbon: ${totalCarbon.toFixed(2)} kg CO2e</p>
        <p>Embodied Carbon: ${embodiedCarbon.toFixed(2)} kg CO2e</p>
    `;

    // Store data in local storage
    const formData = {
        emailCount: emails,
        emailAttachmentCount: emailsAttachment,
        teamsCalls: teamsCalls,
        teamsMessages: teamsMessages,
        transportDistance: trainTravel, // Assuming train travel distance is used for transportDistance
        laptopHours: laptopHours,
        desktopHours: desktopHours,
        smartphoneHours: smartphoneHours,
        laptops: laptops,
        desktops: desktops,
        smartphones: smartphones
    };
    localStorage.setItem('carbonFormData', JSON.stringify(formData));
}

// Load data from local storage on page load
window.onload = function() {
    const formData = JSON.parse(localStorage.getItem('carbonFormData'));
    if (formData) {
        document.getElementById('emailCount').value = formData.emailCount;
        document.getElementById('emailAttachmentCount').value = formData.emailAttachmentCount;
        document.getElementById('teamsCalls').value = formData.teamsCalls;
        document.getElementById('teamsMessages').value = formData.teamsMessages;
        document.getElementById('transportDistance').value = formData.transportDistance; // Assuming train travel distance is used for transportDistance
        document.getElementById('laptopHours').value = formData.laptopHours;
        document.getElementById('desktopHours').value = formData.desktopHours;
        document.getElementById('smartphoneHours').value = formData.smartphoneHours;
        document.getElementById('laptops').value = formData.laptops;
        document.getElementById('desktops').value = formData.desktops;
        document.getElementById('smartphones').value = formData.smartphones;
    }
};
