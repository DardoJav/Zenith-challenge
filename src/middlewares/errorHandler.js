export const errorHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);

    const errorResponse = {
      message: err.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    };
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
  
    if (err.name === 'MongoError' || err.name === 'CastError') {
      return res.status(400).json({ message: 'Error cast in MongoDB' });
    }
  
    return res.status(500).json(errorResponse);
  };
  