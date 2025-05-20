// src/utils/metrics.ts
import { collectDefaultMetrics, Gauge, Counter, Histogram } from 'prom-client';

export const metrics = {
  bloomFilterQueries: new Counter({
    name: 'bloom_filter_queries_total',
    help: 'Total number of Bloom filter queries',
    labelNames: ['result'] // 'positive' or 'negative'
  }),
  
  databaseQueries: new Counter({
    name: 'database_email_queries_total',
    help: 'Total number of database email checks'
  }),
  
  bloomFilterErrors: new Counter({
    name: 'bloom_filter_errors_total',
    help: 'Total number of Bloom filter errors'
  }),
  
  bloomFilterSize: new Gauge({
    name: 'bloom_filter_size',
    help: 'Current size of the Bloom filter in bits'
  }),
  
  responseTimes: new Histogram({
    name: 'email_check_response_times',
    help: 'Response times for email availability checks',
    labelNames: ['stage'], // 'bloom_filter' or 'database'
    buckets: [0.1, 0.5, 1, 2, 5] // in milliseconds
  })
};

// Collect default Node.js metrics
// collectDefaultMetrics();