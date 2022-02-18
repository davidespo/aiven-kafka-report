import _ from 'lodash';

function arrayStats(arr) {
  let count = arr.length;
  let sum = 0;
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  arr.forEach((item) => {
    min = Math.min(min, item);
    max = Math.max(max, item);
    sum += item;
  });
  const mean = sum / count;
  let sd = 0;
  arr.map((item) => (sd += Math.pow(item - mean, 2)));
  sd = Math.sqrt(sd);
  const nsd = sd / mean;
  const range = max - min;
  const nRange = range / mean;
  return { count, min, max, sum, mean, sd, nsd, range, nRange };
}

function consumerGroupInsightReport(topic, cg) {
  const topicName = topic.topic_name;
  const temp = {};
  topic.partitions.forEach(({ partition, latest_offset, consumer_groups }) => {
    consumer_groups.forEach(({ group_name, offset }) => {
      const lag = Math.max(latest_offset - offset, 0);
      if (!temp[group_name]) {
        temp[group_name] = {};
      }
      if (!temp[group_name][topicName]) {
        temp[group_name][topicName] = { offsets: [], lags: [] };
      }
      const group = temp[group_name][topicName];
      group.offsets[partition] = offset;
      group.lags[partition] = lag;
    });
  });
  const cgNames = Object.keys(temp);
  const consumerGroups = { count: cgNames.length, totalLag: 0 };
  cgNames.forEach((group_name) => {
    const lag = arrayStats(temp[group_name][topicName].lags);
    temp[group_name][topicName].stats = { lag };
    consumerGroups.totalLag += lag.sum;
  });
  if (!!cg) {
    _.merge(cg, temp);
  }
  return consumerGroups;
}

const getConfig = (topic, conf) => _.get(topic, `config.${conf}.value`);

export function topicInsightsReport(topic, cg = {}) {
  const name = topic.topic_name;
  // min_insync_replicas - top level
  // retention_bytes - top level
  // replication - top level
  const { min_insync_replicas, replication, retention_bytes } = topic;
  const partitions = topic.partitions.length;
  // compression_type - config
  const compression = getConfig(topic, 'compression_type');
  // max_message_bytes - config
  const maxMessageSize = getConfig(topic, 'max_message_bytes');
  // cleanup_policy
  const cleanupPolicy = getConfig(topic, 'cleanup_policy');
  const stats = {
    count: arrayStats(
      topic.partitions.map(
        ({ earliest_offset, latest_offset }) => latest_offset - earliest_offset,
      ),
    ),
    size: arrayStats(topic.partitions.map(({ size }) => size)),
  };

  const throughput = {
    cleanupPolicy,
  };
  if (cleanupPolicy === 'delete') {
    throughput.retentionMs = getConfig(topic, 'retention_ms');
    if (throughput.retentionMs > 0) {
      throughput.ratePerSec = (stats.count.sum * 1000) / throughput.retentionMs;
      throughput.bytesPerSec = (stats.size.sum * 1000) / throughput.retentionMs;
    }
  }
  const avgMessageSize = stats.size.sum / stats.count.sum;
  const consumerGroups = consumerGroupInsightReport(topic, cg);

  return {
    name,
    partitions,
    replication,
    retention_bytes,
    min_insync_replicas,
    compression,
    maxMessageSize,
    cleanupPolicy,
    avgMessageSize,
    stats,
    throughput,
    consumerGroups,
  };
}

export function topicsReport(topics, cg = {}) {
  const count = topics.length;
  let partitionCount = 0;
  let replicationCount = 0;
  let ratePerSec = 0;
  let bytesPerSec = 0;
  const reports = {};
  topics.forEach((topic) => {
    const report = topicInsightsReport(topic, cg);
    reports[topic.topic_name] = report;
    partitionCount += report.partitions;
    replicationCount += report.partitions * report.replication;
    if (!!report.throughput.ratePerSec) {
      ratePerSec += report.throughput.ratePerSec;
      bytesPerSec += report.throughput.bytesPerSec;
    }
  });
  return {
    count,
    partitionCount,
    replicationCount,
    ratePerSec,
    bytesPerSec,
    topics: reports,
  };
}
