exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;

  request.headers['x-forwarded-host'] = [
    { key: 'X-Forwarded-Host', value: request.headers.host[0].value }
  ];
  return callback(null, request);
};
