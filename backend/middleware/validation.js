// Input validation utilities

export function sanitizeInput(text) {
  if (typeof text !== 'string') return text;
  return text.trim().replace(/[<>]/g, '');
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }
  
  return items.every(item => 
    item.id && 
    item.name && 
    typeof item.price === 'number' &&
    typeof item.qty === 'number' &&
    item.price > 0 &&
    item.qty > 0
  );
}

// Middleware to sanitize request body
export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeInput(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
}

