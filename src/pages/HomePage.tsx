import { useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { playerNameAtom, highScoresAtom } from "../store/atoms";
import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Box,
  Paper,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import backgroundImage from "../assets/flappy-bird-assets/sprites/background-day.png";

// 自定義動畫按鈕
const AnimatedButton = styled(Button)`
  transition: all 0.3s ease-in-out;
  &:hover {
    transform: scale(1.05);
  }
`;

// 自定義遊戲標題
const GameTitle = styled(Typography)`
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: bounce 2s infinite;
  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

export function HomePage() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useAtom(playerNameAtom);
  const [highScores] = useAtom(highScoresAtom);
  const [openHighScores, setOpenHighScores] = useState(false);

  const handleStartGame = () => {
    if (playerName) {
      navigate({ to: "/game" });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `url(${backgroundImage})`,
        backgroundSize: 'contain', // 裁切圖片
        backgroundColor: "#4EC0CA", // 原始 Flappy Bird 的背景色
        backgroundRepeat: "repeat", // Flappy Bird 的背景是重複的
        display: "flex",
        alignItems: "center",
        position: "relative",
        "&::before": {
          // 添加一個微妙的漸層覆蓋
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(0,0,0,0.1))",
          pointerEvents: "none", // 確保不會影響點擊事件
        },
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: 4,
          }}
        >
          <GameTitle variant="h2" gutterBottom>
            Flappy Bird
            <VideogameAssetIcon sx={{ ml: 2, fontSize: 40 }} />
          </GameTitle>

          <Box sx={{ my: 4 }}>
            <TextField
              fullWidth
              label="Player Name"
              variant="outlined"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Stack
              direction="row"
              spacing={2}
              sx={{
                width: "100%",
                justifyContent: "center",
              }}
            >
              <AnimatedButton
                variant="contained"
                size="large"
                disabled={!playerName}
                onClick={handleStartGame}
                sx={{
                  width: 200, // 固定寬度
                  backgroundColor: "#FFB300",
                  "&:hover": {
                    backgroundColor: "#FFA000",
                  },
                }}
              >
                Start Game
              </AnimatedButton>

              <AnimatedButton
                variant="outlined"
                size="large" // 添加相同的 size
                onClick={() => setOpenHighScores(true)}
                startIcon={<EmojiEventsIcon />}
                sx={{
                  width: 200, // 相同的寬度
                }}
              >
                High Scores
              </AnimatedButton>
            </Stack>
          </Box>
        </Paper>

        <Dialog
          open={openHighScores}
          onClose={() => setOpenHighScores(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: "center" }}>
            <EmojiEventsIcon sx={{ mr: 1 }} />
            High Scores
          </DialogTitle>
          <DialogContent>
            <List>
              {highScores.length > 0 ? (
                highScores
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 5)
                  .map((score, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        bgcolor:
                          index === 0
                            ? "rgba(255, 215, 0, 0.1)"
                            : "transparent",
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6">
                            {index + 1}. {score.playerName}
                          </Typography>
                        }
                        secondary={`Score: ${score.score}`}
                      />
                    </ListItem>
                  ))
              ) : (
                <Typography variant="body1" sx={{ textAlign: "center", py: 2 }}>
                  No scores yet. Be the first to play!
                </Typography>
              )}
            </List>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}
