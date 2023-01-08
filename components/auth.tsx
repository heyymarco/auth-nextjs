import React, { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from 'next/router';
import jwt from "jsonwebtoken";
import axios from 'axios';
import Unauthorized from "../pages/unauthorized";



// const alreadyHandledKey = Symbol(); // axios doesn't persist symbol key
const alreadyHandledKey   : string  = '__alreadyHandled';

const persistLoginKey     : string  = 'persistLogin';
const defaultPersistLogin : boolean = false;

const authServerURL       : string  = 'http://localhost:3001';
const authRefreshPath     : string  = 'refresh';

const loginPath           : string          = '/login'
const unauthorizedPage    : React.ReactNode = <Unauthorized />



export type Role = 'admin' | 'editor' | (string & {})
export class Auth {
    #accessToken   : string|undefined = undefined
    #usernameCache : string|undefined = undefined
    #rolesCache    : Role[]|undefined = undefined
    #axiosCache    : ReturnType<typeof axios.create>|undefined = undefined
    
    
    
    constructor(accessToken?: string) {
        if (accessToken !== undefined) {
            this.#accessToken = accessToken;
        }
        else {
            this.refreshAccessToken()
            .then((result) => {
                if (!result) return;
                onAccessTokenRestored?.();
            });
        } // if
    }
    
    
    
    //#region tokens
    get accessToken(): string|undefined {
        return this.#accessToken;
    }
    
    async refreshAccessToken(): Promise<boolean> {
        try {
            const response = await axios.get(
                authRefreshPath,
                {
                    baseURL         : authServerURL,
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
    
    static get persistLogin(): boolean {
        if (typeof(window) === 'undefined') return defaultPersistLogin;
        
        return (window.localStorage.getItem(persistLoginKey) === 'true');
    }
    static set persistLogin(value: boolean) {
        if (typeof(window) === 'undefined') return;
        
        value = !!value;
        if (value === this.persistLogin) return;
        window.localStorage.setItem(persistLoginKey, String(value));
        onPersistLoginChanged?.(value);
    }
    //#endregion tokens
    
    
    
    //#region username
    get username() : string {
        if (this.#usernameCache !== undefined) return this.#usernameCache;
        
        
        
        const accessToken = this.accessToken;
        const decoded = accessToken ? jwt.decode(accessToken) : undefined;
        if (!decoded || (typeof(decoded) !== 'object')) return this.#usernameCache = '';
        
        
        
        this.#rolesCache = (decoded.roles ?? []);
        return this.#usernameCache = (decoded.username ?? '');
    }
    //#endregion username
    
    
    
    //#region roles
    get roles() : Role[] {
        if (this.#rolesCache !== undefined) return this.#rolesCache;
        
        
        
        const accessToken = this.accessToken;
        const decoded = accessToken ? jwt.decode(accessToken) : undefined;
        if (!decoded || (typeof(decoded) !== 'object')) return this.#rolesCache = [];
        
        
        
        this.#usernameCache = (decoded.username ?? '');
        return this.#rolesCache = (decoded.roles ?? []);
    }
    
    satisfiedRoles(requiredRoles: Role[]|undefined): boolean {
        if (!requiredRoles || !requiredRoles.length) return true;
        
        
        
        return this.roles.findIndex((userRole) => requiredRoles.includes(userRole)) >= 0;
    }
    //#endregion roles
    
    
    
    //#region axios
    get axios() {
        if (this.#axiosCache !== undefined) return this.#axiosCache;
        
        
        
        const axiosAuth = axios.create({
            baseURL         : authServerURL,
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



let onPersistLoginChanged : ((persistLogin: boolean) => void)|undefined = undefined;
let onAccessTokenRestored : (() => void)|undefined
const isInitiallyRemembered = Auth.persistLogin;
if (isInitiallyRemembered) Auth.persistLogin = false; // set initially as unchecked, so the generated HTML at server_side matches with the generated HTML at client_side



export type AuthState = ReturnType<typeof useState<Auth|undefined>>
const AuthContext = React.createContext<AuthState>([undefined, () => { throw Error('not inside <AuthProvider>') }]);



export interface AuthProviderProps {
    children ?: React.ReactNode
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [auth, setAuth]    = useState<Auth|undefined>(() => (
        isInitiallyRemembered
        ? new Auth() // automatically restores access_token if refresh_token exists in cookie
        : undefined  // initially no user was logged in
    ));
    
    
    
    const [, triggerRenderImpl] = useState({});
    const triggerRender = () => triggerRenderImpl({});
    useEffect(() => {
        // actions:
        onPersistLoginChanged = triggerRender; // start watchdog for future changed
        onAccessTokenRestored = triggerRender; // start watchdog for future changed
        if (isInitiallyRemembered) {
            Auth.persistLogin = true;          // update as checked & `triggerRender`
        } // if
        
        
        
        // cleanups:
        return () => {
            onPersistLoginChanged = undefined; // stop watchdog for future changed
            onAccessTokenRestored = undefined; // stop watchdog for future changed
        };
    }, []);
    
    
    
    return (
        <AuthContext.Provider value={[auth, setAuth]}>
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
    
    
    
    useEffect(() => {
        // buggy:
        // router.replace(href, { query: { from: router.pathname } });
        
        // works:
        if (typeof(window) !== 'undefined') router.replace(href);
        router.replace(href, { query: { from: router.pathname } });
    }, []);
    
    
    
    return <></>;
}
export interface RequireAuthProps extends Partial<Pick<Auth, 'roles'>> {
    children ?: React.ReactNode
}
export const RequireAuth = ({roles: requiredRoles, children}: RequireAuthProps) => {
    const [auth] = useAuth();
    const [renderPublic, setRenderPublic] = useState(
        (typeof(window) === 'undefined') // on server_side => always render_public
        ||
        isInitiallyRemembered            // on client_side & when remember_login => render_public at hydration and then render_private (if successfully restored)
    );
    
    
    
    const loginRestored = !!auth?.username;
    useEffect(() => {
        if (!loginRestored) return; // restoration is still in progress -or- restoration is failed
        if (!renderPublic)  return; // already has privatize
        setRenderPublic(false);     // privatize & re-render
    }, [renderPublic, loginRestored]);
    
    
    
    if (renderPublic) {
        return unauthorizedPage;
    } // if
    
    if (!auth) {
        return <RedirectTo href={loginPath} />;
    } // if
    
    if (!auth.satisfiedRoles(requiredRoles)) {
        return unauthorizedPage;
    } // if
    
    return (
        <>
            {children}
        </>
    );
};