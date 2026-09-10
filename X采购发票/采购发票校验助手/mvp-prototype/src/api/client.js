// =========================================================
// X · 采购发票校验助手 · API 客户端（由 mvp_spec.apiRoutes 生成）
// =========================================================
import axios from 'axios';

const http = axios.create({ baseURL: '/api', timeout: 30000 });

export const api = {

  collectInvoices: (data) => http.request({
    url: "/invoice/collect",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  recognizeInvoices: (data) => http.request({
    url: "/invoice/recognize",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  runThreeWayMatch: (data) => http.request({
    url: "/match/run",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  judgeException: (data) => http.request({
    url: "/exception/judge",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  batchPrebook: (data) => http.request({
    url: "/ledger/prebook",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  batchPost: (data) => http.request({
    url: "/ledger/post",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  syncLeqi: (data) => http.request({
    url: "/ledger/sync-leqi",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  chatAssistant: (data) => http.request({
    url: "/agent/chat",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  getPurchaseOrders: (data) => http.request({
    url: "/erp/purchase-orders",
    method: 'GET',
    params: data || {},
    
  }).then((r) => r.data),

  getGoodsReceipts: (data) => http.request({
    url: "/erp/goods-receipts",
    method: 'GET',
    params: data || {},
    
  }).then((r) => r.data),

  getDeliveryNotes: (data) => http.request({
    url: "/fs/delivery-notes",
    method: 'GET',
    params: data || {},
    
  }).then((r) => r.data),

  getErpValidation: (data) => http.request({
    url: "/erp/validation",
    method: 'GET',
    params: data || {},
    
  }).then((r) => r.data),

  getMasterData: (data) => http.request({
    url: "/master/dictionary",
    method: 'GET',
    params: data || {},
    
  }).then((r) => r.data),

};