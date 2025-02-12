"use client";
import { Alert, Box, Button, Paper, TextField } from "@mui/material";
import Image from "next/image";
import { ChangeEvent, useCallback, useState } from "react";
import { setAuthCookie } from "./utils";
import { useRouter } from "next/navigation";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const paperStyle = {
  width: "400px",
  height: "500px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-around",
  padding: "20px",
};

interface loginType {
  identifier: string;
  password: string;
}

export default function Login() {
  const route = useRouter();
  const [values, setValues] = useState<loginType>({
    identifier: "",
    password: "",
  });
  const [showError, setShowError] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [showMdp, setShowMdp] = useState<boolean>(false);

  const handleConnect = useCallback(() => {
    if (values.identifier && values.password) {
      setDisabled(true);

      fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/local`, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          accept: "application/json",
        },
        body: JSON.stringify({
          identifier: values.identifier,
          password: values.password,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          setDisabled(false);
          if (res.status === 200 || res?.jwt) {
            return fetch(
              `${process.env.NEXT_PUBLIC_URL}/api/users/me?populate=equipe`,
              {
                method: "GET",
                headers: {
                  Authorization: "Bearer " + res?.jwt,
                },
              }
            )
              .then((response) => response.json())
              .then((data) => {
                const idEquipe = data?.equipe?.id;
                setAuthCookie({
                  cookies: res?.jwt,
                  user: JSON.stringify(res?.user),
                  idEquipe: idEquipe,
                });
                route.push("/Fiches");
              })
              .catch(() => setShowError(true));
          } else {
            setShowError(true);
          }
        })
        .catch(() => {
          setDisabled(false);
          setShowError(true);
        });
    }
  }, [values, route]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      event.preventDefault();

      setValues((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
      }));
    },
    []
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      <Paper sx={paperStyle}>
        {showError && (
          <Alert severity="error">Mot de passe ou login invalides</Alert>
        )}
        <Box
          sx={{
            width: "70%",
            height: "130px",
            position: "relative",
            placeSelf: "center",
            mt: "-30px",
          }}
        >
          <Image
            src="/assets/logo-removebg-preview.png"
            alt="JDA logo"
            layout="fill"
            objectFit="cover"
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: "-50px",
          }}
        >
          <TextField
            value={values.identifier}
            name="identifier"
            sx={{ width: "90%", height: "70px" }}
            id="filled-basic"
            label="Login"
            variant="standard"
            onChange={handleChange}
          />
          <Box sx={{ display: "flex", width: "90%", marginTop: "10px",position:'relative' }}>
            <TextField
              value={values.password}
              name="password"
              id="filled-basic"
              label="Mot de passe"
              variant="standard"
              onChange={handleChange}
              type={showMdp ? "text" : "password"}
              sx={{ width: "100%" }}
            />
            <Button
              sx={{position:'absolute',right:'0px',top:'7px'}}
              onClick={() => setShowMdp((prev) => !prev)}
            >
              {showMdp ? <VisibilityOff /> : <Visibility />}
            </Button>
          </Box>
        </Box>
        <Button
          disabled={!values.identifier || !values.password || disabled}
          sx={{ width: "50%", placeSelf: "center", marginTop: "30px" }}
          onClick={handleConnect}
          variant="contained"
          color="primary"
        >
          Se connecter
        </Button>
      </Paper>
    </Box>
  );
}
