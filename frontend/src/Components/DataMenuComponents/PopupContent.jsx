import React from "react";
import {
  IconButton,
  Slider,
  Typography,
  Box,
  Stack,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

const PopupContent = ({
  density,
  onChange,
  drawingName,
  onSave,
  onDelete,
  onClose,
  description,
  onDescriptionChange,
  direction = "top",
}) => {
  const maxLength = 50;
  return (
    <Box
      sx={{
        position: "relative",
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        borderRadius: 1.5,
        p: 1,
        width: 180,
        height: 140,
        fontFamily: "Roboto, sans-serif",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.4)",
        color: "#222",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <IconButton
        size="small"
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          color: "rgba(0,0,0,0.6)",
        }}
        aria-label="close"
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <Typography
        variant="subtitle2"
        fontWeight="bold"
        noWrap
        sx={{ mb: 0.5, fontSize: 13 }}
        title={drawingName}
      >
        {drawingName}
      </Typography>

      <Typography variant="body2" sx={{ fontSize: 12, mb: 0.5 }}>
        Density: {density}
      </Typography>
      <Slider
        value={density}
        min={1}
        max={100}
        size="small"
        onChange={onChange}
        aria-label="density slider"
        sx={{ mb: 0.5 }}
      />

      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <TextField
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          variant="filled"
          size="small"
          inputProps={{
            maxLength,
            style: {
              fontSize: 12,
              padding: "6px 8px",
              color: "#222",
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 6,
            },
            placeholder: "Add Description",
          }}
          InputProps={{
            disableUnderline: true,
            sx: {
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 1,
              "& input": {
                padding: "6px 8px",
              },
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.25)",
              },
              "&.Mui-focused": {
                backgroundColor: "rgba(255,255,255,0.3)",
                boxShadow: "0 0 6px rgba(255,255,255,0.6)",
              },
            },
          }}
          sx={{ flexGrow: 1 }}
        />
        <Typography
          sx={{
            ml: 0.5,
            fontSize: 10,
            color: "rgba(0,0,0,0.6)",
            userSelect: "none",
            minWidth: 32,
            textAlign: "right",
          }}
        >
          {description.length} / {maxLength}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 0 }}>
        <IconButton
          color="primary"
          onClick={onSave}
          aria-label="save"
          size="small"
          sx={{ p: "4px" }}
        >
          <SaveIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="error"
          onClick={onDelete}
          aria-label="delete"
          size="small"
          sx={{ p: "4px" }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>

      {direction === "top" && (
        <Box
          sx={{
            position: "absolute",
            top: -6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderBottom: "6px solid #fff",
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}
      {direction === "bottom" && (
        <Box
          sx={{
            position: "absolute",
            bottom: -6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid #fff",
            filter: "drop-shadow(0 -2px 2px rgba(0,0,0,0.3))",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}
    </Box>
  );
};

export default PopupContent;
