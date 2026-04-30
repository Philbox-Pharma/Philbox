export default function sendResponse(
  res,
  status,
  arg3,
  arg4 = null,
  arg5 = null,
  arg6 = null
) {
  let message = arg3;
  let data = arg4;
  let error = arg5;

  if (typeof arg3 === 'boolean') {
    message = arg4;
    data = arg5;
    error = arg6;
  }

  const response_body = {
    status,
    message,
  };
  if (data) response_body.data = data;
  if (error) response_body.error = error;

  if (res?.locals?.customerAlert) {
    response_body.alert = res.locals.customerAlert;
  }

  return res.status(status).json(response_body);
}
