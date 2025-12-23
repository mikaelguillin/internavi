import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Button,
} from "@internavi/ui";
import type { School, SchoolListResponse } from "@internavi/shared";

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

interface SchoolExplorerProps {
  "initial-schools": string;
  "total-schools": number;
  error: string;
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

export default function SchoolExplorer({
  "initial-schools": initialSchoolsStr,
  "total-schools": totalSchoolsProp,
  error: errorProp,
}: SchoolExplorerProps) {
  const [schools, setSchools] = useState<School[]>(() => {
    try {
      return JSON.parse(initialSchoolsStr);
    } catch {
      return [];
    }
  });
  const [totalSchools, setTotalSchools] = useState(totalSchoolsProp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorProp || null);

  // Filters
  const [state, setState] = useState<string>("all");
  const [schoolType, setSchoolType] = useState<string>("all");
  const [locale, setLocale] = useState<string>("all");
  const [minTuition, setMinTuition] = useState<string>("");
  const [maxTuition, setMaxTuition] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (state && state !== "all") params.append("state", state);
      if (schoolType && schoolType !== "all")
        params.append("school_type", schoolType);
      if (locale && locale !== "all") params.append("locale", locale);
      if (minTuition) params.append("min_tuition", minTuition);
      if (maxTuition) params.append("max_tuition", maxTuition);

      const response = await fetch(`${API_BASE_URL}/api/schools?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SchoolListResponse = await response.json();
      setSchools(data.schools || []);
      setTotalSchools(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [page, sortBy, sortOrder]);

  const handleFilterChange = () => {
    setPage(1); // Reset to first page when filters change
    fetchSchools();
  };

  const totalPages = Math.ceil(totalSchools / pageSize);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Sorting</CardTitle>
          <CardDescription>
            Filter and sort schools to find your perfect match
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="IL">Illinois</SelectItem>
                  <SelectItem value="PA">Pennsylvania</SelectItem>
                  <SelectItem value="OH">Ohio</SelectItem>
                  <SelectItem value="GA">Georgia</SelectItem>
                  <SelectItem value="NC">North Carolina</SelectItem>
                  <SelectItem value="MI">Michigan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">School Type</label>
              <Select value={schoolType} onValueChange={setSchoolType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Locale</label>
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locales</SelectItem>
                  <SelectItem value="City">City</SelectItem>
                  <SelectItem value="Suburban">Suburban</SelectItem>
                  <SelectItem value="Rural">Rural</SelectItem>
                  <SelectItem value="Town">Town</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Min Tuition</label>
              <Input
                type="number"
                placeholder="0"
                value={minTuition}
                onChange={(e) => setMinTuition(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Tuition</label>
              <Input
                type="number"
                placeholder="100000"
                value={maxTuition}
                onChange={(e) => setMaxTuition(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="tuition_in_state">Tuition</SelectItem>
                  <SelectItem value="admission_rate">Admission Rate</SelectItem>
                  <SelectItem value="student_size">Student Size</SelectItem>
                  <SelectItem value="completion_rate">
                    Completion Rate
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleFilterChange} disabled={loading}>
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setState("all");
                setSchoolType("all");
                setLocale("all");
                setMinTuition("");
                setMaxTuition("");
                setSortBy("name");
                setSortOrder("asc");
                setPage(1);
                setTimeout(handleFilterChange, 100);
              }}
            >
              Clear Filters
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm font-medium">Order:</label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : loading && schools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading schools...</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground mb-4">
            Showing {schools.length} of {totalSchools} schools
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <Card
                key={school.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-xl">{school.name}</CardTitle>
                  <CardDescription>
                    {school.city && school.state
                      ? `${school.city}, ${school.state}`
                      : school.state || school.city || "Location not specified"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Tuition: </span>
                      {formatCurrency(school.tuition_in_state)}
                    </div>
                    <div>
                      <span className="font-medium">Admission Rate: </span>
                      {formatPercentage(school.admission_rate)}
                    </div>
                    <div>
                      <span className="font-medium">Students: </span>
                      {school.student_size
                        ? school.student_size.toLocaleString()
                        : "N/A"}
                    </div>
                    {school.website && (
                      <div className="pt-2">
                        <a
                          href={school.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          Visit Website →
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
