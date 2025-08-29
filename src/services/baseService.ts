import axios, { AxiosInstance, AxiosResponse } from "axios";

// ===== STRUCTURAL PATTERN: Adapter Pattern =====
// Adapter for API configuration
export class ApiConfigAdapter {
  private static instance: ApiConfigAdapter;
  private baseURL: string;

  private constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL;
  }

  static getInstance(): ApiConfigAdapter {
    if (!ApiConfigAdapter.instance) {
      ApiConfigAdapter.instance = new ApiConfigAdapter();
    }
    return ApiConfigAdapter.instance;
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

// ===== BEHAVIORAL PATTERN: Strategy Pattern =====
// Strategy for different HTTP methods
export interface HttpMethodStrategy {
  execute(api: AxiosInstance, url: string, data?: unknown, params?: unknown): Promise<AxiosResponse>;
}

export class GetStrategy implements HttpMethodStrategy {
  async execute(api: AxiosInstance, url: string, _data?: unknown, params?: unknown): Promise<AxiosResponse> {
    return api.get(url, { params });
  }
}

export class PostStrategy implements HttpMethodStrategy {
  async execute(api: AxiosInstance, url: string, data?: unknown, params?: unknown): Promise<AxiosResponse> {
    return api.post(url, data, { params });
  }
}

export class PutStrategy implements HttpMethodStrategy {
  async execute(api: AxiosInstance, url: string, data?: unknown, params?: unknown): Promise<AxiosResponse> {
    return api.put(url, data, { params });
  }
}

export class DeleteStrategy implements HttpMethodStrategy {
  async execute(api: AxiosInstance, url: string, _data?: unknown, params?: unknown): Promise<AxiosResponse> {
    return api.delete(url, { params });
  }
}

// ===== CREATIONAL PATTERN: Factory Pattern =====
// Factory for HTTP method strategies
export class HttpMethodFactory {
  private static strategies: Map<string, HttpMethodStrategy> = new Map([
    ['GET', new GetStrategy()],
    ['POST', new PostStrategy()],
    ['PUT', new PutStrategy()],
    ['DELETE', new DeleteStrategy()]
  ]);

  static getStrategy(method: 'GET' | 'POST' | 'PUT' | 'DELETE'): HttpMethodStrategy {
    const strategy = this.strategies.get(method);
    if (!strategy) {
      throw new Error(`Unknown HTTP method: ${method}`);
    }
    return strategy;
  }
}

// ===== BEHAVIORAL PATTERN: Template Method Pattern =====
// Base service class with common functionality
export abstract class BaseService {
  protected api: AxiosInstance;
  protected basePath: string;

  constructor(basePath: string) {
    const config = ApiConfigAdapter.getInstance();
    this.api = axios.create({
      baseURL: `${config.getBaseURL()}/api/v1${basePath}`,
      timeout: 5000,
    });
    this.basePath = basePath;
  }

  protected async executeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: unknown,
    params?: unknown
  ): Promise<AxiosResponse> {
    const strategy = HttpMethodFactory.getStrategy(method);
    return strategy.execute(this.api, url, data, params);
  }

  protected handleResponse<T>(response: AxiosResponse): T {
    return response.data;
  }

  protected handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('An unexpected error occurred');
  }

  // ===== CRUD Template Methods =====
  protected async getAll(params?: unknown): Promise<unknown> {
    try {
      const response = await this.executeRequest('GET', '/', undefined, params);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  protected async getById(id: number): Promise<unknown> {
    try {
      const response = await this.executeRequest('GET', `/${id}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  protected async create(data: unknown): Promise<unknown> {
    try {
      const response = await this.executeRequest('POST', '/', data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  protected async update(id: number, data: unknown): Promise<unknown> {
    try {
      const response = await this.executeRequest('PUT', `/${id}`, data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  protected async delete(id: number): Promise<unknown> {
    try {
      const response = await this.executeRequest('DELETE', `/${id}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}
