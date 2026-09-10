// =========================================================
// 销售POD收入确认工作台 · API 客户端（由 mvp_spec.apiRoutes 生成）
// =========================================================
import axios from 'axios';

const http = axios.create({ baseURL: '/api', timeout: 30000 });

export const api = {

  loadDashboard: (data) => http.request({
    url: "/dashboard",
    method: 'GET',
    params: data || {},
    
  }).then((r) => r.data),

  syncCollection: (data) => http.request({
    url: "/collection/sync",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  getDeliveries: (data) => http.request({
    url: "/deliveries",
    method: 'GET',
    params: data || {},
    
  }).then((r) => r.data),

  getReconciliations: (data) => http.request({
    url: "/reconciliations",
    method: 'GET',
    params: data || {},
    
  }).then((r) => r.data),

  analyzeReconciliation: (data) => http.request({
    url: "/reconciliation/analyze",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  checkPodConditions: (data) => http.request({
    url: "/pod/check",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  confirmPod: (data) => http.request({
    url: "/pod/confirm",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  executePosting: (data) => http.request({
    url: "/posting/execute",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

};