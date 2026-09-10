// =========================================================
// ZXMOTO 赛事内容工厂 Agent · API 客户端（由 mvp_spec.apiRoutes 生成）
// =========================================================
import axios from 'axios';

const http = axios.create({ baseURL: '/api', timeout: 30000 });

export const api = {

  parseFootage: (data) => http.request({
    url: "/content/parse-footage",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  scoreHighlights: (data) => http.request({
    url: "/content/highlights",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  generateScript: (data) => http.request({
    url: "/content/script",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  adaptPlatforms: (data) => http.request({
    url: "/content/adapt",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  reviewCompliance: (data) => http.request({
    url: "/content/review",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  attributePerformance: (data) => http.request({
    url: "/content/attribute",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  publishContent: (data) => http.request({
    url: "/content/publish",
    method: 'POST',
    data: data || {},
    
  }).then((r) => r.data),

  getPublishRecords: (data) => http.request({
    url: "/content/publishes",
    method: 'GET',
    params: data || {},
    
  }).then((r) => r.data),

};