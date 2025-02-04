export interface Score {
    playerName: string;
    score: number;
    date: string; // ISO string format
  }
  
  export interface GameState {
    isPlaying: boolean;
    currentScore: number;
    gameOver: boolean;
  }