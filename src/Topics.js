import React from 'react';
import _ from 'lodash';
import { topicsReport } from './report.js';

import ReportContainer from './reports/ReportContainer.js';

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

const Topics = ({ topics, topicsFull }) => {
  if (!topics || !topicsFull) {
    return '';
  }
  const report = topicsReport(topicsFull);
  const topicCsv = toCsv(topics);
  const topicsJsonRaw = JSON.stringify(topicsFull);
  return (
    <div>
      <p>{topics.length} topics found</p>
      <div className="row">
        <div className="col-6">
          <h3 className="text-success">CSV Summary - (COMPLETE)</h3>
          <textarea
            style={{ width: '100%' }}
            rows="5"
            value={topicCsv}
            readOnly
          ></textarea>
          <button
            className="btn btn-primary"
            onClick={() => navigator.clipboard.writeText(topicCsv)}
          >
            <i className="fa fa-copy"></i> Copy to Clipboard
          </button>
        </div>
        <div className="col-6">
          <h3
            className={
              topics.length === topicsFull.length
                ? 'text-success'
                : 'text-warning'
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
            rows="5"
            value={topicsJsonRaw}
            readOnly
          ></textarea>
          <button
            className="btn btn-primary"
            onClick={() => navigator.clipboard.writeText(topicsJsonRaw)}
          >
            <i className="fa fa-copy"></i> Copy to Clipboard
          </button>
        </div>
      </div>
      <div className="p-5">
        <hr />
      </div>
      <ReportContainer report={report} />
    </div>
  );
};

export default Topics;
