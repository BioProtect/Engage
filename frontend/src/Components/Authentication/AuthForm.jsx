import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  InputAdornment,
  IconButton,
  Alert,
  Tabs,
  Tab,
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

const AuthForm = ({ onSuccess }) => {
  const { login, signup } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { showSnackbar } = useMapContext();

  const isLogin = tabIndex === 0;
  const iconBlue = "#2196f3";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
        showSnackbar(username + " has signed up , please log in!");
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    }
  };

  return (
    <Box sx={{ width: 320, px: 0, py: 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
          color: iconBlue,
          fontWeight: "bold",
          fontSize: 24,
          justifyContent: "center",
        }}
      >
        {isLogin ? (
          <LoginIcon fontSize="large" />
        ) : (
          <HowToRegIcon fontSize="large" />
        )}
        <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
          {isLogin ? "Login" : "Sign Up"}
        </Typography>
      </Box>

      <Tabs
        value={tabIndex}
        onChange={(_, newValue) => {
          setError("");
          setSuccess("");
          setUsername("");
          setPassword("");
          setTabIndex(newValue);
        }}
        centered
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab
          label="Login"
          icon={<LoginIcon />}
          iconPosition="start"
          sx={{ fontWeight: "bold" }}
        />
        <Tab
          label="Sign Up"
          icon={<HowToRegIcon />}
          iconPosition="start"
          sx={{ fontWeight: "bold" }}
        />
      </Tabs>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{ backgroundColor: "rgba(255 0 0 / 0.15)" }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{ backgroundColor: "rgba(0 128 0 / 0.15)" }}
          >
            {success}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            variant="filled"
            inputProps={isLogin ? {} : { maxLength: 10 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: iconBlue, fontSize: 26 }} />
                </InputAdornment>
              ),
              endAdornment: username ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Clear username"
                    onClick={() => setUsername("")}
                    size="small"
                    sx={{ color: "#fff" }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
              disableUnderline: true,
            }}
            InputLabelProps={{
              sx: { color: "#fff", fontWeight: "bold" },
            }}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.25)",
              borderRadius: 1,
              input: { color: "#fff", fontWeight: "600" },
              "& .MuiInputAdornment-root svg": { color: iconBlue },
            }}
          />

          {/* Character Counter Underneath */}
          {!isLogin && (
            <Typography
              variant="caption"
              sx={{
                color: "#ccc",
                fontWeight: "bold",
                mt: 0.5,
                ml: 0.5,
              }}
            >
              {username.length}/10
            </Typography>
          )}
        </Box>

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={isLogin ? "current-password" : "new-password"}
          variant="filled"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOpenIcon sx={{ color: iconBlue, fontSize: 26 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {password && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Clear password"
                      onClick={() => setPassword("")}
                      size="small"
                      sx={{ color: "#fff" }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )}
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                    size="small"
                    sx={{ color: iconBlue }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              </>
            ),
            disableUnderline: true,
          }}
          InputLabelProps={{
            sx: { color: "#fff", fontWeight: "bold" },
          }}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            borderRadius: 1,
            input: { color: "#fff", fontWeight: "600" },
            "& .MuiInputAdornment-root svg": { color: iconBlue },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          startIcon={
            isLogin ? (
              <LoginIcon sx={{ fontSize: 28, color: "#fff" }} />
            ) : (
              <HowToRegIcon sx={{ fontSize: 28, color: "#fff" }} />
            )
          }
          sx={{
            mt: 1,
            fontWeight: "bold",
          }}
        >
          {isLogin ? "Login" : "Sign Up"}
        </Button>
      </Box>
    </Box>
  );
};

export default AuthForm;
