/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface HandlersClubPostRequest {
  text_content: string;
}

export interface HandlersCreatedResponse {
  id?: string;
  message?: string;
}

export interface HandlersErrorResponse {
  error?: string;
}

export interface HandlersLoginUserRequest {
  email?: string;
  password?: string;
  username?: string;
}

export interface HandlersRegisterUserRequest {
  email?: string;
  password?: string;
  username?: string;
}

export interface HandlersSuccessResponse {
  message?: string;
}

export interface HandlersSuccessfulLoginResponse {
  message?: string;
  token?: string;
}

export interface HandlersUpdateClubRequest {
  banner_image?: string;
  description?: string;
  is_public?: boolean;
  name?: string;
}

export interface HandlersUpdateUserRequest {
  email?: string;
  password?: string;
  profile_picture?: string;
  username?: string;
}

export interface HandlersUploadClubBannerResponse {
  message?: string;
  url?: string;
}

export interface HandlersUploadProfilePictureResponse {
  message?: string;
  url?: string;
}

export interface HandlersVersionResponse {
  build_date?: string;
  commit_hash?: string;
  version?: string;
}

export interface RepositoryClub {
  banner_image?: string;
  created_at?: string;
  description?: string;
  id?: string;
  is_public?: boolean;
  name?: string;
  owner_user_id?: string;
  updated_at?: string;
}

export interface RepositoryClubPost {
  club_id?: string;
  content?: string;
  created_at?: string;
  id?: string;
  updated_at?: string;
  user_id?: string;
}

export interface RepositoryCreateMetricEntryParams {
  metric_instance_id?: string;
  user_id?: string;
  value?: number;
}

export interface RepositoryCreateMetricParams {
  club_id?: string;
  description?: string;
  id?: string;
  interval?: string;
  requires_verification?: boolean;
  start_at?: string;
  title?: string;
  unit?: string;
  unit_is_integer?: boolean;
}

export interface RepositoryGetClubLeaderboardRow {
  id?: string;
  joined_at?: string;
  profile_picture?: string;
  user_points?: number;
  user_streak?: number;
  username?: string;
}

export interface RepositoryGetClubPostsRow {
  author_username?: string;
  club_id?: string;
  club_name?: string;
  content?: string;
  created_at?: string;
  id?: string;
  updated_at?: string;
  user_id?: string;
}

export interface RepositoryGetUserClubsRow {
  banner_image?: string;
  club_id?: string;
  created_at?: string;
  description?: string;
  joined_at?: string;
  name?: string;
  user_points?: number;
  user_streak?: number;
}

export interface RepositoryGetUserDisplayRow {
  created_at?: string;
  profile_picture?: string;
  username?: string;
}

export interface RepositoryMetric {
  club_id?: string;
  created_at?: string;
  description?: string;
  id?: string;
  interval?: string;
  requires_verification?: boolean;
  start_at?: string;
  title?: string;
  unit?: string;
  unit_is_integer?: boolean;
  updated_at?: string;
}

export interface RepositoryMetricEntry {
  created_at?: string;
  metric_instance_id?: string;
  updated_at?: string;
  user_id?: string;
  value?: number;
}

export interface RepositoryUpdateMetricParams {
  description?: string;
  id?: string;
  interval?: string;
  requires_verification?: boolean;
  start_at?: string;
  title?: string;
  unit?: string;
  unit_is_integer?: boolean;
}

