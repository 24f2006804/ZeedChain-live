// Mock financial metrics JavaScript source
const mockFinancials = [
    1000000,  // revenue (in USD)
    50000,    // userGrowth (new users)
    5000000,  // marketSize (in USD)
    100000    // burnRate (monthly, in USD)
];

// Return array values as padded hex strings
const encoded = mockFinancials.map(n => 
    n.toString(16).padStart(64, '0')
).join('');

return encoded;