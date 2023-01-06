import React, { useContext, useState } from "react";



export const enum Role {
    Admin  = 'admin',
    Editor = 'editor',
}
export interface Auth {
    accessToken  : string
    refreshToken : string
    roles        : Role[]
}
const AuthContext = React.createContext<Auth>({
    accessToken  : '',
    refreshToken : '',
    roles        : [],
});
export const useAuth = () => useContext(AuthContext);



export interface AuthProviderProps {
    children ?: React.ReactNode
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [auth, setAuth] = useState<Auth>({
        accessToken  : '',
        refreshToken : '',
        roles        : [],
    });
    
    
    
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    )
}