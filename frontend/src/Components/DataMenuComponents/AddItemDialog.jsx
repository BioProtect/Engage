import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Button,
  Box,
  Typography,
  Divider,
  Grow,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PhishingIcon from "@mui/icons-material/Phishing";
import SetMealIcon from "@mui/icons-material/SetMeal";
import ClearIcon from "@mui/icons-material/Clear";
import { useAuth } from "../../Contexts/AuthenticationContext";
import { save_drawing_item } from "../../Api/DataMenuApi";

const MAX_LENGTHS = {
  Name: 10,
  description: 200,
};

const AddNewItem = ({ onAdd }) => {
  const { isAuthenticated } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({
    Name: "",
    description: "",
    Category: "",
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
        [name]: `Maximum length is ${MAX_LENGTHS[name]} characters.`,
      }));
    } else if ((name === "Name" || name === "Category") && !value.trim()) {
      setErrors((prev) => ({
        ...prev,
        [name]: `${name} cannot be empty.`,
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setNewItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearField = (field) => {
    setNewItem((prev) => ({
      ...prev,
      [field]: "",
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleAddItem = async () => {
    const newErrors = {};

    if (!newItem.Name.trim()) {
      newErrors.Name = "Name cannot be empty.";
    } else if (newItem.Name.length > MAX_LENGTHS.Name) {
      newErrors.Name = `Maximum length is ${MAX_LENGTHS.Name} characters.`;
    }

    if (!newItem.Category.trim()) {
      newErrors.Category = "Category must be selected.";
    }

    if (
      newItem.description.trim() &&
      newItem.description.length > MAX_LENGTHS.description
    ) {
      newErrors.description = `Maximum length is ${MAX_LENGTHS.description} characters.`;
    }

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

      onAdd(savedFeature.feature);
      setShowModal(false);
      setNewItem({
        Name: "",
        description: "",
        Category: "",
      });
      setErrors({ Name: "", description: "", Category: "" });
    } catch (error) {
      setApiError(error.message || "Failed to save feature");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setNewItem({
      Name: "",
      description: "",
      Category: "",
    });
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
    <div>
      <Tooltip
        title={isAuthenticated ? "Add New Item" : "Sign in to add items"}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: isAuthenticated ? "pointer" : "default",
            userSelect: "none",
            width: 40,
          }}
          onClick={() => {
            if (isAuthenticated) setShowModal(true);
          }}
          aria-label="Add new item"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && isAuthenticated)
              setShowModal(true);
          }}
        >
          <IconButton
            color="primary"
            size="large"
            sx={{
              fontSize: 28,
              p: 0,
              color: isAuthenticated ? "primary.main" : "grey.400",
              pointerEvents: isAuthenticated ? "auto" : "none",
            }}
            disableRipple
          >
            <AddCircleIcon fontSize="inherit" />
          </IconButton>

          <Box
            component="span"
            sx={{
              fontSize: 11,
              fontWeight: 500,
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              color: isAuthenticated ? "text.primary" : "grey.400",
              mt: 1,
              letterSpacing: 0.15,
              userSelect: "none",
              lineHeight: 1,
              width: "100%",
              textAlign: "center",
              whiteSpace: "nowrap",
              display: "block",
              height: 16,
            }}
          >
            Add Item
          </Box>
        </Box>
      </Tooltip>

      <Dialog
        open={showModal}
        onClose={handleCancel}
        maxWidth="sm"
        TransitionComponent={Grow}
        transitionDuration={300}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.15)",
            backdropFilter: "none",
          },
        }}
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <Box
          sx={{
            m: 2,
            px: 5,
            py: 4,
            borderRadius: 4,
            backdropFilter: "blur(20px)",
            background: "rgba(255, 255, 255, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.35)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
            color: "#111",
            minWidth: 350,
          }}
        >
          <DialogTitle
            sx={{
              textAlign: "center",
              p: 0,
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
            component="div"
          >
            <AddCircleIcon color="primary" fontSize="medium" />
            <Typography
              variant="h6"
              color="primary"
              component="h2"
              sx={{ m: 0 }}
            >
              Add New Item
            </Typography>
          </DialogTitle>

          <Divider sx={{ mb: 3, borderColor: "rgba(0, 0, 0, 0.1)" }} />

          <DialogContent sx={{ px: 0, pt: 0, pb: 2 }}>
            <TextField
              label="Name"
              name="Name"
              value={newItem.Name}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={Boolean(errors.Name)}
              helperText={
                errors.Name
                  ? errors.Name
                  : `${newItem.Name.length}/${MAX_LENGTHS.Name}`
              }
              inputProps={{ maxLength: MAX_LENGTHS.Name }}
              required
              InputProps={{
                endAdornment: newItem.Name ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => clearField("Name")}
                      edge="end"
                      size="small"
                      aria-label="clear name"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
            <TextField
              label="Description"
              name="description"
              value={newItem.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              error={Boolean(errors.description)}
              helperText={
                errors.description
                  ? errors.description
                  : `${newItem.description.length}/${MAX_LENGTHS.description}`
              }
              InputProps={{
                endAdornment: newItem.description ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => clearField("description")}
                      edge="end"
                      size="small"
                      aria-label="clear description"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
            <FormControl fullWidth>
              <Select
                value={newItem.Category}
                onChange={handleInputChange}
                name="Category"
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <em>Select category*</em>;
                  }
                  // Swapped icons here:
                  if (selected === "Features") {
                    return (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <SetMealIcon fontSize="small" />
                        {selected}
                      </Box>
                    );
                  }
                  if (selected === "Activities") {
                    return (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PhishingIcon fontSize="small" />
                        {selected}
                      </Box>
                    );
                  }
                  return selected;
                }}
              >
                <MenuItem disabled value="">
                  Select category
                </MenuItem>
                <MenuItem value="Features">
                  <SetMealIcon fontSize="small" sx={{ mr: 1 }} />
                  Features
                </MenuItem>
                <MenuItem value="Activities">
                  <PhishingIcon fontSize="small" sx={{ mr: 1 }} />
                  Activities
                </MenuItem>
              </Select>
            </FormControl>

            {apiError && (
              <Typography
                color="error"
                variant="body2"
                mt={1}
                textAlign="center"
              >
                {apiError}
              </Typography>
            )}
          </DialogContent>

          <Divider sx={{ mt: 1, mb: 2, borderColor: "rgba(0, 0, 0, 0.08)" }} />

          <DialogActions sx={{ justifyContent: "center", p: 0 }}>
            <Button
              onClick={handleCancel}
              color="error"
              variant="contained"
              sx={{
                borderRadius: 2,
                boxShadow: "0 4px 14px rgba(211, 47, 47, 0.4)",
                textTransform: "none",
                fontWeight: 600,
                px: 5,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
              disabled={loading}
            >
              <ClearIcon fontSize="small" />
              Cancel
            </Button>
            <Button
              onClick={handleAddItem}
              color="primary"
              variant="contained"
              disabled={!isFormValid || !isAuthenticated || loading}
              sx={{
                borderRadius: 2,
                boxShadow: "0 4px 14px rgba(25, 118, 210, 0.25)",
                textTransform: "none",
                fontWeight: 600,
                px: 5,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {loading ? (
                "Adding..."
              ) : (
                <>
                  <AddCircleIcon fontSize="small" />
                  Add Item
                </>
              )}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </div>
  );
};

export default AddNewItem;
