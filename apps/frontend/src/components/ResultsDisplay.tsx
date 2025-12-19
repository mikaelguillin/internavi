import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@internavi/ui";
import type { School, QuizMatchResponse } from "@internavi/shared";

interface MatchInfo {
  school_id: number;
  match_score: number;
  match_reasons: string[];
}

function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercentage(rate: number | null | undefined): string {
  if (rate === null || rate === undefined) return "N/A";
  return `${(rate * 100).toFixed(1)}%`;
}

export default function ResultsDisplay() {
  const [results, setResults] = useState<QuizMatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get results from session storage
    const resultsData = sessionStorage.getItem("quizResults");
    if (resultsData) {
      try {
        const parsed = JSON.parse(resultsData);
        setResults(parsed);
      } catch (err) {
        setError("Failed to parse results data");
      }
    } else {
      setError("No results found. Please complete the quiz first.");
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/quiz" className="inline-block">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Take Quiz Again
            </button>
          </a>
        </CardContent>
      </Card>
    );
  }

  if (!results || !results.schools || results.schools.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>No Results</CardTitle>
          <CardDescription>
            No schools matched your criteria. Try adjusting your preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/quiz" className="inline-block">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Take Quiz Again
            </button>
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {results.schools.map((school, index) => {
        const matchInfo = (results as any).matches?.[index] as
          | MatchInfo
          | undefined;
        return (
          <Card key={school.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{school.name}</CardTitle>
                  <CardDescription className="text-base">
                    {school.city && school.state
                      ? `${school.city}, ${school.state}`
                      : school.state || school.city || "Location not specified"}
                  </CardDescription>
                </div>
                {matchInfo && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {matchInfo.match_score}%
                    </div>
                    <div className="text-sm text-muted-foreground">Match</div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Tuition
                  </div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(school.tuition_in_state)}
                  </div>
                  {school.tuition_out_of_state &&
                    school.tuition_out_of_state !== school.tuition_in_state && (
                      <div className="text-xs text-muted-foreground">
                        Out-of-state:{" "}
                        {formatCurrency(school.tuition_out_of_state)}
                      </div>
                    )}
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Admission Rate
                  </div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(school.admission_rate)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Student Size
                  </div>
                  <div className="text-lg font-semibold">
                    {school.student_size
                      ? school.student_size.toLocaleString()
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Completion Rate
                  </div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(school.completion_rate)}
                  </div>
                </div>
              </div>

              {matchInfo &&
                matchInfo.match_reasons &&
                matchInfo.match_reasons.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm font-medium mb-2">
                      Why this match:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {matchInfo.match_reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {school.website && (
                <div className="mt-4">
                  <a
                    href={school.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    Visit Website →
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
