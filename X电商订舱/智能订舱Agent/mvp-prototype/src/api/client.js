// =========================================================
// X 智能订舱 Agent · API 客户端（由 mvp_spec.apiRoutes 生成）
// =========================================================
import axios from 'axios';

const http = axios.create({ baseURL: '/api', timeout: 30000 });

export const api = {

  chatQuote: (data) => http.request({
    url: "/agent/chat",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  recommendSpace: (data) => http.request({
    url: "/agent/recommend",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  submitBooking: (data) => http.request({
    url: "/booking/submit",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  parseDocuments: (data) => http.request({
    url: "/document/parse",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  predictDelay: (data) => http.request({
    url: "/agent/predict-delay",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  payOrder: (data) => http.request({
    url: "/payment/pay",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  getBookings: (data) => http.request({
    url: "/orders",
    method: 'GET',
    params: data || {},
    
  }).then((r) => r.data),

  getTracking: (data) => http.request({
    url: "/shipments/tracking",
    method: 'GET',
    params: data || {},
    
  }).then((r) => r.data),

};