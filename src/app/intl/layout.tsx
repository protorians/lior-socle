import React from "react";

export default function IntlLayout({children}: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-6">
            {children}
        </div>
    );
}
