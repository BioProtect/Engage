import Alert from "@mui/material/Alert";
import BioProtectLogo from "../../images/bioprotect_project_logo.jpeg";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CloseIcon from "@mui/icons-material/Close";
import FormControl from "@mui/material/FormControl";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import LoginIcon from "@mui/icons-material/Login";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../../Contexts/AuthenticationContext";
import { useMapContext } from "../../Contexts/MapContext";
import { useState } from "react";

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
        const res = await login(username, password);
        console.log("res ", res);
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

  return (
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
            bgcolor: "rgba(56,142,60,0.08)",
            border: "1px solid rgba(56,142,60,0.2)",
          }}
        >
          {success}
        </Alert>
      )}
      <Card sx={{ maxWidth: 345 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CardMedia>
            <img
              srcSet={`${BioProtectLogo}`}
              src={`${BioProtectLogo}`}
              alt="bioprotect logo"
              loading="lazy"
            />
          </CardMedia>
        </div>
        <CardContent sx={{ textAlign: "center" }}>
          <Typography gutterBottom variant="h5" component="div">
            Login
          </Typography>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel htmlFor="username">Username</InputLabel>
            <OutlinedInput
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              autoComplete="username"
              inputProps={isLogin ? {} : { maxLength: 18 }}
              endAdornment={
                username ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setUsername("")}
                      edge="end"
                    >
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
            />
          </FormControl>
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
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel htmlFor="password">Password</InputLabel>
            <OutlinedInput
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete={isLogin ? "current-password" : "new-password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </CardContent>
        <CardActions sx={{ justifyContent: "right" }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            startIcon={isLogin ? <LoginIcon /> : <HowToRegIcon />}
            sx={{
              py: 1.1,
              borderRadius: 2,
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
        </CardActions>
      </Card>
    </Box>
  );
};

export default AuthForm;
