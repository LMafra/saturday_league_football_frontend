export interface Championship {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  rounds?: Round[];
  players?: Player[];
}

export interface Round {
  id: string;
  name: string;
  round_date: string;
  championship_id: string;
  created_at: string;
  updated_at: string;
  matches?: Match[];
  players?: Player[];
}

export interface Player {
  id: string;
  name: string;
  position?: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  name: string;
  team_1: Team;
  team_2: Team;
  team_1_goals: number;
  team_2_goals: number;
  winning_team: string | null;
  draw: boolean;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
}
