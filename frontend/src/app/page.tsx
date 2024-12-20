"use client";
import { Alert, Box, Button, Paper, TextField } from "@mui/material";
import Image from "next/image";
import { ChangeEvent, useCallback, useState } from "react";
import { setAuthCookie } from "./utils";
import { useRouter } from "next/navigation";

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

  const handleConnect = useCallback(() => {
    if (values.identifier && values.password) {
      setDisabled(true);

      fetch("http://localhost:1337/api/auth/local", {
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
            return fetch("http://localhost:1337/api/users/me?populate=equipe", {
              method: "GET",
              headers: {
                Authorization: "Bearer " + res?.jwt,
              },
            })
              .then((response) => response.json())
              .then((data) => {
                const idEquipe = data?.equipe?.id;
                setAuthCookie({
                  cookies: res?.jwt,
                  user: JSON.stringify(res?.user),
                  idEquipe: idEquipe,
                });
                route.push("/home");
              })
              .catch((error) => console.error("Erreur :", error));
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
        <Box sx={{ width: "90%", height: "100px", position: "relative" }}>
          <Image
            src="/assets/logo-removebg-preview.png"
            alt="JDA logo"
            layout="fill"
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <TextField
            value={values.identifier}
            name="identifier"
            sx={{ width: "90%" }}
            id="filled-basic"
            label="Login"
            variant="standard"
            onChange={handleChange}
          />
          <TextField
            value={values.password}
            name="password"
            sx={{ width: "90%", marginTop: "20px" }}
            id="filled-basic"
            label="Mot de passe"
            variant="standard"
            onChange={handleChange}
          />
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
