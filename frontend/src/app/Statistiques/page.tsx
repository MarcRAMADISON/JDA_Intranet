"use client";

import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import GlobalStatistiques from "../components/GlobalStatistique/page";
import MenuBar from "../components/MenuBar/page";
import IndividualStatistiques from "../components/IndividualStatistique/page";
import Cookies from "js-cookie";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function Statistiques() {
  const [value, setValue] = React.useState(0);
  const [userType, setUserType] = React.useState<string>();

  React.useEffect(() => {
    const user = Cookies.get("user");
    const dataUser = user && JSON.parse(user);

    if (dataUser?.type === "ADMIN") {
      setUserType("ADMIN");
    }
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box>
      <MenuBar />
      <Box sx={{ width: "90%", mt: "50px", placeSelf: "center",ml:"4vw" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Statistique individuelle" {...a11yProps(0)} />
            <Tab label="Statistiques globale" {...a11yProps(1)} disabled={userType !== 'ADMIN'}/>
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <IndividualStatistiques />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
            <GlobalStatistiques />
          </CustomTabPanel>
      </Box>
    </Box>
  );
}
