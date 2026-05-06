import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  InputAdornment,
  IconButton,
  Alert,
  Typography,
} from "@mui/material";
import { useAuth } from "../../Contexts/AuthenticationContext";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import { useMapContext } from "../../Contexts/MapContext";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    background: "rgba(255,255,255,0.25)",
    backdropFilter: "blur(8px)",
    fontSize: "0.9rem",
    "& fieldset": { borderColor: "rgba(255,255,255,0.45)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.7)" },
    "&.Mui-focused fieldset": { borderColor: "rgba(25,118,210,0.5)" },
  },
};

const AuthForm = ({ onSuccess }) => {
  const { login, signup } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showSnackbar } = useMapContext();

  const isLogin = tabIndex === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
        onSuccess?.();
        showSnackbar(username + " has logged in!");
      } else {
        await signup(username, password);
        setSuccess("Sign-up successful! Please log in.");
        setUsername("");
        setPassword("");
        setTabIndex(0);
        showSnackbar(username + " has signed up, please log in!");
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (index) => {
    setError("");
    setSuccess("");
    setUsername("");
    setPassword("");
    setTabIndex(index);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            mb: 1.5,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(25,118,210,0.15), rgba(25,118,210,0.25))",
            border: "1.5px solid rgba(25,118,210,0.25)",
            boxShadow: "0 4px 12px rgba(25,118,210,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isLogin ? (
            <LoginIcon sx={{ fontSize: 30, color: "#1976d2" }} />
          ) : (
            <HowToRegIcon sx={{ fontSize: 30, color: "#1976d2" }} />
          )}
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ color: "#1a1a2e" }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "rgba(0,0,0,0.45)", mt: 0.3, fontSize: "0.82rem" }}
        >
          {isLogin ? "Sign in to your account" : "Register a new account"}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          background: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.5)",
          borderRadius: "12px",
          p: "4px",
          mb: 2.5,
        }}
      >
        {[
          { label: "Login", icon: <LoginIcon sx={{ fontSize: 16 }} /> },
          { label: "Sign Up", icon: <HowToRegIcon sx={{ fontSize: 16 }} /> },
        ].map(({ label, icon }, i) => (
          <Box
            key={label}
            onClick={() => switchTab(i)}
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
              py: 0.9,
              borderRadius: "9px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.82rem",
              transition: "all 0.2s ease",
              userSelect: "none",
              ...(tabIndex === i
                ? {
                    background: "rgba(25,118,210,0.85)",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(25,118,210,0.35)",
                  }
                : { color: "rgba(0,0,0,0.5)" }),
            }}
          >
            {icon}
            {label}
          </Box>
        ))}
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{
              borderRadius: 2,
              py: 0.5,
              fontSize: "0.82rem",
              bgcolor: "rgba(244,67,54,0.08)",
              border: "1px solid rgba(244,67,54,0.2)",
              color: "error.main",
              "& .MuiAlert-icon": { color: "error.main" },
            }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{
              borderRadius: 2,
              py: 0.5,
              fontSize: "0.82rem",
              bgcolor: "rgba(56,142,60,0.08)",
              border: "1px solid rgba(56,142,60,0.2)",
            }}
          >
            {success}
          </Alert>
        )}

        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mb: 0.6,
              ml: 0.5,
            }}
          >
            <PersonIcon sx={{ fontSize: 13, color: "rgba(0,0,0,0.4)" }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "rgba(0,0,0,0.45)",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontSize: "0.65rem",
              }}
            >
              Username
            </Typography>
          </Box>
          <TextField
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
            size="small"
            autoComplete="username"
            inputProps={isLogin ? {} : { maxLength: 10 }}
            InputProps={{
              endAdornment: username ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setUsername("")}
                    edge="end"
                  >
                    <CloseIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={inputSx}
          />
          {!isLogin && (
            <Typography
              variant="caption"
              sx={{
                color: "rgba(0,0,0,0.35)",
                mt: 0.4,
                ml: 0.5,
                display: "block",
              }}
            >
              {username.length}/10 characters
            </Typography>
          )}
        </Box>

        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mb: 0.6,
              ml: 0.5,
            }}
          >
            <LockOpenIcon sx={{ fontSize: 13, color: "rgba(0,0,0,0.4)" }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "rgba(0,0,0,0.45)",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontSize: "0.65rem",
              }}
            >
              Password
            </Typography>
          </Box>
          <TextField
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size="small"
            autoComplete={isLogin ? "current-password" : "new-password"}
            InputProps={{
              endAdornment: (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {password && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setPassword("")}>
                        <CloseIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </InputAdornment>
                  )}
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      sx={{ color: "rgba(0,0,0,0.4)" }}
                    >
                      {showPassword ? (
                        <VisibilityOff sx={{ fontSize: 18 }} />
                      ) : (
                        <Visibility sx={{ fontSize: 18 }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                </Box>
              ),
            }}
            sx={inputSx}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          startIcon={isLogin ? <LoginIcon /> : <HowToRegIcon />}
          sx={{
            mt: 0.5,
            py: 1.1,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.9rem",
            background: "linear-gradient(135deg, #1976d2, #42a5f5)",
            boxShadow: "0 4px 12px rgba(25,118,210,0.35)",
            "&:hover": {
              background: "linear-gradient(135deg, #1565c0, #1976d2)",
              boxShadow: "0 4px 16px rgba(25,118,210,0.5)",
            },
            "&:disabled": { background: "rgba(0,0,0,0.12)" },
          }}
        >
          {isLoading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </Button>
      </Box>
    </Box>
  );
};

export default AuthForm;
