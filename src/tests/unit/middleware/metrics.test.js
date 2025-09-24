const { metricsMiddleware } = require('../../../middleware/metrics');

describe('Metrics Middleware', () => {
  let mockHandler;
  let mockEvent;
  let mockContext;

  beforeEach(() => {
    mockHandler = jest.fn();
    mockEvent = {
      path: '/weather/current/123',
      resource: '/weather/current/{cityId}'
    };
    mockContext = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should record successful request metrics', async () => {
    const mockResponse = { statusCode: 200, body: 'success' };
    mockHandler.mockResolvedValue(mockResponse);

    const wrappedHandler = metricsMiddleware(mockHandler);
    const result = await wrappedHandler(mockEvent, mockContext);

    expect(result).toEqual(mockResponse);
    expect(mockHandler).toHaveBeenCalledWith(mockEvent, mockContext);
  });

  test('should record failed request metrics for 4xx status codes', async () => {
    const mockResponse = { statusCode: 400, body: 'bad request' };
    mockHandler.mockResolvedValue(mockResponse);

    const wrappedHandler = metricsMiddleware(mockHandler);
    const result = await wrappedHandler(mockEvent, mockContext);

    expect(result).toEqual(mockResponse);
    expect(mockHandler).toHaveBeenCalledWith(mockEvent, mockContext);
  });

  test('should record failed request metrics for 5xx status codes', async () => {
    const mockResponse = { statusCode: 500, body: 'internal error' };
    mockHandler.mockResolvedValue(mockResponse);

    const wrappedHandler = metricsMiddleware(mockHandler);
    const result = await wrappedHandler(mockEvent, mockContext);

    expect(result).toEqual(mockResponse);
    expect(mockHandler).toHaveBeenCalledWith(mockEvent, mockContext);
  });

  test('should record failed request metrics when handler throws error', async () => {
    const mockError = new Error('Handler error');
    mockHandler.mockRejectedValue(mockError);

    const wrappedHandler = metricsMiddleware(mockHandler);

    await expect(wrappedHandler(mockEvent, mockContext)).rejects.toThrow('Handler error');
    expect(mockHandler).toHaveBeenCalledWith(mockEvent, mockContext);
  });

  test('should use path as endpoint when available', async () => {
    const mockResponse = { statusCode: 200, body: 'success' };
    mockHandler.mockResolvedValue(mockResponse);

    const wrappedHandler = metricsMiddleware(mockHandler);
    await wrappedHandler(mockEvent, mockContext);

    expect(mockHandler).toHaveBeenCalledWith(mockEvent, mockContext);
  });

  test('should use resource as endpoint when path is not available', async () => {
    const mockResponse = { statusCode: 200, body: 'success' };
    mockHandler.mockResolvedValue(mockResponse);
    
    const eventWithoutPath = { resource: '/weather/current/{cityId}' };
    mockHandler.mockResolvedValue(mockResponse);

    const wrappedHandler = metricsMiddleware(mockHandler);
    await wrappedHandler(eventWithoutPath, mockContext);

    expect(mockHandler).toHaveBeenCalledWith(eventWithoutPath, mockContext);
  });

  test('should use unknown as endpoint when neither path nor resource is available', async () => {
    const mockResponse = { statusCode: 200, body: 'success' };
    mockHandler.mockResolvedValue(mockResponse);
    
    const eventWithoutPathOrResource = {};
    mockHandler.mockResolvedValue(mockResponse);

    const wrappedHandler = metricsMiddleware(mockHandler);
    await wrappedHandler(eventWithoutPathOrResource, mockContext);

    expect(mockHandler).toHaveBeenCalledWith(eventWithoutPathOrResource, mockContext);
  });
});
