"use client";
import { useState, useEffect } from "react";
import { getWrappedData } from "@/pages/companion/wrapped/getWrappedData";

const STORAGE_KEY = "wrapped_data_cache";
const CACHE_VERSION_KEY = "wrapped_data_cache_version";
const CURRENT_CACHE_VERSION = "3"; // Increment this to invalidate all old caches

export type WrappedData = Awaited<ReturnType<typeof getWrappedData>>;

/**
 * Custom hook that fetches wrapped data once and caches it in sessionStorage.
 * Subsequent calls will use the cached data until the session ends.
 */
export const useWrappedData = (forceRefresh: boolean = false) => {
  const [data, setData] = useState<WrappedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // If forceRefresh is true, skip cache and fetch fresh data
      // This is used on the start page to ensure fresh data for the wrapped flow
      if (forceRefresh) {
        setIsLoading(true);
        setError(null);
        try {
          const wrappedData = await getWrappedData();
          setData(wrappedData);
          
          // Cache in sessionStorage with current version
          // This ensures subsequent pages in the flow use the fresh cached data
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(STORAGE_KEY, JSON.stringify(wrappedData));
              sessionStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
            } catch (storageError) {
              console.warn("Could not save to sessionStorage:", storageError);
            }
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to fetch wrapped data";
          setError(errorMessage);
          console.error("Error fetching wrapped data:", err);
        } finally {
          setIsLoading(false);
        }
        return;
      }
      // Check sessionStorage first (with Safari mobile error handling)
      if (typeof window !== "undefined") {
        try {
          // Check cache version first - if version doesn't match, clear old cache
          const cachedVersion = sessionStorage.getItem(CACHE_VERSION_KEY);
          if (cachedVersion !== CURRENT_CACHE_VERSION) {
            // Cache version mismatch - clear old cache
            try {
              sessionStorage.removeItem(STORAGE_KEY);
              sessionStorage.removeItem(CACHE_VERSION_KEY);
            } catch (storageError) {
              console.warn("Could not clear old cache:", storageError);
            }
          } else {
            // Version matches, check for cached data
            const cached = sessionStorage.getItem(STORAGE_KEY);
            if (cached) {
              try {
                const parsedData = JSON.parse(cached) as WrappedData;
                // Validate that the cached data has the expected structure
                if (parsedData && typeof parsedData === "object" && "totalAttendees" in parsedData) {
                  setData(parsedData);
                  setIsLoading(false);
                  return;
                } else {
                  // Invalid data structure, clear cache
                  try {
                    sessionStorage.removeItem(STORAGE_KEY);
                    sessionStorage.removeItem(CACHE_VERSION_KEY);
                  } catch (storageError) {
                    console.warn("Could not clear invalid cache:", storageError);
                  }
                }
              } catch (e) {
                // Invalid cache, clear it
                try {
                  sessionStorage.removeItem(STORAGE_KEY);
                  sessionStorage.removeItem(CACHE_VERSION_KEY);
                } catch (storageError) {
                  console.warn("Could not clear sessionStorage:", storageError);
                }
              }
            }
          }
        } catch (storageError) {
          // Safari mobile in private mode throws errors when accessing sessionStorage
          // Just continue to fetch fresh data
          console.warn("sessionStorage not available (possibly Safari private mode):", storageError);
        }
      }

      // Fetch if no cache
      setIsLoading(true);
      setError(null);
      try {
        const wrappedData = await getWrappedData();
        setData(wrappedData);
        
        // Cache in sessionStorage (with error handling for Safari)
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(wrappedData));
            sessionStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
          } catch (storageError) {
            // Safari mobile in private mode or storage quota exceeded
            console.warn("Could not save to sessionStorage:", storageError);
            // Data is still set in state, just not cached
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch wrapped data";
        setError(errorMessage);
        console.error("Error fetching wrapped data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [forceRefresh]);

  const clearCache = () => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(CACHE_VERSION_KEY);
      } catch (storageError) {
        console.warn("Could not clear sessionStorage:", storageError);
      }
    }
    setData(null);
  };

  return { data, isLoading, error, clearCache };
};

