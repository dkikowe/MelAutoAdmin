import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";

const LoginRedir = () => {
    const { auth } = useAuth();
    
    const decoded = auth?.accessToken
        ? jwtDecode(auth.accessToken)
        : undefined;
    
    const role = decoded?.role || [];

    switch(role) {
        case 'dor': return <Navigate to="/dashboard" replace />
        default: break;
    }

    return <Navigate to="/login" replace />
}

export default LoginRedir
