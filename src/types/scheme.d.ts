import type { HTTPRequest, HTTPResponse } from '.';
import type { Auth } from '../runtime/core';
import type { Token, IdToken, RefreshToken, RefreshController, RequestHandler } from '../runtime/inc';
import type { PartialExcept } from './utils';

export type SchemeNames<N = ''> = 'local' | 'cookie' | 'laravelJWT' | 'openIDConnect' | 'refresh' | 'oauth2' | 'auth0' | `~/${string}` | N

export interface UserOptions {
    property: string | false;
    autoFetch: boolean;
}

export interface EndpointsOption {
    [endpoint: string]: string | HTTPRequest | false | undefined;
}

// Scheme

export interface SchemeOptions {
    name?: string;
    ssr?: boolean;
}

export type SchemePartialOptions<Options extends SchemeOptions> = PartialExcept<Options, keyof SchemeOptions>;

export interface SchemeCheck {
    valid: boolean;
    tokenExpired?: boolean;
    refreshTokenExpired?: boolean;
    idTokenExpired?: boolean;
    isRefreshable?: boolean;
}

export interface Scheme<OptionsT extends SchemeOptions = SchemeOptions> {
    options: OptionsT;
    name?: string;
    $auth: Auth;
    mounted?(...args: any[]): Promise<HTTPResponse<any> | void>;
    check?(checkStatus?: boolean): SchemeCheck;
    login(...args: any[]): Promise<HTTPResponse<any> | void>;
    fetchUser(endpoint?: HTTPRequest): Promise<HTTPResponse<any> | void>;
    setUserToken?(
        token: string | boolean,
        refreshToken?: string | boolean
    ): Promise<HTTPResponse<any> | void>;
    logout?(endpoint?: HTTPRequest): Promise<void> | void;
    reset?(options?: { resetInterceptor: boolean }): void;
}

// Token

export interface TokenOptions {
    property: string;
    expiresProperty: string;
    type: string | false;
    name: string;
    maxAge: number | false;
    global: boolean;
    required: boolean;
    prefix: string;
    expirationPrefix: string;
    httpOnly: boolean
}

export interface TokenableSchemeOptions extends SchemeOptions {
    token?: TokenOptions;
    endpoints: EndpointsOption;
}

export interface TokenableScheme<OptionsT extends TokenableSchemeOptions = TokenableSchemeOptions> extends Scheme<OptionsT> {
    token?: Token;
    requestHandler: RequestHandler;
}

// ID Token

export interface IdTokenableSchemeOptions extends SchemeOptions {
    idToken: TokenOptions;
}

export interface IdTokenableScheme<OptionsT extends IdTokenableSchemeOptions = IdTokenableSchemeOptions> extends Scheme<OptionsT> {
    idToken: IdToken;
    requestHandler: RequestHandler;
}

// Refrash

export interface RefreshTokenOptions {
    property: string | false;
    type: string | false;
    data: string | false;
    maxAge: number | false;
    required: boolean;
    tokenRequired: boolean;
    prefix: string;
    expirationPrefix: string;
    httpOnly: boolean;
}

export interface RefreshableSchemeOptions extends TokenableSchemeOptions {
    refreshToken: RefreshTokenOptions;
}

export interface RefreshableScheme<OptionsT extends RefreshableSchemeOptions = RefreshableSchemeOptions> extends TokenableScheme<OptionsT> {
    refreshToken: RefreshToken;
    refreshController: RefreshController;
    refreshTokens(): Promise<HTTPResponse<any> | void>;
}
