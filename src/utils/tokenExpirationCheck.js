/**
 * Decode JWT token without external library
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
const decodeJWT = (token) => {
  if (!token) {
    return null;
  }

  try {
    // JWT has 3 parts: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = JSON.parse(atob(paddedPayload));
    return decoded;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - true if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  try {
    const decoded = decodeJWT(token);
    if (!decoded) {
      return true;
    }

    const currentTime = Date.now() / 1000; // Convert to seconds
    
    // Check if token has expiration claim
    if (decoded.exp) {
      // Token is expired if current time is greater than expiration time
      const expired = decoded.exp < currentTime;
      if (expired) {
        console.log("⏰ Token expired:", {
          expiredAt: new Date(decoded.exp * 1000).toLocaleString(),
          currentTime: new Date().toLocaleString(),
        });
      }
      return expired;
    }
    
    // If no expiration claim, consider it invalid
    return true;
  } catch (error) {
    // If token can't be decoded, consider it invalid/expired
    console.error("Error checking token expiration:", error);
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  if (!token) {
    return null;
  }

  try {
    const decoded = decodeJWT(token);
    if (decoded?.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    return null;
  }
};
