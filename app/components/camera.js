import React, { useState, useRef, Children } from "react";
import { Camera } from "react-camera-pro";
import { Button, Box } from "@mui/material";

export const CameraComponent = ({ children, onClick, setImage, image }) => {
  const camera = useRef(null);

  return (
    <>
      {image ? (
        <>
          <Box
            justifyContent="center"
            display="flex"
            flexDirection="row"
            gap={2}
          >
            <Button
              variant="contained"
              onClick={() => {
                onClick();
              }}
            >
              Submit
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setImage(null);
              }}
            >
              Retake
            </Button>
          </Box>

          <img src={image} />
        </>
      ) : (
        <>
          <Button
            variant="contained"
            onClick={() => {
              setImage(camera.current.takePhoto());
            }}
          >
            {children}
          </Button>
          <Camera ref={camera} aspectRatio={4 / 3} />
        </>
      )}
    </>
  );
};

export default CameraComponent;
