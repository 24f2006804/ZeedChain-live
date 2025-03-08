// Mock performance metrics JavaScript source
const mockPerformance = [
    1000,    // activeUsers (current count)
    50000,   // monthlyRevenue (in USD)
    15,      // customerGrowth (percentage)
    85,      // retentionRate (percentage)
    200      // unitEconomics (revenue per user in USD)
];

// Return array values as padded hex strings
const encoded = mockPerformance.map(n => 
    n.toString(16).padStart(64, '0')
).join('');

return encoded;