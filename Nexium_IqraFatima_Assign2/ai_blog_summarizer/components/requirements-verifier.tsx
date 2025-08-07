"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertTriangle, Play, Loader2 } from "lucide-react";

interface VerificationResult {
  component: string;
  requirement: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  data?: Record<string, unknown>;
  icon?: string;
}

interface VerificationReport {
  timestamp: string;
  assignmentRequirements: Record<string, string>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    completionPercentage: number;
  };
  results: VerificationResult[];
  recommendations: string[];
  nextSteps: string[];
}

export function RequirementsVerifier() {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runVerification = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/verify-requirements');
      
      if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'FAIL':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PASS: 'default',
      FAIL: 'destructive',
      WARNING: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Assignment 2 Requirements Verification</CardTitle>
              <p className="text-muted-foreground mt-2">
                Verify MongoDB and Supabase integration according to project specifications
              </p>
            </div>
            <Button 
              onClick={runVerification}
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Verification
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Verification Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {report && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{report.summary.passed}</div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{report.summary.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{report.summary.warnings}</div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{report.summary.completionPercentage}%</div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${report.summary.completionPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Assignment Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Requirements Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(report.assignmentRequirements).map(([requirement, verification]) => (
                  <div key={requirement} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">{requirement}</span>
                    <span className="text-sm text-muted-foreground">{verification}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['MongoDB', 'Supabase', 'Workflow'].map(component => {
                  const componentResults = report.results.filter(r => r.component === component);
                  return (
                    <div key={component} className="space-y-2">
                      <h4 className="font-semibold text-lg">{component} Tests</h4>
                      {componentResults.map((result, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          {getStatusIcon(result.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{result.requirement}</span>
                              {getStatusBadge(result.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{result.details}</p>
                            {result.data && (
                              <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      ))}
                      {component !== 'Workflow' && <Separator />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {report.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground text-center">
            Last verified: {new Date(report.timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
