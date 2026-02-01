import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache';
export const CACHE_TTL_KEY = 'cache_ttl';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
}

/**
 * Cache decorator for methods
 * @param options Cache configuration
 */
export const Cache = (options: CacheOptions = {}) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY, true)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL_KEY, options.ttl || 5 * 60 * 1000)(target, propertyKey, descriptor);
    
    if (options.key) {
      SetMetadata('cache_custom_key', options.key)(target, propertyKey, descriptor);
    }
  };
};

/**
 * Cache interceptor for automatic caching
 */
export const CacheInterceptor = () => {
  return SetMetadata(CACHE_KEY, true);
};