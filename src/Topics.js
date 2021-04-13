import React from 'react';

const CSV_HEADERS =
  'topic_name,partitions,replication,cleanup_policy,min_insync_replicas,retention_bytes,retention_hours,tags';

const toCsvRow = ({
  cleanup_policy,
  min_insync_replicas,
  partitions,
  replication,
  retention_bytes,
  retention_hours,
  tags,
  topic_name,
}) =>
  `"${topic_name}",${partitions},${replication},"${cleanup_policy}",${min_insync_replicas},${retention_bytes},${retention_hours},"${tags}"`;
const toCsv = (topics) => [CSV_HEADERS, ...topics.map(toCsvRow)].join('\n');

const Topics = ({ topics, topicsFull = [] }) => {
  if (!topics) {
    return '';
  }
  return (
    <div>
      <p>{topics.length} topics found</p>
      <h3 className="text-success">CSV Summary - (COMPLETE)</h3>
      <textarea
        style={{ width: '100%' }}
        rows="10"
        value={toCsv(topics)}
        readOnly
      ></textarea>
      <h3
        className={
          topics.length === topicsFull.length ? 'text-success' : 'text-warning'
        }
      >
        Topics Full Report - (
        {topics.length === topicsFull.length
          ? 'COMPLETE'
          : `${topicsFull.length}/${topics.length}`}
        )
      </h3>
      <textarea
        style={{ width: '100%' }}
        rows="10"
        value={JSON.stringify(topicsFull)}
        readOnly
      ></textarea>
    </div>
  );
};

export default Topics;
