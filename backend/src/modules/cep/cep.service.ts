import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

import { CepResponseDto } from './dto/cep-response.dto';

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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const cachedResult = await this.cacheManager.get<CepResponseDto>(cacheKey);

    if (cachedResult) {
      return {
        ...cachedResult,
        fromCache: true,
      };
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
      await this.cacheManager.set(cacheKey, result, 24 * 60 * 60 * 1000);

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
      await this.cacheManager.del(`cep:${cepLimpo}`);
    } else {
      // In cache-manager v6+, there's no reset() method.
      // We'll use del() for each key individually if needed
      // For now, we do nothing when clearing all cache
      console.warn('Limpar todo o cache não está implementado na v6 do cache-manager');
    }
  }

  async obterEstatisticasCache(): Promise<{
    totalCeps: number;
    cepsRecentes: string[];
  }> {
    // This is a basic example - real implementation would depend on Redis
    // For now, we return mock data
    return {
      totalCeps: 0,
      cepsRecentes: [],
    };
  }
}