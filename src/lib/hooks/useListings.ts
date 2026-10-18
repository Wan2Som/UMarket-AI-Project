"use client";

import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "../firebase";
import { subscribeToListings, subscribeToSellerListings, subscribeToSoldListings } from "../firestore";
import { demoListings } from "../demoData";
import type { Listing } from "../types";

export interface ListingsState {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  /** True when showing sample data because Firebase isn't configured. */
  demo: boolean;
}

function friendlyError(err: Error): string {
  if (err.message.includes("permission")) return "The database refused the request. Check that firestore.rules is deployed.";
  if (err.message.includes("index")) return "Firestore needs an index for this query. Open the browser console for the link to create it.";
  return "Lost connection to the marketplace. It will reconnect automatically.";
}

/** Real-time marketplace feed via Firestore onSnapshot. */
export function useListings(): ListingsState {
  const [state, setState] = useState<ListingsState>({ listings: [], loading: true, error: null, demo: false });

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setState({ listings: demoListings(), loading: false, error: null, demo: true });
      return;
    }
    return subscribeToListings(
      (listings) => setState({ listings, loading: false, error: null, demo: false }),
      (err) => setState((s) => ({ ...s, loading: false, error: friendlyError(err) })),
    );
  }, []);

  return state;
}

/** The signed-in seller's own listings. */
export function useSellerListings(uid: string | null): ListingsState {
  const [state, setState] = useState<ListingsState>({ listings: [], loading: true, error: null, demo: false });

  useEffect(() => {
    if (!uid || !isFirebaseConfigured) {
      setState({ listings: [], loading: false, error: null, demo: !isFirebaseConfigured });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    return subscribeToSellerListings(
      uid,
      (listings) => setState({ listings, loading: false, error: null, demo: false }),
      (err) => setState((s) => ({ ...s, loading: false, error: friendlyError(err) })),
    );
  }, [uid]);

  return state;
}

/** All sold listings, for the community impact counter. */
export function useSoldListings(): Listing[] {
  const [sold, setSold] = useState<Listing[]>([]);
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setSold(demoListings().filter((l) => l.status === "sold"));
      return;
    }
    return subscribeToSoldListings(setSold, (err) => console.error("Impact feed:", err));
  }, []);
  return sold;
}
