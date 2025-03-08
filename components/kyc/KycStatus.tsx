import { useKyc } from '../../hooks/useKyc';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle, Clock, AlertCircle, XCircle, RefreshCw } from 'lucide-react';

interface KycStatusProps {
  onStartBasicKyc: () => void;
  onStartAdvancedKyc: () => void;
}

export const KycStatus = ({ onStartBasicKyc, onStartAdvancedKyc }: KycStatusProps) => {
  const { kycData, loading, getKycStatusText, KycStatus, KycLevel, hasCompletedKyc, refreshKycData } = useKyc();
  
  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <p>Loading KYC status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const renderStatusIcon = () => {
    if (!kycData) return <AlertCircle className="h-8 w-8 text-gray-400" />;
    
    switch (kycData.status) {
      case KycStatus.APPROVED:
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case KycStatus.PENDING:
        return <Clock className="h-8 w-8 text-yellow-500" />;
      case KycStatus.REJECTED:
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <AlertCircle className="h-8 w-8 text-gray-400" />;
    }
  };
  
  const renderStatusBadge = () => {
    if (!kycData) return <Badge variant="outline">Not Started</Badge>;
    
    switch (kycData.status) {
      case KycStatus.APPROVED:
        return <Badge className="bg-green-500">Approved</Badge>;
      case KycStatus.PENDING:
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case KycStatus.REJECTED:
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };
  
  const renderNextSteps = () => {
    if (!kycData) {
      return (
        <Button onClick={onStartBasicKyc} className="w-full">
          Start Basic KYC
        </Button>
      );
    }
    
    switch (kycData.status) {
      case KycStatus.APPROVED:
        if (kycData.level === KycLevel.BASIC) {
          return (
            <Button onClick={onStartAdvancedKyc} className="w-full">
              Complete Advanced KYC
            </Button>
          );
        }
        return (
          <p className="text-green-500 font-medium">
            Your KYC verification is complete at the highest level.
          </p>
        );
      case KycStatus.PENDING:
        return (
          <p className="text-yellow-500 font-medium">
            Your KYC verification is pending approval. We'll notify you once it's processed.
          </p>
        );
      case KycStatus.REJECTED:
        return (
          <Button onClick={onStartBasicKyc} className="w-full">
            Resubmit KYC
          </Button>
        );
      default:
        return (
          <Button onClick={onStartBasicKyc} className="w-full">
            Start Basic KYC
          </Button>
        );
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>KYC Verification Status</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={refreshKycData} 
              title="Refresh KYC Status"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {renderStatusBadge()}
          </div>
        </div>
        <CardDescription>
          Know Your Customer verification is required to invest in startups.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          {renderStatusIcon()}
          <div>
            <h3 className="font-medium">Current Status</h3>
            <p>{getKycStatusText()}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Basic Verification</span>
            {hasCompletedKyc(KycLevel.BASIC) ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-300" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span>Advanced Verification</span>
            {hasCompletedKyc(KycLevel.ADVANCED) ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-300" />
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {renderNextSteps()}
      </CardFooter>
    </Card>
  );
}; 