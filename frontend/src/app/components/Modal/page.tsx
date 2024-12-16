import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

const defaultStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  display:"flex",
  flexDirection:"column",
  alignItems:'center'
};

export default function CustomModal({
  open,
  setOpen,
  children,
  style
}: {
  open: boolean;
  setOpen: any;
  children:any;
  style?:any
}) {
  const handleClose = () => setOpen(false);

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{...defaultStyle,...style}}>
          {children}
        </Box>
      </Modal>
    </>
  );
}
