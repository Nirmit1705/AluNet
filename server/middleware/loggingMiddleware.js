const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  
  // Capture and log the response
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`Response status: ${res.statusCode}`);
    if (res.statusCode >= 400) {
      console.log('Error response:', body);
    }
    originalSend.call(this, body);
  };
  
  next();
};

export { requestLogger };
