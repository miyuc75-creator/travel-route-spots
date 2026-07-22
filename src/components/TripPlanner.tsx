"use client";

import { useState } from "react";

import { RouteResults } from "@/components/RouteResults";
import { RouteSearchForm } from "@/components/RouteSearchForm";
import type { ValidatedRouteSearch } from "@/types/location";

type TripPlannerProps = {
  disabled?: boolean;
};

export function TripPlanner({ disabled = false }: TripPlannerProps) {
  const [validatedRoute, setValidatedRoute] = useState<ValidatedRouteSearch | null>(
    null,
  );

  return (
    <>
      <RouteSearchForm
        disabled={disabled}
        onValidated={setValidatedRoute}
      />

      {validatedRoute && <RouteResults validatedRoute={validatedRoute} />}
    </>
  );
}
