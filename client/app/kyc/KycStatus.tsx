import { useKyc } from '@/hooks/useKyc';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface KycStatusProps {
  onStartBasicKyc: () => void;
  onStartAdvancedKyc: () => void;
}

export const KycStatus = ({ onStartBasicKyc, onStartAdvancedKyc }: KycStatusProps) => {
  const { kycData, loading, getKycStatusText, KycStatus, KycLevel, hasCompletedKyc } = useKyc();
  
  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto bg-black border-violet-900">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500"></div>
            <p className="text-gray-300">Loading KYC status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const renderStatusIcon = () => {
    if (!kycData) return <AlertCircle className="h-8 w-8 text-gray-500" />;
    
    switch (kycData.status) {
      case KycStatus.APPROVED:
        return <CheckCircle className="h-8 w-8 text-violet-400" />;
      case KycStatus.PENDING:
        return <Clock className="h-8 w-8 text-blue-400" />;
      case KycStatus.REJECTED:
        return <XCircle className="h-8 w-8 text-red-400" />;
      default:
        return <AlertCircle className="h-8 w-8 text-gray-500" />;
    }
  };
  
  const renderStatusBadge = () => {
    if (!kycData) return <Badge variant="outline" className="border-violet-700 text-violet-300">Not Started</Badge>;
    
    switch (kycData.status) {
      case KycStatus.APPROVED:
        return <Badge className="bg-violet-900 text-violet-200 border-violet-700">Approved</Badge>;
      case KycStatus.PENDING:
        return <Badge className="bg-blue-900 text-blue-200 border-blue-700">Pending</Badge>;
      case KycStatus.REJECTED:
        return <Badge className="bg-red-900 text-red-200 border-red-700">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="border-violet-700 text-violet-300">Not Started</Badge>;
    }
  };
  
  const renderNextSteps = () => {
    if (!kycData) {
      return (
        <Button onClick={onStartBasicKyc} className="w-full bg-violet-700 hover:bg-violet-600 text-white">
          Start Basic KYC
        </Button>
      );
    }
    
    switch (kycData.status) {
      case KycStatus.APPROVED:
        if (kycData.level === KycLevel.BASIC) {
          return (
            <Button onClick={onStartAdvancedKyc} className="w-full bg-violet-700 hover:bg-violet-600 text-white">
              Complete Advanced KYC
            </Button>
          );
        }
        return (
          <p className="text-violet-400 font-medium">
            Your KYC verification is complete at the highest level.
          </p>
        );
      case KycStatus.PENDING:
        return (
          <p className="text-blue-400 font-medium">
            Your KYC verification is pending approval. We'll notify you once it's processed.
          </p>
        );
      case KycStatus.REJECTED:
        return (
          <Button onClick={onStartBasicKyc} className="w-full bg-violet-700 hover:bg-violet-600 text-white">
            Resubmit KYC
          </Button>
        );
      default:
        return (
          <Button onClick={onStartBasicKyc} className="w-full bg-violet-700 hover:bg-violet-600 text-white">
            Start Basic KYC
          </Button>
        );
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto bg-black border-violet-900 shadow-lg shadow-violet-900/20 text-gray-200">
      <CardHeader className="border-b border-violet-900/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">KYC Verification Status</CardTitle>
          {renderStatusBadge()}
        </div>
        <CardDescription className="text-gray-400">
          Know Your Customer verification is required to invest in startups.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4 mb-4">
          {renderStatusIcon()}
          <div>
            <h3 className="font-medium text-white">Current Status</h3>
            <p className="text-gray-300">{getKycStatusText()}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Basic Verification</span>
            {hasCompletedKyc(KycLevel.BASIC) ? (
              <CheckCircle className="h-5 w-5 text-violet-400" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-600" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Advanced Verification</span>
            {hasCompletedKyc(KycLevel.ADVANCED) ? (
              <CheckCircle className="h-5 w-5 text-violet-400" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-600" />
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-violet-900/50 pt-4">
        {renderNextSteps()}
      </CardFooter>
    </Card>
  );
};