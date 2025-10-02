import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

import { CepResponseDto } from './dto/cep-response.dto';
import { RedisService } from '../../shared/redis.service';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

@Injectable()
export class CepService {
  private readonly viaCepUrl: string;

  constructor(
    private httpService: HttpService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {
    this.viaCepUrl = this.configService.get<string>('VIACEP_API_URL') || 'https://viacep.com.br/ws';
  }

  async consultarCep(cep: string): Promise<CepResponseDto | null> {
    // Validar formato do CEP
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      throw new BadRequestException('CEP deve conter exatamente 8 dígitos');
    }

    // Verificar cache primeiro
    const cacheKey = `cep:${cepLimpo}`;
    const cachedResult = await this.redisService.get(cacheKey);

    if (cachedResult) {
      try {
        const parsedResult = JSON.parse(cachedResult) as CepResponseDto;
        return {
          ...parsedResult,
          fromCache: true,
        };
      } catch (error) {
        // Se falhar ao parsear, limpar cache inválido
        await this.redisService.del(cacheKey);
      }
    }

    try {
      // Consultar API ViaCEP
      const url = `${this.viaCepUrl}/${cepLimpo}/json/`;
      const response = await firstValueFrom(
        this.httpService.get<ViaCepResponse>(url)
      );

      const data = response.data;

      // Verificar se o CEP foi encontrado
      if (data.erro) {
        return null;
      }

      // Mapear resposta
      const result: CepResponseDto = {
        cep: cepLimpo,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf,
        fromCache: false,
      };

      // Save in cache for 24 hours (ZIP codes don't change frequently)
      await this.redisService.set(cacheKey, JSON.stringify(result), 24 * 60 * 60); // TTL in seconds

      return result;
    } catch (error) {
      // Log error securely without exposing sensitive information
      if (process.env.NODE_ENV === 'development') {
        console.error('[CEP Service] Error fetching CEP:', {
          cep: cepLimpo,
          error: error.message,
        });
      }
      // Don't expose internal error details to client
      throw new BadRequestException('Erro ao consultar CEP. Verifique o CEP e tente novamente.');
    }
  }

  async limparCache(cep?: string): Promise<void> {
    if (cep) {
      const cepLimpo = cep.replace(/\D/g, '');
      await this.redisService.del(`cep:${cepLimpo}`);
    } else {
      // Note: RedisService doesn't have a method to clear all keys
      // This would require implementing a pattern-based deletion
      console.warn('Clear all cache not implemented for RedisService');
    }
  }

  async obterEstatisticasCache(): Promise<{
    totalCeps: number;
    cepsRecentes: string[];
  }> {
    // This is a basic example - real implementation would depend on Redis
    // For now, we return mock data since we don't have pattern-based queries
    return {
      totalCeps: 0,
      cepsRecentes: [],
    };
  }
}