export enum ErrorCode {
    // Web3 Connection Errors
    NO_WEB3 = 'NO_WEB3',
    WALLET_CONNECTION_FAILED = 'WALLET_CONNECTION_FAILED',
    WRONG_NETWORK = 'WRONG_NETWORK',
    
    // Contract Interaction Errors
    CONTRACT_NOT_INITIALIZED = 'CONTRACT_NOT_INITIALIZED',
    TRANSACTION_FAILED = 'TRANSACTION_FAILED',
    INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
    
    // Validation Errors
    INVALID_INPUT = 'INVALID_INPUT',
    UNAUTHORIZED = 'UNAUTHORIZED',
    STARTUP_NOT_VALIDATED = 'STARTUP_NOT_VALIDATED',
    
    // Investment Errors
    INSUFFICIENT_SHARES = 'INSUFFICIENT_SHARES',
    INVESTMENT_TOO_LOW = 'INVESTMENT_TOO_LOW',
    INVESTMENT_TOO_HIGH = 'INVESTMENT_TOO_HIGH',
    
    // Governance Errors
    VOTING_PERIOD_ENDED = 'VOTING_PERIOD_ENDED',
    ALREADY_VOTED = 'ALREADY_VOTED',
    PROPOSAL_EXECUTION_FAILED = 'PROPOSAL_EXECUTION_FAILED',
    
    // AI Integration Errors
    AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
    ANALYSIS_FAILED = 'ANALYSIS_FAILED',
    
    // General Errors
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class ZeedChainError extends Error {
    constructor(
        public readonly code: ErrorCode,
        message: string,
        public readonly details?: any
    ) {
        super(message);
        this.name = 'ZeedChainError';
    }

    static fromContract(error: any): ZeedChainError {
        // Handle common contract revert reasons
        const revertMessage = error.message || '';
        
        if (revertMessage.includes('insufficient balance')) {
            return new ZeedChainError(
                ErrorCode.INSUFFICIENT_BALANCE,
                'Insufficient balance for transaction'
            );
        }
        
        if (revertMessage.includes('not authorized')) {
            return new ZeedChainError(
                ErrorCode.UNAUTHORIZED,
                'Not authorized to perform this action'
            );
        }

        if (revertMessage.includes('startup not validated')) {
            return new ZeedChainError(
                ErrorCode.STARTUP_NOT_VALIDATED,
                'Startup has not been validated'
            );
        }

        // Default unknown contract error
        return new ZeedChainError(
            ErrorCode.TRANSACTION_FAILED,
            'Transaction failed',
            error
        );
    }

    static fromWeb3(error: any): ZeedChainError {
        if (!window.ethereum) {
            return new ZeedChainError(
                ErrorCode.NO_WEB3,
                'Web3 provider not found'
            );
        }

        if (error.code === 4001) {
            return new ZeedChainError(
                ErrorCode.WALLET_CONNECTION_FAILED,
                'User rejected the connection request'
            );
        }

        if (error.code === -32603) {
            return new ZeedChainError(
                ErrorCode.TRANSACTION_FAILED,
                'Transaction failed',
                error
            );
        }

        return new ZeedChainError(
            ErrorCode.UNKNOWN_ERROR,
            'An unknown error occurred',
            error
        );
    }
}