import { useContext, useEffect, useState, useCallback } from 'react';

import { ServerContext } from '../contexts/ServerContext';

import axios from 'axios';

//get == delete, post == put

//get만 리팩토링 중...
function useAxiosGet<T = any, P = any>(url : string, _pending : boolean | null = null, _parameter : P | null = null ) {
  const [response, setResponse] = useState<ApiResponse<T> | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [parameter, setParameter] = useState<P | null>(_parameter);

  const [pending, setPending] = useState<boolean | null>(_pending);

  const baseUrl : string = useContext(ServerContext);

  const fetch = useCallback( async () => {
    setLoading(true);
    if(parameter !== null && parameter !== undefined){
      // console.log(`fetch Parameter ${JSON.stringify(parameter)} url ${baseUrl.concat(url)}`)
      await axios.get(
        baseUrl.concat(url), { params : parameter }
      ).then(
        response => {
           if(response.data.length !== 0){
              setResponse(response.data);
           }
           else{
              setResponse(null);
           }
         })
         .catch(error => {
             setError(error);
         })
         .finally(() => {
             setLoading(false);
         }
       );
    }
    else{
      await axios.get(
        baseUrl.concat(url)
      ).then(
        response => {
           if(response.data.length !== 0){
             setResponse(response.data);
           }
           else{
            setResponse(null);
           }
         })
         .catch(error => {
             setError(error);
         })
         .finally(() => {
             setLoading(false);
         }
       );
    }
  }, [baseUrl, parameter, url]);

  const setParams = useCallback( (obj : P | null) => {
    setPending(false);
    setParameter(obj);
    setError(null);
  }, [])

  useEffect( () => {
    if(pending === false){
      fetch();
    }
  }, [parameter, fetch, pending]);

  return { response, error, loading, setParams, fetch };
}

function useAxiosPost<T = any, P = any>(url : string,  _pending : boolean | null = null, _parameter : P | null = null ) {
  const [response, setResponse] = useState<ApiResponse<T> | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [parameter, setParameter] = useState<P | null>(_parameter);

  const [pending, setPending] = useState<boolean | null>(_pending);

  const baseUrl : string = useContext(ServerContext);

  const fetch = useCallback( async () => {
    setLoading(true);
    if(parameter !== null && parameter !== undefined){
      // console.log(`fetch Parameter ${JSON.stringify(parameter)} url ${baseUrl.concat(url)}`)
      await axios.post(
        baseUrl.concat(url), parameter
      ).then(
        response => {
           if(response.data.length !== 0){
             setResponse(response.data);
           }
           else{
             setResponse(null);
           }
         })
         .catch(error => {
             setError(error);
         })
         .finally(() => {
             setLoading(false);
         }
       );
    }
    else{
      await axios.post(
        baseUrl.concat(url)
      ).then(
        response => {
           if(response.data.length !== 0){
             setResponse(response.data);
           }
           else{
            setResponse(null);
           }
         })
         .catch(error => {
             setError(error);
         })
         .finally(() => {
             setLoading(false);
         }
       );
    }
  }, [baseUrl, parameter, url]);

  const setParams = useCallback( (obj : P) => {
    setPending(false);
    setParameter(obj);
    setError(null);
    //console.log(`parameter ${JSON.stringify(obj)}`);
  }, [])

  useEffect( () => {
    if(pending === false){
      fetch();
    }
  }, [parameter, pending, fetch]);

  return { response, error, loading, setParams, fetch };
}

function useAxiosDelete<T = any, P = any>(url : string, _pending : boolean | null = null, _parameter : P | null = null ) {
  const [response, setResponse] = useState<ApiResponse<T> | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [parameter, setParameter] = useState<P | null>(_parameter);

  const [pending, setPending] = useState<boolean | null>(_pending);

  const baseUrl : string = useContext(ServerContext);

  const fetch = useCallback( async () => {
    setLoading(true);
    if(parameter !== null && parameter !== undefined){
      await axios.delete(
        baseUrl.concat(url), {params : parameter}
      ).then(
        response => {
           if(response.data.length !== 0){
             setResponse(response.data);
           }
           else{
             setResponse(null);
           }
         })
         .catch(error => {
             setError(error);
         })
         .finally(() => {
             setLoading(false);
         }
       );
    }
    else{
      await axios.delete(
        baseUrl.concat(url)
      ).then(
        response => {
           if(response.data.length !== 0){
             setResponse(response.data);
           }
           else{
            setResponse(null);
           }
         })
         .catch(error => {
             setError(error);
         })
         .finally(() => {
             setLoading(false);
         }
       );
    }
  }, [baseUrl, parameter, url]);

  const setParams = useCallback( (obj : P ) => {
    setPending(false);
    setParameter(obj);
    setError(null);
    //console.log(`parameter ${JSON.stringify(obj)}`);
  }, [])

  useEffect( () => {
    if(pending === false){
      fetch();
    }
  }, [parameter, pending, fetch]);

  return { response, error, loading, setParams, fetch };
}

function useAxiosPut<T = any, P = any>(url : string, _pending : boolean | null = null, _parameter : P | null = null ) {
  const [response, setResponse] = useState<ApiResponse<T> | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [parameter, setParameter] = useState<P | null>(_parameter);

  const [pending, setPending] = useState<boolean | null>(_pending);

  const baseUrl : string = useContext(ServerContext);

  const fetch = useCallback( async () => {
    setLoading(true);
    if(parameter !== null && parameter !== undefined){
      // console.log(`fetch Parameter ${JSON.stringify(parameter)} url ${baseUrl.concat(url)}`)
      await axios.put(
        baseUrl.concat(url), parameter
      ).then(
        response => {
           if(response.data.length !== 0){
             setResponse(response.data);
           }
           else{
             setResponse(null);
           }
         })
         .catch(error => {
             setError(error);
         })
         .finally(() => {
             setLoading(false);
         }
       );
    }
    else{
      await axios.put(
        baseUrl.concat(url)
      ).then(
        response => {
           if(response.data.length !== 0){
             setResponse(response.data);
           }
           else{
            setResponse(null);
           }
         })
         .catch(error => {
             setError(error);
         })
         .finally(() => {
             setLoading(false);
         }
       );
    }
  }, [baseUrl, parameter, url]);

  const setParams = useCallback( (obj : P | null) => {
    setPending(false);
    setParameter(obj);
    setError(null);
    //console.log(`parameter ${JSON.stringify(obj)}`);
  }, [])

  useEffect( () => {
    if(pending === false){
      fetch();
    }
  }, [parameter, pending, fetch]);

  return { response, error, loading, setParams, fetch };
}

export { useAxiosGet, useAxiosPost, useAxiosDelete, useAxiosPut }