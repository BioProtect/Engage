import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Button,
  Box,
  Typography,
  Divider,
  Grow,
  InputAdornment,
  Alert,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import NotesIcon from "@mui/icons-material/Notes";
import AbcIcon from "@mui/icons-material/Abc";
import { useAuth } from "../../Contexts/AuthenticationContext";
import { save_drawing_item } from "../../Api/DataMenuApi";
import { generateColor } from "../../generateColor";

const MAX_LENGTHS = { Name: 30, description: 200 };

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    background: "rgba(255,255,255,0.25)",
    backdropFilter: "blur(8px)",
    fontSize: "0.875rem",
    "& fieldset": { borderColor: "rgba(255,255,255,0.45)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.7)" },
    "&.Mui-focused fieldset": { borderColor: "rgba(25,118,210,0.5)" },
  },
};

const FieldLabel = ({ icon, text }) => (
  <Box
    sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.6, ml: 0.5 }}
  >
    {React.cloneElement(icon, {
      sx: { fontSize: 13, color: "rgba(0,0,0,0.4)" },
    })}
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
      {text}
    </Typography>
  </Box>
);

// Controlled by DataMenu, which owns the Add button.
const AddNewItem = ({ open, onClose, onAdd }) => {
  const { isAuthenticated } = useAuth();

  const [newItem, setNewItem] = useState({
    Name: "",
    description: "",
    // Features only: activities come from PAD via ActivityPicker.
    Category: "Features",
  });
  const [errors, setErrors] = useState({
    Name: "",
    description: "",
    Category: "",
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (value.length > (MAX_LENGTHS[name] ?? Infinity)) {
      setErrors((prev) => ({
        ...prev,
        [name]: `Maximum ${MAX_LENGTHS[name]} characters.`,
      }));
    } else if ((name === "Name" || name === "Category") && !value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: `${name} cannot be empty.` }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const clearField = (field) => {
    setNewItem((prev) => ({ ...prev, [field]: "" }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAddItem = async () => {
    const newErrors = {};
    if (!newItem.Name.trim()) newErrors.Name = "Name cannot be empty.";
    else if (newItem.Name.length > MAX_LENGTHS.Name)
      newErrors.Name = `Maximum ${MAX_LENGTHS.Name} characters.`;
    if (!newItem.Category.trim())
      newErrors.Category = "Please select a category.";
    if (
      newItem.description.trim() &&
      newItem.description.length > MAX_LENGTHS.description
    )
      newErrors.description = `Maximum ${MAX_LENGTHS.description} characters.`;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setApiError("");
    try {
      const savedFeature = await save_drawing_item({
        name: newItem.Name.trim(),
        description: newItem.description.trim(),
        type: newItem.Category,
      });
      onAdd({
        ...savedFeature.feature,
        color: generateColor(savedFeature.feature.id),
      });
      handleCancel();
    } catch (error) {
      setApiError(error.message || "Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
    setNewItem({ Name: "", description: "", Category: "Features" });
    setErrors({ Name: "", description: "", Category: "" });
    setApiError("");
  };

  const isFormValid =
    newItem.Name.trim() &&
    newItem.Category.trim() &&
    !errors.Name &&
    !errors.description &&
    !errors.Category;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCancel}
        maxWidth="sm"
        TransitionComponent={Grow}
        transitionDuration={300}
        PaperProps={{
          sx: { minWidth: { xs: "80vw", sm: 380 }, maxWidth: 420 },
        }}
      >
        <IconButton
          onClick={handleCancel}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "rgba(0,0,0,0.4)",
            bgcolor: "rgba(0,0,0,0.05)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
            zIndex: 1,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <DialogContent sx={{ pt: 3.5, px: 3, pb: 2 }}>
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
              <AddCircleIcon sx={{ fontSize: 30, color: "#1976d2" }} />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "#1a1a2e" }}>
              Add New Item
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
            {apiError && (
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
                {apiError}
              </Alert>
            )}

            <Box>
              <FieldLabel icon={<AbcIcon />} text="Name" />
              <TextField
                name="Name"
                value={newItem.Name}
                onChange={handleInputChange}
                fullWidth
                size="small"
                error={Boolean(errors.Name)}
                inputProps={{ maxLength: MAX_LENGTHS.Name }}
                InputProps={{
                  endAdornment: newItem.Name ? (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => clearField("Name")}
                        size="small"
                        edge="end"
                      >
                        <ClearIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                sx={inputSx}
              />
              <Typography
                variant="caption"
                sx={{
                  color: errors.Name ? "error.main" : "rgba(0,0,0,0.35)",
                  mt: 0.4,
                  ml: 0.5,
                  display: "block",
                }}
              >
                {errors.Name || `${newItem.Name.length}/${MAX_LENGTHS.Name}`}
              </Typography>
            </Box>

            <Box>
              <FieldLabel icon={<NotesIcon />} text="Description" />
              <TextField
                name="description"
                value={newItem.description}
                onChange={handleInputChange}
                fullWidth
                size="small"
                multiline
                minRows={2}
                error={Boolean(errors.description)}
                InputProps={{
                  endAdornment: newItem.description ? (
                    <InputAdornment
                      position="end"
                      sx={{ alignSelf: "flex-start", mt: 1 }}
                    >
                      <IconButton
                        onClick={() => clearField("description")}
                        size="small"
                        edge="end"
                      >
                        <ClearIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                sx={inputSx}
              />
              <Typography
                variant="caption"
                sx={{
                  color: errors.description ? "error.main" : "rgba(0,0,0,0.35)",
                  mt: 0.4,
                  ml: 0.5,
                  display: "block",
                }}
              >
                {errors.description ||
                  `${newItem.description.length}/${MAX_LENGTHS.description}`}
              </Typography>
            </Box>

          </Box>
        </DialogContent>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.5)", mx: 2 }} />

        <DialogActions
          sx={{ justifyContent: "center", px: 3, py: 2, gap: 1.5 }}
        >
          <Button
            onClick={handleCancel}
            variant="outlined"
            startIcon={<CloseIcon />}
            disabled={loading}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              borderColor: "rgba(0,0,0,0.2)",
              color: "text.secondary",
              bgcolor: "rgba(255,255,255,0.4)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.6)",
                borderColor: "rgba(0,0,0,0.3)",
              },
              px: 2.5,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddItem}
            variant="contained"
            startIcon={<AddCircleIcon />}
            disabled={!isFormValid || !isAuthenticated || loading}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              background: "linear-gradient(135deg, #1976d2, #42a5f5)",
              boxShadow: "0 4px 12px rgba(25,118,210,0.35)",
              "&:hover": {
                background: "linear-gradient(135deg, #1565c0, #1976d2)",
                boxShadow: "0 4px 16px rgba(25,118,210,0.5)",
              },
              "&:disabled": { background: "rgba(0,0,0,0.12)" },
              px: 2.5,
            }}
          >
            {loading ? "Adding..." : "Add Item"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddNewItem;
