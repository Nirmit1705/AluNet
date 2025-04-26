import jwt from 'jsonwebtoken';

/**
 * Utility to safely inspect a JWT token without failing on malformed tokens
 * @param {string} token - The JWT token to inspect
 * @returns {Object} Object containing token info or error
 */
export const inspectToken = (token) => {
  if (!token) {
    return { 
      valid: false, 
      error: 'No token provided',
      details: null
    };
  }

  // Handle common issues where a string literal is passed instead of a token
  if (token === 'null' || token === 'undefined') {
    return { 
      valid: false, 
      error: 'Token is a string literal (null/undefined)', 
      details: null 
    };
  }

  try {
    // Try to decode the token without verification first
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded) {
      return { 
        valid: false, 
        error: 'Token cannot be decoded (malformed)', 
        details: null 
      };
    }

    // Token can be decoded, now try to verify it
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      return { 
        valid: true, 
        error: null, 
        details: {
          header: decoded.header,
          payload: verified,
          signature: 'present',
          expiresAt: new Date(verified.exp * 1000).toISOString()
        }
      };
    } catch (verifyError) {
      // Token could be decoded but verification failed
      return { 
        valid: false, 
        error: verifyError.message, 
        details: {
          header: decoded.header,
          payload: decoded.payload,
          signature: 'invalid or expired',
          errorType: verifyError.name
        }
      };
    }
  } catch (error) {
    // Complete token inspection failure
    return { 
      valid: false, 
      error: `Token inspection failed: ${error.message}`, 
      details: null 
    };
  }
};

/**
 * Debug endpoint helper for token troubleshooting
 * @param {Object} req - Express request object
 * @returns {Object} Token debug information
 */
export const debugTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return { 
      headerPresent: false,
      tokenExtracted: false,
      tokenInfo: null,
      error: 'No authorization header present'
    };
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    return { 
      headerPresent: true,
      tokenExtracted: false,
      tokenInfo: null,
      error: 'Authorization header does not use Bearer scheme'
    };
  }
  
  const token = authHeader.split(' ')[1];
  const tokenInfo = inspectToken(token);
  
  return {
    headerPresent: true,
    tokenExtracted: true,
    tokenInfo,
    originalHeader: authHeader
  };
};
