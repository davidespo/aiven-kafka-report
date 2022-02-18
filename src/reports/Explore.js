import React from 'react';
import _ from 'lodash';
import prettyBytes from 'pretty-bytes';
import prettyMs from 'pretty-ms';
import { Parser } from 'json2csv';

import DataTable from 'react-data-table-component';

const safeNumber = (num) =>
  _.isNaN(num) || _.isNil(num) || !_.isNumber(num) ? -1 : num;

const asNumber = (selector) => (row) =>
  safeNumber(_.get(row, selector, -1)).toLocaleString();
const asSize = (selector) => (row) =>
  prettyBytes(safeNumber(_.get(row, selector, -1)));
const asTime = (selector) => (row) =>
  prettyMs(safeNumber(_.get(row, selector, -1)));

const n = (name, selector, formatter = asNumber) => ({
  name,
  selector: (row) => safeNumber(_.get(row, selector, -1)),
  format: formatter(selector),
  sortable: true,
  right: true,
});

/*
{
    "name": "describer",
    "partitions": 12,
    "replication": 2,
    "retention_bytes": -1,
    "min_insync_replicas": 1,
    "compression": "producer",
    "maxMessageSize": 1048588,
    "cleanupPolicy": "delete",
    "avgMessageSize": 107.36496787794997,
    "stats": {
        "count": {
            "count": 12,
            "min": 95690,
            "max": 98243,
            "sum": 1163064,
            "mean": 96922,
            "sd": 2935.4243304844363,
            "nsd": 0.030286460560909147
        },
        "size": {
            "count": 12,
            "min": 10273732,
            "max": 10544090,
            "sum": 124872329,
            "mean": 10406027.416666666,
            "sd": 317786.779603741,
            "nsd": 0.030538722115488793
        }
    },
    "throughput": {
        "cleanupPolicy": "delete",
        "retentionMs": -1,
        "ratePerSec": -1163064000,
        "bytesPerSec": -124872329000
    },
    "consumerGroups": {
        "count": 0,
        "totalLag": 0
    }
}
*/

const columns = [
  {
    name: 'Topic Name',
    selector: 'name',
    sortable: true,
  },
  n('Partitions', 'partitions'),
  n('Replication', 'replication'),
  n('Retention', 'throughput.retentionMs', asTime),
  n('Produce Rate', 'throughput.ratePerSec'),
  n('Network Rate', 'throughput.bytesPerSec', asSize),
  n('Disk Size', 'stats.size.sum', asSize),
  n('Avg. Message Size', 'avgMessageSize', asSize),
  n('Message Skew', 'stats.count.nsd'),
  n('Size Skew', 'stats.size.nsd'),
  n('Consumer Groups', 'consumerGroups.count'),
];

const csvFields = [
  'name',
  'partitions',
  'replication',
  'retention_bytes',
  'min_insync_replicas',
  'compression',
  'maxMessageSize',
  'cleanupPolicy',
  'avgMessageSize',
  'stats.count.count',
  'stats.count.min',
  'stats.count.max',
  'stats.count.sum',
  'stats.count.mean',
  'stats.count.sd',
  'stats.count.nsd',
  'stats.size.count',
  'stats.size.min',
  'stats.size.max',
  'stats.size.sum',
  'stats.size.mean',
  'stats.size.sd',
  'stats.size.nsd',
  'throughput.cleanupPolicy',
  'throughput.retentionMs',
  'throughput.ratePerSec',
  'throughput.bytesPerSec',
  'consumerGroups.count',
  'consumerGroups.totalLag',
];

const csvParser = new Parser({ fields: csvFields });

const Explore = ({ report, predicate = () => true }) => {
  const topics = Object.values(report.topics).filter(predicate);
  return (
    <div>
      <div className="pull-right">
        <button
          className="btn btn-primary"
          onClick={() => navigator.clipboard.writeText(csvParser.parse(topics))}
        >
          <i className="fa fa-copy"></i> Copy to Clipboard
        </button>
      </div>
      <DataTable
        title="Topic Insights"
        columns={columns}
        data={topics}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 15, 20, 25, 30]}
      />
      <div className="alert alert-info">
        <p>
          <em className="text-muted">
            <i className="fa fa-info-circle"></i> <code>Message Skew</code>: is
            a measure of imbalance on a partition. It is the number of standard
            deviations representing the message count per partition. Ideally
            this measure is close to zero. The larger the number, the more
            imbalance your keying strategy provides.
          </em>
        </p>
        <p>
          <em className="text-muted">
            <i className="fa fa-info-circle"></i> <code>Size Skew</code>: is a
            measure of imbalance on a partition. It is the number of standard
            deviations representing the total parition size. Ideally this
            measure is close to zero. The larger the number, the more imbalance
            your keying strategy provides or message sizes provide.
          </em>
        </p>
      </div>
    </div>
  );
};

export default Explore;
