import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Avn } from './api';

import User from './User';
import SelectableList from './SelectableList';
import Topics from './Topics';

const TOKEN =
  'P//yIo9h1RGnK62S/X9rD2mq8dNFaBYiALgqqvJGfeN3pbjqdRULesL+mjskNa/lspjsUByroNjBE/gq10xFq+THpbK9PoitgQnGqAzAk0D7P2jz46Q5BiTAbkeMOTA/cIKSf37F55uFdpUk4DwOq0T08Xxdcehm5Lvkjg1LtxF+X3wjydg/hFYxnRTkXfkNdXN4/KkfTPm4vfFiXNtBu/uTMKqBv0LAgNPuJPMyw6pRrUXyWgFg+0dc3XQuth4vYgGdt0kAuJJig7dywG2CLqxpoTKbrMoYRcBolWiSlXTSMNfkZKlPxfql4kpLy8ArJOVlSoFnKsjgTEZH5NEtjKWru186SO+O2oCmA/g=';

export default ({ token }) => {
  const [me, setMe] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [activeProject, _setActiveProject] = useState(null);
  const [services, setServices] = useState(null);
  const [activeCluster, _setActiveCluster] = useState(null);
  const [topics, setTopics] = useState(null);
  const [topicsReport, setTopicsReport] = useState([]);
  const api = new Avn(token);
  async function setActiveProject(projectName) {
    _setActiveProject(projectName);
    setServices(await api.getServices(projectName));
    _setActiveCluster(null);
    setTopics(null);
  }
  async function setActiveCluster(serviceName) {
    _setActiveCluster(serviceName);
    setTopics(null);
    setTopics(await api.getTopics(activeProject, serviceName));
  }
  useEffect(() => {
    if (!!activeCluster && !!topics) {
      runTopicReport(activeProject, activeCluster);
    }
  }, [activeProject, activeCluster, topics]);
  async function runTopicReport(projectName, serviceName, report = []) {
    if (
      projectName === activeProject &&
      serviceName === activeCluster &&
      topics &&
      report.length < topics.length
    ) {
      const topic = await api.getTopic(
        projectName,
        serviceName,
        topics[report.length].topic_name,
      );
      report.push(topic);
      if (projectName === activeProject && serviceName == activeCluster) {
        setTopicsReport([...report]);
      }
      setTimeout(() => runTopicReport(projectName, serviceName, report), 1000);
    }
  }
  useEffect(() => {
    setMe(null);
    api
      .me()
      .then((user) => setMe(user))
      .catch((error) => setApiError(error));
  }, [token]);
  if (!me && !apiError) {
    return '';
  }
  return (
    <div className="container">
      {apiError && <p className="lead text-danger">{apiError.message}</p>}
      <User user={me} />
      <div className="row">
        <div className="col-3">
          <h1>Projects</h1>
          <SelectableList
            items={_.get(me, 'projects')}
            activeValue={activeProject}
            setActiveValue={setActiveProject}
          />
        </div>
        <div className="col-3">
          <h1>Clusters</h1>
          <SelectableList
            items={services}
            nameFunc={({ service_name }) => service_name}
            activeValue={activeCluster}
            setActiveValue={setActiveCluster}
          />
        </div>
        <div className="col-6">
          <h1>Topics</h1>
          <Topics topics={topics} topicsFull={topicsReport} />
        </div>
      </div>
    </div>
  );
};
