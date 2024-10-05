import { Box } from "@mui/material";

const Popup = ({ width, children, gap = 3, height}) => {
  return (
    <Box
      height = {height}
      position="absolute"
      top="50%"
      left="50%"
      width={width}
      bgcolor="white"
      border="2px solid #0000"
      boxShadow={24}
      p={4}
      display="flex"
      flexDirection="column"
      gap={gap}
      sx={{
        transform: "translate(-50%, -50%)",
      }}
    >
      {children}
    </Box>
  );
};

export default Popup;
