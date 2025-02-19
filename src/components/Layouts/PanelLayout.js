import { Outlet} from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Sidebar from "../../scenes/global/Sidebar";
import { Box } from "@mui/material";

const MainLayout = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh", // Задаем полную высоту видового окна
      }}
    >
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          overflow: "auto", // Включаем прокрутку, если контент не влезает
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

const PanelLayout = () => {


  return (
    <div className="container-fluid" style ={{ paddingLeft: 0}}>
      {role === 1101 ? (
        <MainLayout>
          {/* Внутренние компоненты для роли 1101 */}
          {/* Sidebar и другие компоненты */}
          <Outlet />
          <ToastContainer
            position="top-center"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </MainLayout>
      ) : (
        <div>
          {/* Компоненты для остальных ролей */}
          <Outlet />
        </div>
      )}
    </div>
  );
}

export default PanelLayout;