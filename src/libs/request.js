import axios from "axios";
import vueX from "../store.js";
import localSave from "@/libs/LocalSave.js";
import vue from "../main.js";
let TIMEOUT = 0*1000;
const request = (url, options) => {
  if(options.isLoading === true){
    vueX.commit("changeLoading", true);
  }
  let authority = JSON.parse(localSave.getSession("authority"));
  if(authority ){
    //authority = JSON.parse(authority);
    if(authority.mt){
      options.headers["mt"] = authority.mt;
    }
  }
  /*let mt = localSave.getSession("mt");
  if(mt){
    options.headers["mt"] = mt;
  }*/
  return axios.request({
    url: url,
    method: options.method,
    data: options.data,
    params: options.params,
    timeout: TIMEOUT,
    headers: options.headers
  }).then(({data}) => {
    if(options.isLoading === true){
      vueX.commit("changeLoading", false);
    }
    if(data.status == 401){
      vue.$router.push("/login");
    }
    return data;
  }).catch((error) => {
    if(error.toString().includes("timeout")){
      vue.$message.error("连接超时");
    }else{
      vue.$message.warning("连接失败，无法获取数据！");
    }
    if(options.isLoading === true){
      vueX.commit("changeLoading", false);
    }
    if(error.response && error.response.status){
      if(error.response.status === 401){
        vue.$router.push("/login");
      }
      vue.$message.error(error.response.data.message);
    }
  });
};

export default class Request {
  static async post(url, data, other){

    try {
      let options = {
        loadingTitle: "数据拼命加载中",
        loading: false,
        file: false
      }
      Object.assign(options,other);
      vueX.commit("changeLoadingTitle", options.loadingTitle);
      let action = `/api${url}`;
      return await request(action,{
        data: data,
        method: "POST",
        headers:{
          "Content-Type": options.file === true ? "multipart/form-data" :"application/json;charset=UTF-8",
          "role": 1,
        },
        isLoading: options.loading
      });
    }catch (e) {
      //throw Error(e);
    }
  }
  static async delete(url,data,other){
    try {
      let options = {
        loadingTitle: "数据拼命加载中",
        loading: false,
        file: false
      }
      Object.assign(options,other);
      vueX.commit("changeLoadingTitle", options.loadingTitle);
      let action = `/api${url}`;
      return await request(action,{
        data: data,
        method: "DELETE",
        headers:{
          "Content-Type": options.file ? "multipart/form-data" :"application/json;charset=UTF-8",
          "role": 1,
        },
        isLoading: options.loading
      });
    }catch (e) {
      //throw Error(e);
    }
  }
  static async put(url,data,other){
    try {
      let options = {
        loadingTitle: "数据拼命加载中",
        loading: false,
        file: false
      }
      Object.assign(options,other);
      vueX.commit("changeLoadingTitle", options.loadingTitle);
      let action = `/api${url}`;
      return await request(action,{
        data: data,
        method: "PUT",
        headers:{
          "Content-Type": options.file ? "multipart/form-data" :"application/json;charset=UTF-8",
          "role": 1,
        },
        isLoading: options.loading
      });
    }catch (e) {
      //throw Error(e);
    }
  }
  static async get(url, params,other){
    try{
      let options = {
        loadingTitle: "数据拼命加载中",
        loading: false,
        file: false
      }
      Object.assign(options,other);
      vueX.commit("changeLoadingTitle", options.loadingTitle);
      let action = `/api${url}`;
      return await request(action, {
        params: params,
        method: "GET",
        isLoading: options.loading,
        headers:{
          "Content-Type": "application/json;charset=UTF-8",
          "role": 1,
        },
      });
    }catch (e) {
      //throw Error(e);
    }
  }
}
