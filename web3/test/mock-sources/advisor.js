// Mock AI Advisor JavaScript source
const mockResponse = {
  recommendation: "Invest in AI technology stack",
  confidenceScore: 85
};

// Return raw bytes as hex string
return `${Buffer.from(mockResponse.recommendation).toString('hex')}000000000000000000000000000000000000000000000000000000000000055`;