// Mock credentials verification JavaScript source
const mockCredentials = {
  credentialHash: "0x1234567890abcdef1234567890abcdef12345678",
  verificationSource: "Mock Verification Authority"
};

// Return raw credential data as hex string
const hash = Buffer.from(mockCredentials.credentialHash.slice(2)).toString('hex');
const source = Buffer.from(mockCredentials.verificationSource).toString('hex');
return `${hash}${source}`;