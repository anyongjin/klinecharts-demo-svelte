import { get } from 'svelte/store';
import {$fetch, type SearchParameters, FetchError} from "ofetch";
import _ from "lodash";
import {auth, signOut} from "./auth";

export type ApiResult = Record<string, any> & {
  code: number,
  msg?: string
}

type ApiType = "GET" | "POST" | "PUT" | "HEAD" | "DELETE" | "OPTIONS"

const requestApi = async function(method: ApiType, url: string,
                                  query?: SearchParameters,
                                  body?: RequestInit["body"] | Record<string, any>): Promise<ApiResult> {
  const {token} = get(auth)
  try {
    const headers: Record<string, any> = {'X-Authorization': token}
    // @ts-ignore
    // 仅客户端请求，服务器渲染期间返回假数据。适用于用户交互导致的网络请求
    let prefix = '/api'
    if(import.meta.env.DEV){
      prefix = 'http://localhost:8000/api'
    }
    const rsp = await $fetch(prefix + url, {method, body, query, headers});
    if(!_.isObject(rsp)){
      return {code: 200, data: rsp}
    }
    const data = rsp as Record<string, any>
    return {code: 200, msg: '', ...data}
  }catch (e){
    const err = (e as FetchError)
    const msg = err.data && err.data.detail ? `${err.status}: ${err.data.detail}` : err.toString()
    const result = {code: err.status ?? 400, msg}
    if(result.code == 401){
      console.error('auth token invalid, reset..', token)
      signOut()
    }
    return result
  }
}


export async function getApi(url: string, query?: SearchParameters): Promise<ApiResult> {
  return requestApi('GET', url, query, null)
}

export async function postApi(url: string, body: RequestInit["body"] | Record<string, any>,
                              query?: SearchParameters): Promise<ApiResult> {
  return requestApi('POST', url, query, body)
}
