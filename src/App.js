import React, { useState, useEffect } from 'react';
import _ from 'lodash';

import KafkaReport from './KafkaReport';

const STORAGE_KEY = 'AVN_API_KEY';

export default () => {
  const [token, _setToken] = useState(
    atob(window.localStorage.getItem(STORAGE_KEY) || ''),
  );
  function setToken(value) {
    window.localStorage.setItem(STORAGE_KEY, btoa(value));
    _setToken(value);
  }
  return (
    <div className="container">
      <div className="my-3">
        <p className="lead">
          Aiven API Token (
          <a href="https://help.aiven.io/en/articles/2059201-authentication-tokens">
            help.aiven.io
          </a>
          )
        </p>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="form-control"
        />
      </div>
      {!!token && <KafkaReport token={token} />}
    </div>
  );
};
