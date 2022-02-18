import _ from 'lodash';
import axios from 'axios';

export class Avn {
  constructor(token = '') {
    this.token = token;
  }
  _call(req) {
    return axios(
      _.merge({}, req, { headers: { authorization: `aivenv1 ${this.token}` } }),
    );
  }
  async getServices(projectName) {
    const res = await this._call({
      url: `https://api.aiven.io/v1/project/${projectName}/service`,
    });

    return _.get(res, 'data.services').filter(
      (service) => service.service_type === 'kafka',
    );
  }
  async getTopics(projectName, clusterName) {
    const res = await this._call({
      url: `https://api.aiven.io/v1/project/${projectName}/service/${clusterName}/topic`,
    });

    return _.get(res, 'data.topics');
  }
  async getTopic(projectName, clusterName, topicName) {
    const res = await this._call({
      url: `https://api.aiven.io/v1/project/${projectName}/service/${clusterName}/topic/${topicName}`,
    });

    const topic = _.get(res, 'data.topic');
    topic.ts = new Date().toISOString();

    if (topic.cleanup_policy === 'delete') {
      const durationSeconds = topic.retention_hours * 3600;
      let delta = 0;
      topic.partitions.forEach(
        ({ earliest_offset, latest_offset }) =>
          (delta += latest_offset - earliest_offset),
      );
      topic.throughput = {
        durationSeconds,
        delta,
        messagesPerSecond: delta / durationSeconds,
      };
    }

    return topic;
  }
  async me() {
    const res = await this._call({
      url: `https://api.aiven.io/v1/me`,
    });

    return _.get(res, 'data.user');
  }
}
