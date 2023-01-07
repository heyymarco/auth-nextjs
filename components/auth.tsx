import React, { useContext, useEffect, useState } from "react";
import { useRouter } from 'next/router';



export const enum Role {
    Admin  = 'admin',
    Editor = 'editor',
}
export interface Auth {
    accessToken  : string
    refreshToken : string
    username     : string
    roles        : Role[]
}



export type AuthState = ReturnType<typeof useState<Auth|undefined>>
const AuthContext = React.createContext<AuthState>([undefined, () => { throw Error('not inside <AuthProvider>') }]);



export interface AuthProviderProps {
    children ?: React.ReactNode
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const authState = useState<Auth|undefined>(undefined); // initially no user was logged in
    
    
    
    return (
        <AuthContext.Provider value={authState}>
            {children}
        </AuthContext.Provider>
    )
};



export const useAuth = () => useContext(AuthContext);



interface RedirectToProps {
    href : string
}
const RedirectTo = ({href}: RedirectToProps) => {
    const router = useRouter();
    
    
    
    // buggy:
    // router.replace(href, { query: { from: router.pathname } });
    
    // works:
    if (typeof(window) !== 'undefined') router.replace(href);
    useEffect(() => {
        router.replace(href, { query: { from: router.pathname } });
    }, []);
    
    
    
    return <></>;
}
export interface RequireAuthProps extends Required<Pick<Auth, 'roles'>> {
    children ?: React.ReactNode
}
export const RequireAuth = ({roles: requiredRoles, children}: RequireAuthProps) => {
    const [auth] = useAuth();
    
    
    
    if (!auth) {
        return <RedirectTo href='/login' />;
    } // if
    
    if (!auth.roles.find((userRole) => requiredRoles.includes(userRole)))  {
        return <RedirectTo href='/unauthorized' />;
    } // if
    
    return (
        <>
            {children}
        </>
    );
};