// =========================================================
// 退改签智能助手 · API 客户端（由 mvp_spec.apiRoutes 生成）
// =========================================================
import axios from 'axios';

const http = axios.create({ baseURL: '/api', timeout: 30000 });

export const api = {

  identifyScene: (data) => http.request({
    url: "/scene/identify",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  translateFee: (data) => http.request({
    url: "/fee/translate",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  recommendPlans: (data) => http.request({
    url: "/plan/recommend",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  disposeChange: (data) => http.request({
    url: "/change/dispose",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  pushNotice: (data) => http.request({
    url: "/notice/push",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  getOrder: (data) => http.request({
    url: "/order",
    method: 'GET',
    params: data || {},
    
  }).then((r) => r.data),

  getRunStatus: (data) => http.request({
    url: "/run-status",
    method: 'GET',
    params: data || {},
    
  }).then((r) => r.data),

};