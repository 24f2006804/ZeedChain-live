import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AIAdvice {
  recommendation: string;
  confidenceScore: number;
  timestamp: number;
}

interface AIAdvisorProps {
  startupId?: number;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ startupId }) => {
  const { web3Service, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [currentAdvice, setCurrentAdvice] = useState<AIAdvice | null>(null);
  const [historicalAdvice, setHistoricalAdvice] = useState<AIAdvice[]>([]);

  // Fetch existing advice when component mounts or startupId changes
  useEffect(() => {
    if (web3Service?.contracts.aiAdvisor && startupId) {
      fetchAdviceHistory();
    }
  }, [web3Service?.contracts.aiAdvisor, startupId]);

  const fetchAdviceHistory = async () => {
    try {
      if (!startupId) return;
      const history = await web3Service?.contracts.aiAdvisor.getAllAdvice(startupId);
      if (history && history.length > 0) {
        const formattedHistory = history.map(advice => ({
          recommendation: advice.recommendation,
          confidenceScore: Number(advice.confidenceScore),
          timestamp: Number(advice.timestamp)
        }));
        setHistoricalAdvice(formattedHistory);
        setCurrentAdvice(formattedHistory[formattedHistory.length - 1]);
      }
    } catch (error) {
      console.error('Error fetching advice history:', error);
    }
  };

  const requestAdvice = async () => {
    if (!web3Service?.contracts.aiAdvisor || !startupId) {
      toast.error('AI Advisor service not available');
      return;
    }

    try {
      setLoading(true);
      const tx = await web3Service.contracts.aiAdvisor.requestAIAdvice(startupId);
      await tx.wait();
      
      // Set up event listeners
      const adviceReceivedFilter = web3Service.contracts.aiAdvisor.filters.AdviceReceived(startupId);
      const requestFailedFilter = web3Service.contracts.aiAdvisor.filters.RequestFailed();
      
      const cleanup = () => {
        web3Service.contracts.aiAdvisor?.removeAllListeners(adviceReceivedFilter);
        web3Service.contracts.aiAdvisor?.removeAllListeners(requestFailedFilter);
      };

      web3Service.contracts.aiAdvisor.once(adviceReceivedFilter, 
        (startupIdEvent, recommendation, confidenceScore) => {
          if (startupIdEvent === startupId) {
            const newAdvice = {
              recommendation,
              confidenceScore: Number(confidenceScore),
              timestamp: Date.now() / 1000
            };
            setCurrentAdvice(newAdvice);
            setHistoricalAdvice(prev => [...prev, newAdvice]);
            toast.success('New advice received');
            cleanup();
          }
        }
      );

      web3Service.contracts.aiAdvisor.once(requestFailedFilter,
        (requestId, reason) => {
          toast.error(`Analysis failed: ${reason}`);
          cleanup();
        }
      );

      toast.success('Analysis request submitted');
    } catch (error) {
      console.error('Error requesting advice:', error);
      toast.error('Failed to request analysis');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Advisor</CardTitle>
        <CardDescription>Get AI-powered insights and recommendations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <p className="text-sm text-muted-foreground">Connect your wallet to use the AI Advisor</p>
        ) : (
          <>
            <Button 
              onClick={requestAdvice} 
              disabled={loading || !startupId}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Request Analysis'
              )}
            </Button>

            {currentAdvice && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Latest Analysis</h3>
                  <p className="whitespace-pre-wrap mb-2">{currentAdvice.recommendation}</p>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Confidence Score: {currentAdvice.confidenceScore}%</span>
                    <span>{formatDate(currentAdvice.timestamp)}</span>
                  </div>
                </div>

                {historicalAdvice.length > 1 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Previous Analyses</h3>
                    {historicalAdvice.slice(0, -1).reverse().map((advice, idx) => (
                      <div key={idx} className="rounded-lg border p-4">
                        <p className="whitespace-pre-wrap mb-2">{advice.recommendation}</p>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Confidence Score: {advice.confidenceScore}%</span>
                          <span>{formatDate(advice.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAdvisor;