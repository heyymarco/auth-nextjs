import React, { useContext, useEffect, useState } from "react";
import { useRouter } from 'next/router';
import jwt from "jsonwebtoken";
import axios from 'axios';



// const alreadyHandledKey = Symbol(); // axios doesn't persist symbol key
const alreadyHandledKey = '__alreadyHandled';



export type Role = 'admin' | 'editor' | (string & {})
export class Auth {
    #accessToken   : string
    #usernameCache : string|undefined = undefined
    #rolesCache    : Role[]|undefined = undefined
    #authServerURL : string
    #axiosCache    : ReturnType<typeof axios.create>|undefined = undefined
    
    
    
    constructor(accessToken: string, authServerURL: string) {
        this.#accessToken   = accessToken;
        this.#authServerURL = authServerURL;
    }
    
    
    
    //#region tokens
    get accessToken(): string {
        return this.#accessToken;
    }
    
    async refreshAccessToken(): Promise<boolean> {
        try {
            const response = await axios.get(
                'refresh',
                {
                    baseURL         : this.#authServerURL,
                    withCredentials : true, // send the refresh token in the cookie (if any)
                },
            );
            const responseData = response.data;
            const accessToken  = responseData?.accessToken ?? '';
            if (!accessToken) return false;
            
            
            
            this.#accessToken   = accessToken;
            this.#usernameCache = undefined;
            this.#rolesCache    = undefined;
            return true;
        }
        catch (error) {
            return false;
        } // try
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
    
    
    
    //#region axios
    get axios() {
        if (this.#axiosCache !== undefined) return this.#axiosCache;
        
        
        
        const axiosAuth = axios.create({
            baseURL         : this.#authServerURL,
            headers         : { 'Content-Type': 'application/json' },
            withCredentials : false, // no need to send/receive any cookie
        });
        axiosAuth.interceptors.request.use(
            (config) => {
                if (!(config.headers as any)?.Authorization) {
                    // inject existing auth token header:
                    (config.headers as any).Authorization = `Bearer ${this.accessToken}`;
                } // if
                
                
                
                return config;
            },
            (error) => Promise.reject(error),
        );
        axiosAuth.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error?.response?.status === 403) {
                    const config = error?.config;
                    if (!config?.[alreadyHandledKey]) {
                        config[alreadyHandledKey] = true;
                        
                        
                        
                        // refresh the access token:
                        if (await this.refreshAccessToken()) {
                            // inject a new auth token header:
                            (config.headers as any).Authorization = `Bearer ${this.accessToken}`;
                            
                            
                            
                            // retry with a new auth:
                            return axiosAuth(config);
                        } // if
                    } // if
                } // if
                
                
                
                return Promise.reject(error);
            },
        );
        return this.#axiosCache = axiosAuth;
    }
    //#endregion axios
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