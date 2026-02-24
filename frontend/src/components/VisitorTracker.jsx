import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const VisitorTracker = () => {
    const location = useLocation();
    const visitIdRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        const logVisit = async () => {
            try {
                startTimeRef.current = Date.now();

                // Anropa Vercel-funktionen som hämtar IP + geo server-side
                const response = await fetch('/api/log-visit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        page_visited: location.pathname,
                        referrer: document.referrer || null,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    visitIdRef.current = data.id;
                }
            } catch (error) {
                // Tyst fel – besöksloggning är icke-kritisk
            }
        };

        const updateDuration = async () => {
            if (visitIdRef.current && startTimeRef.current) {
                const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
                try {
                    await fetch(`/api/update-visit?id=${visitIdRef.current}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ duration_seconds: durationSeconds }),
                    });
                } catch (error) {
                    // Ignorera fel vid sidavstängning
                }
            }
        };

        // Logga besök när sida ändras
        logVisit();

        // Uppdatera besökningstid vid sidstängning (sendBeacon för pålitlig leverans)
        const handleBeforeUnload = () => {
            if (visitIdRef.current && startTimeRef.current) {
                const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
                const data = JSON.stringify({ duration_seconds: durationSeconds });
                navigator.sendBeacon(
                    `/api/update-visit?id=${visitIdRef.current}`,
                    new Blob([data], { type: 'application/json' })
                );
            }
        };

        // Uppdatera även vid flikbyte / minimering
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                updateDuration();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            updateDuration();
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [location.pathname]);

    return null;
};

export default VisitorTracker;
