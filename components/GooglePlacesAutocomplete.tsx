"use client";

import { useEffect, useRef } from "react";
import {
  importLibrary,
  setOptions,
} from "@googlemaps/js-api-loader";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

let googleLoaderConfigured = false;

export default function GooglePlacesAutocomplete({
  value,
  onChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const autocompleteRef =
    useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error(
        "Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local"
      );
      return;
    }

    if (!googleLoaderConfigured) {
      setOptions({
        key: apiKey,
        v: "weekly",
      });

      googleLoaderConfigured = true;
    }

    let cancelled = false;

    async function initializeAutocomplete() {
      try {
        const { PlaceAutocompleteElement } =
          (await importLibrary(
            "places"
          )) as google.maps.PlacesLibrary;

        if (cancelled || !containerRef.current) return;

        const autocomplete = new PlaceAutocompleteElement({
          placeholder: "Event Address",
          value,
        });

        autocomplete.includedRegionCodes = ["us"];

        autocomplete.style.width = "395px";
        autocomplete.style.fontSize = "24px";
        autocomplete.style.color = "#111111";
        autocomplete.style.backgroundColor = "transparent";
        autocomplete.style.border = "none";
        autocomplete.style.borderRadius = "0";

        autocomplete.addEventListener(
          "gmp-select",
          async (event: Event) => {
            const selectEvent =
              event as google.maps.places.PlacePredictionSelectEvent;

            const place = selectEvent.placePrediction.toPlace();

            await place.fetchFields({
              fields: ["formattedAddress", "displayName"],
            });

            const selectedAddress =
              place.formattedAddress ||
              place.displayName ||
              autocomplete.value;

            autocomplete.value = selectedAddress;

            onChange(selectedAddress);
          }
        );

        autocomplete.addEventListener("input", () => {
          onChange(autocomplete.value);
        });

        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(autocomplete);

        autocompleteRef.current = autocomplete;
      } catch (error) {
        console.error(
          "Failed to initialize Google Places autocomplete:",
          error
        );
      }
    }

    initializeAutocomplete();

    return () => {
      cancelled = true;

      if (autocompleteRef.current) {
        autocompleteRef.current.remove();
        autocompleteRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (
      autocompleteRef.current &&
      autocompleteRef.current.value !== value
    ) {
      autocompleteRef.current.value = value;
    }
  }, [value]);

  return (
    <div
      style={{
        width: "395px",
        borderBottom: "1px solid #b8b8b8",
        paddingBottom: "8px",
      }}
    >
      <div ref={containerRef} />
    </div>
  );
}