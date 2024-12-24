"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { Close } from "@mui/icons-material";

const defaultStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

export default function CustomModal({
  open,
  setOpen,
  children,
  style,
  setReload,
  upload = false,
}:any) {
  const handleClose = () => {
    setOpen(false);
    if (upload && setReload) {
      setReload((prev: boolean) => !prev);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...defaultStyle, ...style }}>
          <Close onClick={handleClose} sx={{color:"red",position:'absolute',top:"10px",right:"10px", cursor:"pointer"}}/>
          {children}
        </Box>
      </Modal>
    </>
  );
}
