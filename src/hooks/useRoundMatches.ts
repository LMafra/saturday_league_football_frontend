import { useCallback, useEffect, useState } from "react";
import { Match } from "../types";

export function useRoundMatches(teamMatches: Match[] | undefined) {
  const [detailedRoundMatches, setDetailedRoundMatches] = useState<Match[]>([]);

  const fetchDetailedMatches = useCallback(async () => {
    if (!teamMatches) {
      setDetailedRoundMatches([]);
      return;
    }

    // Simply return all team matches - let PlayerCard handle the filtering
    setDetailedRoundMatches(teamMatches);
  }, [teamMatches]);

  useEffect(() => {
    fetchDetailedMatches();
  }, [fetchDetailedMatches]);

  return { detailedRoundMatches };
}


