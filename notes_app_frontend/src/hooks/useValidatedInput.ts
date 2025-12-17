"use client";

import { useState } from "react";

export function useValidatedInput (
    validate?: (value: string) => string | null
) {
    // === State === //
    const [value, setValue] = useState(""); // Raw input value (exactly what the user typed)
    const [error, setError] = useState<string | null>(null); // Validation error message (null = no error)

    // === Derived values === //
    const trimmed = value.trim(); // Trimmed value (useful for required checks / submit)

    // === Derived state === //
    const isEmpty = trimmed.length === 0; // True if trimmed value is empty
    const isValid = !error && !isEmpty; // True if non-empty and no validation error

    // === Handler: Update value + validate === //
    function onChange(nextValue: string) {
        setValue(nextValue); // Update raw value in state

        // If a validate function is provided, run it and store the result
        if (validate) {
            setError(validate(nextValue)); // Validator returns string (error) or null (valid)
        } else {
            setError(null); // No validator → treat as no error
        }
    }
    
    // === Helper: Reset input back to initial state === //
    function reset() {
        setValue(""); // Clear value
        setError(null); // Clear error
    }

    // === Return API === //
    return {
        value,      // Raw value
        trimmed,    // Trimmed value
        error,      // Validation error (or null)
        isEmpty,    // Is the trimmed value empty?
        isValid,    // Is non-empty + no error?
        setError,   // Manual error control (e.g., server-side validation)
        onChange,   // Update value and run validation
        reset,      // Clear value and error
    };
}