import React from 'react';
import { Checkbox, Paper, Box, Typography } from '@mui/material';
import DrawingComponent from '../DrawingComponent/Draw';

const DataRow = ({
  row,
  visibilityMap,
  handleCheckboxSelection,
  handleCheckboxChange,
  getDrawingCount,
  activeDrawingRow,
  setActiveDrawingRow,
}) => {
  return (
    <Paper
      key={row.id}
      elevation={1}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 1.5,
        marginBottom: 1.5,
        borderRadius: 2,
        border: '1px solid #ddd',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Checkbox
          checked={visibilityMap[row.id] === true}
          onChange={() => handleCheckboxSelection(row.id)}
          size="small"
        />
        <Typography variant="body1" fontWeight="bold">
          {row.Name} ({getDrawingCount(row.id)})
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 20,
            height: 20,
            backgroundColor: row.color,
            border: '1px solid #999',
            borderRadius: '4px',
          }}
        />
        <DrawingComponent
          name={row.Name}
          rowId={row.id}
          isActive={activeDrawingRow === row.id}
          setActiveDrawingRow={setActiveDrawingRow}
          rowColor={row.color}
          visible={visibilityMap[row.id] === true}
          handleCheckboxChange={handleCheckboxChange}
        />
      </Box>
    </Paper>
  );
};

export default DataRow;
