import React, { useContext, useEffect, useState } from "react";
import { useRouter } from 'next/router';
import jwt from "jsonwebtoken";



export type Role = 'admin' | 'editor' | (string & {})
export class Auth {
    #accessToken   : string
    #refreshToken  : string
    #usernameCache : string|undefined = undefined
    #rolesCache    : Role[]|undefined = undefined
    
    
    
    constructor(accessToken: string, refreshToken: string) {
        this.#accessToken  = accessToken;
        this.#refreshToken = refreshToken;
    }
    
    
    
    //#region tokens
    get accessToken(): string {
        return this.#accessToken;
    }
    
    get refreshToken(): string {
        return this.#refreshToken;
    }
    //#endregion tokens
    
    
    
    //#region username
    get username() : string {
        if (this.#usernameCache !== undefined) return this.#usernameCache;
        
        
        
        const decoded = jwt.decode(this.accessToken);
        if (!decoded || (typeof(decoded) !== 'object')) return this.#usernameCache = '';
        
        
        
        this.#rolesCache = (decoded.roles ?? []);
        return this.#usernameCache = (decoded.username ?? '');
    }
    //#endregion username
    
    
    
    //#region roles
    get roles() : Role[] {
        if (this.#rolesCache !== undefined) return this.#rolesCache;
        
        
        
        const decoded = jwt.decode(this.accessToken);
        if (!decoded || (typeof(decoded) !== 'object')) return this.#rolesCache = [];
        
        
        
        this.#usernameCache = (decoded.username ?? '');
        return this.#rolesCache = (decoded.roles ?? []);
    }
    
    hasRoles(requiredRoles: Role[]|undefined): boolean {
        if (!requiredRoles || !requiredRoles.length) return true;
        
        
        
        return this.roles.findIndex((userRole) => requiredRoles.includes(userRole)) >= 0;
    }
    //#endregion roles
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
export interface RequireAuthProps extends Partial<Pick<Auth, 'roles'>> {
    children ?: React.ReactNode
}
export const RequireAuth = ({roles: requiredRoles, children}: RequireAuthProps) => {
    const [auth] = useAuth();
    
    
    
    if (!auth) {
        return <RedirectTo href='/login' />;
    } // if
    
    if (!auth.hasRoles(requiredRoles)) {
        return <RedirectTo href='/unauthorized' />;
    } // if
    
    return (
        <>
            {children}
        </>
    );
};