import React, { useState } from 'react';
import _ from 'lodash';
import prettyBytes from 'pretty-bytes';

import Explore from './Explore';

const EMPTY_TOPICS = 'Empty Topics';
const TOPICS_NO_CONSUMERS = 'Topics w/o Consumers';
const TOPICS_BY_LAG = 'Topics with Lag';
const EXPLORE = 'All Topics';

const NavButton = ({ navKey, activeView, setActive }) => {
  return (
    <div>
      <button
        className={`btn btn${activeView === navKey ? '' : '-outline'}-primary`}
        onClick={setActive}
        style={{ width: '100%' }}
      >
        {navKey}
      </button>
    </div>
  );
};

const kvTr = (label, value) => (
  <tr>
    <td>{label}</td>
    <td>{value}</td>
  </tr>
);

//
// [[[ TODO  ]]]
// broker count
// partitions per broker
// CPU/MEM/IOPS/Network range
const ReportContainer = ({ report }) => {
  const [activeView, setActiveView] = useState(EXPLORE);
  const { count, partitionCount, replicationCount, ratePerSec, bytesPerSec } =
    report;

  const navEle = (navKey) => (
    <NavButton
      navKey={navKey}
      activeView={activeView}
      setActive={() => setActiveView(navKey)}
    />
  );

  let activeContent = <></>;
  switch (activeView) {
    case EXPLORE: {
      activeContent = <Explore report={report} />;
      break;
    }
    case TOPICS_BY_LAG: {
      activeContent = (
        <Explore
          report={report}
          predicate={(topic) => topic.consumerGroups.totalLag >= 1}
        />
      );
      break;
    }
    case TOPICS_NO_CONSUMERS: {
      activeContent = (
        <Explore
          report={report}
          predicate={(topic) => topic.consumerGroups.count === 0}
        />
      );
      break;
    }
    case EMPTY_TOPICS:
    default: {
      activeContent = (
        <Explore
          report={report}
          predicate={(topic) => topic.stats.size.sum <= 0}
        />
      );
    }
  }
  return (
    <div>
      <div className="row">
        <div className="rol-3">
          {navEle(EXPLORE)}
          {navEle(EMPTY_TOPICS)}
          {navEle(TOPICS_NO_CONSUMERS)}
          {navEle(TOPICS_BY_LAG)}
        </div>
        <div className="col-9">
          <table className="table table-hover table-striped">
            <tbody>
              {kvTr('Topic Count', count.toLocaleString())}
              {kvTr('Partition Count', partitionCount.toLocaleString())}
              {kvTr(
                'Replica Partition Count',
                replicationCount.toLocaleString(),
              )}
              {kvTr('Estimated Producer Rate', ratePerSec.toLocaleString())}
              {kvTr('Estimated Network Rate', prettyBytes(bytesPerSec))}
            </tbody>
          </table>
          <div className="alert alert-info">
            <em className="text-muted">
              <i className="fa fa-info-circle"></i> Please use better metrics
              sources for measuring Producer and Network rates.
            </em>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <hr />
          {activeContent}
        </div>
      </div>
    </div>
  );
};

export default ReportContainer;
