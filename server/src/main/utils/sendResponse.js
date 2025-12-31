export default function sendResponse(
  res,
  status,
  message,
  data = null,
  error = null
) {
  const response_body = {
    status,
    message,
  };
  if (data) response_body.data = data;
  if (error) response_body.error = error;
  return res.status(status).json(response_body);
}