export interface ServicesCreateClubRequest {
  banner_image?: string;
  description?: string;
  is_public?: boolean;
  name?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "//localhost:5050";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Task Social API
 * @version 0.1
 * @baseUrl //localhost:5050
 * @contact
 *
 * API services for the Task Social app
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Create a new club with the provided details.
     *
     * @tags Club
     * @name CreateClub
     * @summary Create a new club
     * @request POST:/api/club
     * @secure
     */
    createClub: (club: ServicesCreateClubRequest, params: RequestParams = {}) =>
      this.request<HandlersCreatedResponse, HandlersErrorResponse>({
        path: `/api/club`,
        method: "POST",
        body: club,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get club info
     *
     * @tags Club
     * @name GetClub
     * @summary Get club info
     * @request GET:/api/club/{club_id}
     * @secure
     */
    getClub: (clubId: string, params: RequestParams = {}) =>
      this.request<RepositoryClub, HandlersErrorResponse>({
        path: `/api/club/${clubId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update a club with the given ID.
     *
     * @tags Club
     * @name UpdateClub
     * @summary Update a club
     * @request PUT:/api/club/{club_id}
     * @secure
     */
    updateClub: (
      clubId: string,
      club: HandlersUpdateClubRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlersSuccessResponse, HandlersErrorResponse>({
        path: `/api/club/${clubId}`,
        method: "PUT",
        body: club,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a club with the given ID.
     *
     * @tags Club
     * @name DeleteClub
     * @summary Delete a club
     * @request DELETE:/api/club/{club_id}
     * @secure
     */
    deleteClub: (clubId: string, params: RequestParams = {}) =>
      this.request<HandlersSuccessResponse, HandlersErrorResponse>({
        path: `/api/club/${clubId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Upload a new banner image for the specified club
     *
     * @tags Club
     * @name UploadClubBanner
     * @summary Upload a club banner
     * @request POST:/api/club/{club_id}/banner
     * @secure
     */
    uploadClubBanner: (
      clubId: string,
      data: {
        /** Club banner file */
        image: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlersUploadClubBannerResponse, HandlersErrorResponse>({
        path: `/api/club/${clubId}/banner`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Join a club with the given ID.
     *
     * @tags Club
     * @name JoinClub
     * @summary Join a club
     * @request POST:/api/club/{club_id}/join
     * @secure
     */
    joinClub: (clubId: string, params: RequestParams = {}) =>
      this.request<HandlersSuccessResponse, HandlersErrorResponse>({
        path: `/api/club/${clubId}/join`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a club's leaderboard with the given ID.
     *
     * @tags Club
     * @name GetClubLeaderboard
     * @summary Get a club's leaderboard
     * @request GET:/api/club/{club_id}/leaderboard
     * @secure
     */
    getClubLeaderboard: (clubId: string, params: RequestParams = {}) =>
      this.request<RepositoryGetClubLeaderboardRow[], HandlersErrorResponse>({
        path: `/api/club/${clubId}/leaderboard`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Leave a club with the given ID.
     *
     * @tags Club
     * @name LeaveClub
     * @summary Leave a club
     * @request POST:/api/club/{club_id}/leave
     * @secure
     */
    leaveClub: (clubId: string, params: RequestParams = {}) =>
      this.request<HandlersSuccessResponse, HandlersErrorResponse>({
        path: `/api/club/${clubId}/leave`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get metrics for the specified club
     *
     * @tags Club
     * @name GetClubMetrics
     * @summary Get club metrics
     * @request GET:/api/club/{club_id}/metrics
     * @secure
     */
    getClubMetrics: (clubId: string, params: RequestParams = {}) =>
      this.request<RepositoryMetric[], HandlersErrorResponse>({
        path: `/api/club/${clubId}/metrics`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new post in a club
     *
     * @tags Club
     * @name CreateClubPost
     * @summary Create a new club post
     * @request POST:/api/club/{club_id}/post
     * @secure
     */
    createClubPost: (
      clubId: string,
      body: HandlersClubPostRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlersCreatedResponse, HandlersErrorResponse>({
        path: `/api/club/${clubId}/post`,
        method: "POST",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a club post
     *
     * @tags Club
     * @name GetClubPost
     * @summary Get a club post
     * @request GET:/api/club/{club_id}/post/{post_id}
     * @secure
     */
    getClubPost: (clubId: string, postId: string, params: RequestParams = {}) =>
      this.request<RepositoryClubPost, HandlersErrorResponse>({
        path: `/api/club/${clubId}/post/${postId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a club post
     *
     * @tags Club
     * @name DeleteClubPost
     * @summary Delete a club post
     * @request DELETE:/api/club/{club_id}/post/{post_id}
     * @secure
     */
    deleteClubPost: (
      clubId: string,
      postId: string,
      params: RequestParams = {},
    ) =>
      this.request<HandlersSuccessResponse, HandlersErrorResponse>({
        path: `/api/club/${clubId}/post/${postId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get all posts in a club
     *
     * @tags Club
     * @name GetClubPosts
     * @summary Get club posts
     * @request GET:/api/club/{club_id}/posts
     * @secure
     */
    getClubPosts: (clubId: string, params: RequestParams = {}) =>
      this.request<RepositoryGetClubPostsRow[], HandlersErrorResponse>({
        path: `/api/club/${clubId}/posts`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of public clubs.
     *
     * @tags Club
     * @name GetPublicClubs
     * @summary Get public clubs
     * @request GET:/api/clubs
     * @secure
     */
    getPublicClubs: (params: RequestParams = {}) =>
      this.request<RepositoryClub[], HandlersErrorResponse>({
        path: `/api/clubs`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Login a user with (email or username) and password
     *
     * @tags User
     * @name LoginUser
     * @summary Login a user
     * @request POST:/api/login
     */
    loginUser: (user: HandlersLoginUserRequest, params: RequestParams = {}) =>
      this.request<HandlersSuccessfulLoginResponse, HandlersErrorResponse>({
        path: `/api/login`,
        method: "POST",
        body: user,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new metric with the provided details.
     *
     * @tags Metric
     * @name CreateMetric
     * @summary Create a new metric
     * @request POST:/api/metric
     * @secure
     */
    createMetric: (
      metric: RepositoryCreateMetricParams,
      params: RequestParams = {},
    ) =>
      this.request<HandlersCreatedResponse, HandlersErrorResponse>({
        path: `/api/metric`,
        method: "POST",
        body: metric,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a metric by ID.
     *
     * @tags Metric
     * @name GetMetric
     * @summary Get a metric
     * @request GET:/api/metric/{metric_id}
     * @secure
     */
    getMetric: (metricId: string, params: RequestParams = {}) =>
      this.request<RepositoryMetric, HandlersErrorResponse>({
        path: `/api/metric/${metricId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update a metric by ID.
     *
     * @tags Metric
     * @name UpdateMetric
     * @summary Update a metric
     * @request PUT:/api/metric/{metric_id}
     * @secure
     */
    updateMetric: (
      metricId: string,
      metric: RepositoryUpdateMetricParams,
      params: RequestParams = {},
    ) =>
      this.request<HandlersSuccessResponse, HandlersErrorResponse>({
        path: `/api/metric/${metricId}`,
        method: "PUT",
        body: metric,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a metric by ID.
     *
     * @tags Metric
     * @name DeleteMetric
     * @summary Delete a metric
     * @request DELETE:/api/metric/{metric_id}
     * @secure
     */
    deleteMetric: (metricId: string, params: RequestParams = {}) =>
      this.request<HandlersSuccessResponse, HandlersErrorResponse>({
        path: `/api/metric/${metricId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new metric entry for the current instance of a metric.
     *
     * @tags Metric
     * @name CreateMetricEntry
     * @summary Create a new metric entry
     * @request POST:/api/metric/{metric_id}/entry
     * @secure
     */
    createMetricEntry: (
      metricId: string,
      entry: RepositoryCreateMetricEntryParams,
      params: RequestParams = {},
    ) =>
      this.request<HandlersCreatedResponse, HandlersErrorResponse>({
        path: `/api/metric/${metricId}/entry`,
        method: "POST",
        body: entry,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get all entries for all metric instances given a metric.
     *
     * @tags Metric
     * @name GetHistoricalMetricEntries
     * @summary Get Historical metric entries
     * @request GET:/api/metric/{metric_id}/historical-entries
     * @secure
     */
    getHistoricalMetricEntries: (
      metricId: string,
      params: RequestParams = {},
    ) =>
      this.request<RepositoryMetricEntry[], HandlersErrorResponse>({
        path: `/api/metric/${metricId}/historical-entries`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get all entries for the latest metric instance.
     *
     * @tags Metric
     * @name GetLatestMetricEntries
     * @summary Get latest metric entries
     * @request GET:/api/metric/{metric_id}/latest-entries
     * @secure
     */
    getLatestMetricEntries: (metricId: string, params: RequestParams = {}) =>
      this.request<RepositoryMetricEntry[], HandlersErrorResponse>({
        path: `/api/metric/${metricId}/latest-entries`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Register a new user with email, username, and password
     *
     * @tags User
     * @name RegisterUser
     * @summary Register a new user
     * @request POST:/api/register
     */
    registerUser: (
      user: HandlersRegisterUserRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlersSuccessfulLoginResponse, HandlersErrorResponse>({
        path: `/api/register`,
        method: "POST",
        body: user,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get user information by ID
     *
     * @tags User
     * @name GetUser
     * @summary Get user information
     * @request GET:/api/user
     * @secure
     */
    getUser: (params: RequestParams = {}) =>
      this.request<RepositoryGetUserDisplayRow, HandlersErrorResponse>({
        path: `/api/user`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update an existing user's details, all parameters are optional.
     *
     * @tags User
     * @name UpdateUser
     * @summary Update an existing user
     * @request PUT:/api/user
     * @secure
     */
    updateUser: (user: HandlersUpdateUserRequest, params: RequestParams = {}) =>
      this.request<HandlersSuccessResponse, HandlersErrorResponse>({
        path: `/api/user`,
        method: "PUT",
        body: user,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a list of a user's joined clubs
     *
     * @tags User
     * @name GetUserClubs
     * @summary Get a list of a user's joined clubs
     * @request GET:/api/user/clubs
     * @secure
     */
    getUserClubs: (params: RequestParams = {}) =>
      this.request<RepositoryGetUserClubsRow[], HandlersErrorResponse>({
        path: `/api/user/clubs`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get all metric entries turned in by a user.
     *
     * @tags User
     * @name GetUserMetricEntries
     * @summary Get user metric entries
     * @request GET:/api/user/metric-entries
     * @secure
     */
    getUserMetricEntries: (params: RequestParams = {}) =>
      this.request<RepositoryMetricEntry[], HandlersErrorResponse>({
        path: `/api/user/metric-entries`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get all metrics for a user from all joined clubs.
     *
     * @tags User
     * @name GetUserMetrics
     * @summary Get user metrics
     * @request GET:/api/user/metrics
     * @secure
     */
    getUserMetrics: (params: RequestParams = {}) =>
      this.request<RepositoryMetric[], HandlersErrorResponse>({
        path: `/api/user/metrics`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Upload a new profile picture for the authenticated user
     *
     * @tags User
     * @name UploadProfilePicture
     * @summary Upload a profile picture
     * @request POST:/api/user/profile-picture
     * @secure
     */
    uploadProfilePicture: (
      data: {
        /**
         * Profile picture file
         * @format binary
         */
        image: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlersUploadProfilePictureResponse, HandlersErrorResponse>(
        {
          path: `/api/user/profile-picture`,
          method: "POST",
          body: data,
          secure: true,
          type: ContentType.FormData,
          format: "json",
          ...params,
        },
      ),

    /**
     * @description Get public user information by ID
     *
     * @tags User
     * @name GetUserById
     * @summary Get user information by ID
     * @request GET:/api/user/{id}
     * @secure
     */
    getUserById: (id: string, params: RequestParams = {}) =>
      this.request<RepositoryGetUserDisplayRow, HandlersErrorResponse>({
        path: `/api/user/${id}`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Current version of the API
     *
     * @tags Util
     * @name Version
     * @summary Get the current version of the API
     * @request GET:/api/version
     */
    version: (params: RequestParams = {}) =>
      this.request<HandlersVersionResponse, HandlersErrorResponse>({
        path: `/api/version`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
