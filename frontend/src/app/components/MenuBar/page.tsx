"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Image from "next/image";
import CustomModal from "../Modal/page";
import { Alert, TextField } from "@mui/material";
import { Check } from "@mui/icons-material";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const pages = ["Fiche"];
const settings = ["Changer mot de passe", "Déconnecter"];

interface changePwdType {
  newPassword: string;
  confirmPassword: string;
  currentPassword: string;
}

const defaultValues={
  newPassword: "",
  confirmPassword: "",
  currentPassword: "",
}

function MenuBar() {
  const [values, setValues] = React.useState<changePwdType>(defaultValues);
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );
  const [showError, setShowError] = React.useState<
    "ERROR" | "SUCCESS" | "HIDE" | "NOT_MATCH"
  >("HIDE");

  const route = useRouter();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuClick = (item: string) => {
    switch (item) {
      case "Changer mot de passe":
        setValues(defaultValues)
        setOpenModal(true);
        break;
      case "Déconnecter":
        Cookies.remove("auth-token");
        route.push("/");
        break;
      default:
        break;
    }
  };

  const handleChange = React.useCallback((event: any) => {
    setValues((prev) => ({
      ...prev,
      [event?.target.name]: event.target.value,
    }));
  }, []);

  const handleValidate = React.useCallback(() => {

    if(values.confirmPassword !== values.newPassword){
      setShowError('NOT_MATCH')
      return;
    }

    if (
      values.currentPassword &&
      values.confirmPassword &&
      values.newPassword &&
      values.confirmPassword === values.newPassword
    ) {
      const token = Cookies.get("auth-token");

      fetch("http://localhost:1337/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          accept: "application/json",
          Authorization: "bearer " + token,
        },
        body: JSON.stringify({
          password: values.newPassword,
          currentPassword: values.currentPassword,
          passwordConfirmation: values.confirmPassword,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.jwt) {
            setShowError("SUCCESS");
          } else {
            setShowError("ERROR");
          }
        })
        .catch(() => setShowError("ERROR"));
    }
  }, [values.confirmPassword, values.newPassword, values.currentPassword]);

  return (
    <AppBar sx={{ backgroundColor: "#000" }} position="static">
      <Container maxWidth="xl">
        <CustomModal open={openModal} setOpen={setOpenModal}>
          <Typography
            sx={{ mb: "30px" }}
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Modifier mot de passe
          </Typography>
          {showError === "SUCCESS" ? (
            <Alert severity="success">Votre mot de passe a été modifié</Alert>
          ) : showError === "ERROR" ? (
            <Alert severity="error">Erreur lors de la modification</Alert>
          ) : showError === 'NOT_MATCH'? (<Alert severity="error">La confirmation du mot de passe ne correspond pas</Alert>) : (
            <></>
          )}
          <TextField
            value={values.currentPassword}
            name="currentPassword"
            sx={{ width: "90%", m: "20px 0px" }}
            id="filled-basic"
            label="Mot de passe actuel"
            variant="standard"
            onChange={handleChange}
          />
          <TextField
            value={values.newPassword}
            name="newPassword"
            sx={{ width: "90%", mb: "20px" }}
            id="filled-basic"
            label="Nouveau mot de passe"
            variant="standard"
            onChange={handleChange}
          />
          <TextField
            value={values.confirmPassword}
            name="confirmPassword"
            sx={{ width: "90%", mb: "40px" }}
            id="filled-basic"
            label="Confirmer mot de passe"
            variant="standard"
            onChange={handleChange}
          />
          <Button
            startIcon={<Check />}
            variant="contained"
            onClick={handleValidate}
          >
            Modifier
          </Button>
        </CustomModal>
        <Toolbar disableGutters>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              width: "100px",
              height: "30px",
              position: "relative",
              mr: "50px",
            }}
          >
            <Image
              src="/assets/logo-removebg-preview.png"
              alt="JDA logo"
              layout="fill"
            />
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography sx={{ textAlign: "center" }}>{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              width: "100px",
              height: "30px",
              position: "relative",
              mr: "30vw",
            }}
          >
            <Image
              src="/assets/logo-removebg-preview.png"
              alt="JDA logo"
              layout="fill"
            />
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Ouvrir le menu">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => handleMenuClick(setting)}
                >
                  <Typography sx={{ textAlign: "center" }}>
                    {setting}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default MenuBar;
