"use client";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CustomChart from "../CustomChart/page";
import { useCallback, useEffect, useState } from "react";
import { getAnnualStat, getUsers, statuts } from "../../utils";
import { Search } from "@mui/icons-material";
import Cookies from "js-cookie";
import Loader from "../loader/page";

interface monthlyDataObject {
  label: string;
  nbFiche: number;
}

interface annuelDataObject {
  data: monthlyDataObject[];
  statut: { statut: string; nbFiche: number }[];
  totalFicheAnnuel: number;
}

function IndividualStatistiques() {
  const [annuelData, setAnnuelData] = useState<annuelDataObject | undefined>();
  const [detailStatut, setDetailStatut] = useState<any>();
  const [search, setSearch] = useState<number>(new Date().getFullYear());
  const [userList, setUserList] =
    useState<{ id: number; username: string }[]>();
  const [selectedUser, setSelectedUser] = useState<{ id: number }>({ id: 0 });
  const [loading,setLoading]=useState<boolean>(true)

  useEffect(()=>{
    getUsers()
    .then((res) => res.json())
    .then((res) => {
      const user = Cookies.get("user");
      const dataUser = user && JSON.parse(user);

      const filtredUsers= res.filter((r:any)=>r.id === dataUser.id)

      if(dataUser.type === 'ADMIN'){
        setUserList(res)
        setSelectedUser({id:res[0].id})
      }else{
        setUserList(filtredUsers)
        setSelectedUser({id:filtredUsers[0].id})
      }

      
      
    });
  },[])

  useEffect(() => {

    setLoading(true)

    if(selectedUser.id){

      getAnnualStat({ year: new Date().getFullYear(), idUser:selectedUser.id, type:'INDIVIDUAL' }).then((res) => {
        if (res) {

          

          const data: monthlyDataObject[] = res.global.monthData.map((month) => ({
            label: month.label,
            nbFiche: month.nbFiche,
          }));
  
          const detailData = statuts.map((s) => {
            const data = res.global.monthData.map((month) => ({
              label: month.label,
              nbFiche: month.statuts.find((statut) => statut.statut === s)
                ?.nbFiche,
            }));
  
            return { statut: s, data };
          });
          setDetailStatut(detailData);
  
          setAnnuelData({
            data: data,
            statut: res?.global?.statuts,
            totalFicheAnnuel: res?.global?.totalAnnuel,
          });

          setLoading(false)
        }
      });

    }
   

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userList]);


  const handleSearch = useCallback(() => {

    setLoading(true)
    setDetailStatut([]);
    setAnnuelData({ data: [], statut: [], totalFicheAnnuel: 0 });

    getAnnualStat({ year: search, idUser: selectedUser.id, type: 'INDIVIDUAL' }).then((res) => {
      if (res) {
        const data: monthlyDataObject[] = res.global.monthData.map((month) => ({
          label: month.label,
          nbFiche: month.nbFiche,
        }));

        const detailData = statuts.map((s) => {
          const data = res.global.monthData.map((month) => ({
            label: month.label,
            nbFiche: month.statuts.find((statut) => statut.statut === s)
              ?.nbFiche,
          }));

          return { statut: s, data };
        });
        setDetailStatut(detailData);

        setAnnuelData({
          data: data,
          statut: res?.global?.statuts,
          totalFicheAnnuel: res?.global?.totalAnnuel,
        });
      }
      setLoading(false)

    });
  },[search, selectedUser.id]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "99%",
          alignItems: "center",
          mt: "50px",
        }}
      >
        <Box sx={{ display: "flex", mb: "50px" }}>
          <TextField
            id="outlined-basic"
            label="Année"
            variant="outlined"
            type="number"
            value={search}
            onChange={(e) => setSearch(e.target.value as unknown as number)}
          />
          <FormControl sx={{width:"200px",ml:"30px"}}>
            <InputLabel id="demo-simple-select-label">
              Filtrer par utilisateur
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedUser?.id}
              name="userId"
              label="Filtrer par utilisateur"
              onChange={(e) =>
                setSelectedUser({ id: e.target.value as number })
              }
              sx={{ width: "100%", mb: "10px" }}
            >
              {(userList || []).map((user, key) => {
                return (
                  <MenuItem key={key} value={user.id}>
                    {user.username}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <Button sx={{ height: "60px" }} variant="text" onClick={handleSearch}>
            <Search />
          </Button>
        </Box>
        { annuelData?.data?.length ?<>
        <Typography color="primary" variant="h5" sx={{ fontWeight: "bold" }}>
          Statistique Individuelle annuelle
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "60% 40%",
            gap: "10px",
            mt: "70px",
            width: "60%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {annuelData?.totalFicheAnnuel ? (
              <Box sx={{ display: "flex", alignItems: "center", mb: "20px" }}>
                <Typography variant="body1" color="primary">
                  Nombre total des fiches {search} :
                </Typography>
                <Typography
                  sx={{ ml: "15px" }}
                  variant="body2"
                  color="text.secondary"
                >
                  {annuelData?.totalFicheAnnuel}
                </Typography>
              </Box>
            ) : (
              <></>
            )}
            <CustomChart type="line" data={annuelData?.data || []} />
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              columnGap: "10px",
              rowGap: "20px",
            }}
          >
            {annuelData?.statut.map((statut, index) => {
              return (
                <Box key={`statut-${index}`}>
                  <Typography variant="body1" color="primary">
                    {statut.statut}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {statut.nbFiche}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Typography
          color="primary"
          variant="h5"
          sx={{ mt: "100px", mb: "70px", fontWeight: "bold" }}
        >
          Détail statistique Individuelle annuelle par statut
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            columnGap: "10px",
            rowGap: "20px",
            width: "70%",
          }}
        >
          {detailStatut?.length ? (
            statuts.map((statut) => {
              return (
                <Box
                  sx={{ display: "flex", flexDirection: "column" }}
                  key={statut}
                >
                  <Box sx={{ mb: "20px" }}>
                    <Typography variant="body1" color="primary">
                      {statut}
                    </Typography>
                  </Box>
                  <CustomChart
                    data={
                      (detailStatut || []).find(
                        (detail: any) => detail.statut === statut
                      ).data
                    }
                  />
                </Box>
              );
            })
          ) : (
            <></>
          )}
        </Box></> : <Typography variant='body1' color='text.secondary'>L&apos;utilisateur n&apos;a pas encore créée de fiche pour le moment</Typography>}
        {loading ? <Loader/> : <></>}
      </Box>
    </Box>
  );
}

export default IndividualStatistiques;
