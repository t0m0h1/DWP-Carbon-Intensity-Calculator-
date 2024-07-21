{
  "deviceFactors": {
    "Desktop": {
      "embodied": 100,            // 100 kg embodied carbon
      "usagePerHour": 0.05        // 0.05 kg CO₂e per hour of usage
    },
    "Laptop": {
      "embodied": 50,             // 50 kg embodied carbon
      "usagePerHour": 0.03        // 0.03 kg CO₂e per hour of usage
    },
    "Smartphone": {
      "embodied": 10,             // 10 kg embodied carbon
      "usagePerHour": 0.01        // 0.01 kg CO₂e per hour of usage
    }
  },
  "emailFactors": {
    "email": 0.01,               // 0.01 kg CO₂e per email
    "attachmentEmail": 0.05      // 0.05 kg CO₂e per email with attachment
  },
  "transportFactors": {
    "Car": 0.2,                  // 0.2 kg CO₂e per km
    "Bus": 0.1,                  // 0.1 kg CO₂e per km
    "Train": 0.05                // 0.05 kg CO₂e per km
  },
  "usageHoursFactors": {
    "Laptop": 0.02,              // 0.02 kg CO₂e per hour of usage
    "Desktop": 0.03,             // 0.03 kg CO₂e per hour of usage
    "Smartphone": 0.01           // 0.01 kg CO₂e per hour of usage
  }
}
