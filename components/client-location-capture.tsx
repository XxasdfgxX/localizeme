"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  slug: string;
  topic: string;
};

type ApiResult = {
  topic: string;
  topicLabel: string;
  mapsUrl: string;
  success: boolean;
};

export function ClientLocationCapture({ slug, topic }: Props) {
  const [status, setStatus] = useState("Preparing secure location request...");
  const [loading, setLoading] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [mapsUrl, setMapsUrl] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const hasRequestedRef = useRef(false);

  async function submitLocation(position: GeolocationPosition) {
    const payload = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracyMeters: position.coords.accuracy
    };

    const response = await fetch(`/api/go/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as ApiResult | { error: string };

    if (!response.ok) {
      throw new Error((data as { error: string }).error ?? "Failed to process location.");
    }

    const okData = data as ApiResult;
    if (okData.success) {
      setCoords({ latitude: payload.latitude, longitude: payload.longitude });
      setMapsUrl(okData.mapsUrl);
      setStatus("Location captured successfully. You can now view nearby matches in Google Maps.");
    } else {
      setStatus("Location submitted.");
    }
  }

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      setStatus("Geolocation is not supported in this browser.");
      setCanRetry(true);
      return;
    }

    setLoading(true);
    setCanRetry(false);
    setMapsUrl(null);
    setStatus("Requesting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await submitLocation(position);
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Failed to submit location.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("Permission denied. Enable location and try again.");
          setCanRetry(true);
          return;
        }
        setStatus("Could not retrieve location.");
        setCanRetry(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  useEffect(() => {
    if (hasRequestedRef.current) {
      return;
    }
    hasRequestedRef.current = true;
    setStatus("Requesting your location...");
    requestLocation();
  }, []);

  return (
    <section className="capture-shell">
      <article className="capture-card">
        <p className="capture-eyebrow">Location Request</p>
        <h1>Finding nearby {topic.toLowerCase()}</h1>
        <p className="capture-note">
          This page automatically asks for location permission. Once granted, your location is saved and we build a
          nearby search link.
        </p>

        <div className="capture-status">{status}</div>

        {coords ? (
          <div className="capture-coords">
            <span>Lat: {coords.latitude.toFixed(6)}</span>
            <span>Lng: {coords.longitude.toFixed(6)}</span>
          </div>
        ) : null}

        <div className="capture-actions">
          {mapsUrl ? (
            <a className="button" href={mapsUrl} target="_blank" rel="noreferrer">
              Open Nearby In Google Maps
            </a>
          ) : null}

          {canRetry ? (
            <button className="button button-muted" disabled={loading} onClick={requestLocation}>
              {loading ? "Working..." : "Try again"}
            </button>
          ) : null}
        </div>

        <p className="capture-footnote">
          Link: <code>{slug}</code>. Location data is logged for the owner of this link.
        </p>
      </article>
    </section>
  );
}
