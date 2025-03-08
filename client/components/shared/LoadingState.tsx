import { ZeedChainError } from '../../types/errors';

interface LoadingStateProps {
    isLoading: boolean;
    error: ZeedChainError | null;
    children: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    isLoading,
    error,
    children
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-red-800 font-medium mb-2">Error</h3>
                <p className="text-red-600">{error.message}</p>
                {error.details && (
                    <pre className="mt-2 text-sm text-red-500 bg-red-50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(error.details, null, 2)}
                    </pre>
                )}
            </div>
        );
    }

    return <>{children}</>;
};