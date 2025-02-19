// Modules
import { Routes, Route } from "react-router-dom";
// Layouts
import Layout from "./components/Layouts/Layout";
import PersistLogin from "./components/Layouts/PersistLogin";
// Login
// import Register from "./features/auth/Register";
import Login from "./features/auth/Login";
import LoginRedirection from "./features/auth/LoginRedirection";
import LoginRedir from "./features/auth/LoginRedir";
import RequireAuth from "./components/Layouts/RequireAuth";
// import LoginRedir from "./features/auth/LoginRedir";

import Missing from "./components/Missing";
import Unauthorized from "./components/Unauthorized";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import 'react-toastify/dist/ReactToastify.css';


import Temp from "./pages/Temp";
import UniversityUploadPage from "./pages/UniversityUploadPage";
import UniversityReadUpdatePage from "./pages/UniversityReadUpdatePage";


function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Routes>
          <Route path="/" element={<Layout />}>
            {/* change to redir later */}
            <Route index element={<LoginRedirection />} /> 
            <Route path="login" element={<Login />} />
            <Route path="login-redir" element={<LoginRedir />} />
            <Route path="unauthorized" element={<Unauthorized />} />
            <Route element={<PersistLogin />}>
              <Route element={<RequireAuth allowedRoles={['dor']}/>}>

                <Route path="dashboard" element={<Temp />} />

                <Route path="car">
                    <Route index element={<Temp />} />
                    <Route path="upload" element={<UniversityUploadPage />} />
                    <Route path=":id" element={<UniversityReadUpdatePage />} />
                  </Route>
                </Route>
            <Route path="*" element={<Missing />} />
          </Route>
          </Route>
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
