import React from 'react';

const User = ({ user }) => {
  if (!user) {
    return '';
  }
  const { user: email, real_name } = user;
  return (
    <div>
      <p>Hello, {real_name || email}!</p>
      {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
    </div>
  );
};

export default User;
