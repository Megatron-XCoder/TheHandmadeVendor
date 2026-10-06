"use client";

import React from "react";
import ErrorComponent from "@/components/Error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorComponent />;
}
