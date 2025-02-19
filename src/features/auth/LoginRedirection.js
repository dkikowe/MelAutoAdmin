import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";

const LoginRedirection = () => {
    const { auth } = useAuth();
    
    const decoded = auth?.accessToken
        ? jwtDecode(auth.accessToken)
        : undefined;
    
    return (
        decoded 
            ? <Navigate to="/spravka" replace />
            : <Navigate to="/login" replace />
    );    
}

export default LoginRedirection
