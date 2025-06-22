"use client";
import { useEffect } from "react";

export default function QRVerified() {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (Window !== undefined) {
                window.location.href = "/";
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">QR Code Verified!</h1>
            <p>You’ll be redirected back to the home page in 5 seconds.</p>
        </div>
    );
}
