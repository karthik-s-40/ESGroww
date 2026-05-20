import { useState, useEffect } from "react";

interface UseFetchAssessmentReturn {
  data: any | null;
  loading: boolean;
  error: string | null;
}

export function useFetchAssessment(): UseFetchAssessmentReturn {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch("/api/assessment");
        if (!response.ok) throw new Error("Failed to fetch assessment");
        const result = await response.json();
        
        if (!mounted) return;
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || "Failed to load assessment");
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
