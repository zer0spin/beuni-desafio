import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;
  private isConnected = false;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              this.logger.error('Redis: Maximum reconnection attempts reached');
              return false;
            }
            this.logger.warn(`Redis: Reconnecting attempt ${retries}`);
            return Math.min(retries * 50, 500);
          },
          connectTimeout: 60000,
        },
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis Client Error:', error.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.logger.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        this.logger.log('Redis Client Ready');
      });

      this.client.on('end', () => {
        this.logger.warn('Redis Client Connection Ended');
        this.isConnected = false;
      });

      await this.client.connect();
      this.logger.log('Redis connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error.message);
      this.isConnected = false;
    }
  }

  private async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.disconnect();
        this.logger.log('Redis connection closed');
      }
    } catch (error) {
      this.logger.error('Error disconnecting from Redis:', error.message);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis not connected, returning null for key:', key);
        return null;
      }
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error.message);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis not connected, skipping set for key:', key);
        return false;
      }

      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error.message);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis not connected, skipping delete for key:', key);
        return false;
      }
      await this.client.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error.message);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        this.logger.warn('Redis not connected, returning false for exists check:', key);
        return false;
      }
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}:`, error.message);
      return false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}