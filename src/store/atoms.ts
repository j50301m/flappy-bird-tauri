import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Score, GameState } from '../types/game';

// 玩家名稱 - 使用 session storage 暫存
export const playerNameAtom = atomWithStorage<string>('playerName', '');

// 最高分數 - 使用 local storage 永久保存
export const highScoresAtom = atomWithStorage<Score[]>('highScores', []);

// 當前遊戲狀態 - 使用普通 atom 因為只需要在運行時保存
export const gameStateAtom = atom<GameState>({
  isPlaying: false,
  currentScore: 0,
  gameOver: false,
});

// 派生 atom - 獲取最高分數
export const topScoreAtom = atom((get) => {
  const scores = get(highScoresAtom);
  if (scores.length === 0) return 0;
  return Math.max(...scores.map(s => s.score));
});

// 添加新分數的輔助函數
export const addScoreAtom = atom(
  null,
  (get, set, newScore: number) => {
    const playerName = get(playerNameAtom);
    const scores = get(highScoresAtom);
    
    const newScoreEntry: Score = {
      playerName,
      score: newScore,
      date: new Date().toISOString()
    };

    // 保持最多10個最高分數
    const newScores = [...scores, newScoreEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    set(highScoresAtom, newScores);
  }
);

// 重置遊戲狀態的輔助函數
export const resetGameAtom = atom(
  null,
  (get, set) => {
    set(gameStateAtom, {
      isPlaying: false,
      currentScore: 0,
      gameOver: false,
    });
  }
);