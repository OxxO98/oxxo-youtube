import type { Request, RequestHandler, Response } from "express";

export type RouterParams = Record<string, string>;
export type RouterBody = Record<string, any>;
export type RouterQuery = Record<string, any>;

export type RouterRequest<
  Body = RouterBody,
  Query = RouterQuery,
  Params extends RouterParams = RouterParams
> = Request<Params, unknown, Body, Query>;

export type RouterResponse<Data = unknown> = Response<Data>;

export type RouterHandler<
  Body = RouterBody,
  Query = RouterQuery,
  ResponseBody = unknown,
  Params extends RouterParams = RouterParams
> = RequestHandler<Params, ResponseBody, Body, Query>;

export interface ApiResponse<Data = unknown> {
  data: Data;
  message?: string;
}

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}
