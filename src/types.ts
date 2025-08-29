export interface Championship {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  round_total: number;
  total_players: number;
  rounds?: Round[];
  players?: Player[];
}

export interface Round {
  id: number;
  name: string;
  round_date: string;
  championship_id: number;
  created_at: string;
  updated_at: string;
  matches?: Match[];
  players?: Player[];
  teams?: Team[];
}

export interface Player {
  id: number;
  name: string;
  position?: string;
  created_at: string;
  updated_at: string;
  total_goals: number;
  total_assists: number;
  total_own_goals: number;
  rounds?: Round[];
  player_stats?: PlayerStat[];
}

export interface PlayerStat {
  id: number;
  goals: number;
  own_goals: number;
  assists: number;
  was_goalkeeper: boolean;
  match_id: number;
  team_id: number;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: number;
  name: string;
  round_id: number;
  team_1: Team;
  team_2: Team;
  team_1_players: Player[];
  team_2_players: Player[];
  team_1_goals: number;
  team_1_goals_scorer: Player[];
  team_1_assists: Player[];
  team_1_own_goals_scorer: Player[];
  team_2_goals: number;
  team_2_goals_scorer: Player[];
  team_2_assists: Player[];
  team_2_own_goals_scorer: Player[];
  winning_team: Team | null;
  draw: boolean;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  matches?: Match[];
  players?: Player[];
}
