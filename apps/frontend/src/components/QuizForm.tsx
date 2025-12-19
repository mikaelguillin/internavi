import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@internavi/ui";
import type { QuizMatchRequest, School } from "@internavi/shared";

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

export default function QuizForm() {
  const [formData, setFormData] = useState<QuizMatchRequest>({
    study_level: "",
    preferred_location: "",
    budget_range: "",
    program_interest: "",
    admission_preference: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved study level from session storage
  useEffect(() => {
    const savedLevel = sessionStorage.getItem("studyLevel");
    if (savedLevel) {
      setFormData((prev) => ({
        ...prev,
        study_level: savedLevel === "high-school" ? "high school" : savedLevel,
      }));
    }
  }, []);

  const handleChange = (field: keyof QuizMatchRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Store form data in session storage
      sessionStorage.setItem("quizData", JSON.stringify(formData));

      const response = await fetch(`${API_BASE_URL}/api/quiz-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      // Store results in session storage
      sessionStorage.setItem("quizResults", JSON.stringify(data));

      // Redirect to results page
      window.location.href = "/results";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting the quiz"
      );
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return Object.values(formData).every((value) => value !== "");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Matching Quiz</CardTitle>
        <CardDescription>
          Fill out all fields to get the best matches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Study Level */}
          <div className="space-y-2">
            <label htmlFor="study_level" className="text-sm font-medium">
              Study Level *
            </label>
            <Select
              value={formData.study_level}
              onValueChange={(value) => handleChange("study_level", value)}
              required
            >
              <SelectTrigger id="study_level">
                <SelectValue placeholder="Select your study level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high school">High School</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="graduate">Graduate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Location */}
          <div className="space-y-2">
            <label htmlFor="preferred_location" className="text-sm font-medium">
              Preferred Location *
            </label>
            <Select
              value={formData.preferred_location}
              onValueChange={(value) =>
                handleChange("preferred_location", value)
              }
              required
            >
              <SelectTrigger id="preferred_location">
                <SelectValue placeholder="Select preferred location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Location</SelectItem>
                <SelectItem value="urban">Urban</SelectItem>
                <SelectItem value="suburban">Suburban</SelectItem>
                <SelectItem value="rural">Rural</SelectItem>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                <SelectItem value="IL">Illinois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <label htmlFor="budget_range" className="text-sm font-medium">
              Budget Range *
            </label>
            <Select
              value={formData.budget_range}
              onValueChange={(value) => handleChange("budget_range", value)}
              required
            >
              <SelectTrigger id="budget_range">
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low ($0 - $15,000/year)</SelectItem>
                <SelectItem value="medium">
                  Medium ($15,000 - $35,000/year)
                </SelectItem>
                <SelectItem value="high">High ($35,000+/year)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Program Interest */}
          <div className="space-y-2">
            <label htmlFor="program_interest" className="text-sm font-medium">
              Program Interest *
            </label>
            <Input
              id="program_interest"
              type="text"
              placeholder="e.g., Computer Science, Business, Engineering"
              value={formData.program_interest}
              onChange={(e) => handleChange("program_interest", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter your field of study interest (or "any" for all programs)
            </p>
          </div>

          {/* Admission Preference */}
          <div className="space-y-2">
            <label
              htmlFor="admission_preference"
              className="text-sm font-medium"
            >
              Admission Preference *
            </label>
            <Select
              value={formData.admission_preference}
              onValueChange={(value) =>
                handleChange("admission_preference", value)
              }
              required
            >
              <SelectTrigger id="admission_preference">
                <SelectValue placeholder="Select admission preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="selective">
                  Selective (&lt;50% acceptance)
                </SelectItem>
                <SelectItem value="moderate">
                  Moderate (30-70% acceptance)
                </SelectItem>
                <SelectItem value="open">Open (&gt;70% acceptance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="flex-1"
              size="lg"
            >
              {isSubmitting ? "Finding Matches..." : "Find My Schools"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              size="lg"
            >
              Back
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
