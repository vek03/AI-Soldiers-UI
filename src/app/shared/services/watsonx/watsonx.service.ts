import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CsvRow {
  [key: string]: string;
}

export interface AnalysisData {
  fileName: string;
  fileSize: number;
  totalRows: number;
  headers: string[];
  sampleData: CsvRow[];
  timestamp: string;
}

export interface RiskAnalysisRequest {
  input_data: Array<{
    fields: string[];
    values: Array<Array<string | number>>;
  }>;
}

export interface RiskAnalysisResponse {
  engine: string;
  ok: boolean;
  result: {
    predictions: Array<{
      fields: string[];
      values: Array<Array<string | number[]>>;
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WatsonxService {

  private readonly baseUrl = environment.apiBaseUrl;
  private readonly apiKey = environment.apiKey;

  constructor(private http: HttpClient) { }

  getModels(): Observable<any> {
    return this.http.get(`${this.baseUrl}/models`);
  }

  analyzeRisk(data: RiskAnalysisRequest): Observable<RiskAnalysisResponse> {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    // Endpoint para análise de risco
    const url = `${this.baseUrl}/model-risk?engine=watson`;

    return this.http.post<RiskAnalysisResponse>(url, data, { headers });
  }

  // Método para converter dados CSV para o formato da API
  convertCsvToRiskAnalysis(csvData: CsvRow[], headers: string[]): RiskAnalysisRequest {
    // Limitar a no máximo 10 itens do CSV
    const limitedData = csvData.slice(0, 10);

    // Filtrar a coluna "Risk" se ela existir
    const filteredHeaders = headers.filter(header => header !== 'Risk');

    // Mapear os dados CSV para o formato esperado pela API
    const values = limitedData.map(row => {
      return filteredHeaders.map(header => {
        const value = row[header];

        // Converter valores para o tipo apropriado
        if (header === 'LoanDuration' || header === 'LoanAmount' ||
            header === 'InstallmentPercent' || header === 'CurrentResidenceDuration' ||
            header === 'Age' || header === 'ExistingCreditsCount' ||
            header === 'Dependents') {
          return parseInt(value) || 0;
        }

        return value;
      });
    });

    // Estrutura para múltiplos registros - todos os dados ficam em um único objeto
    // com um array de valores contendo todas as linhas
    return {
      input_data: [{
        fields: filteredHeaders,
        values: values // Array de arrays, onde cada array interno é uma linha de dados
      }]
    };
  }

  // Método alternativo para simulação local (quando não há API real)
  analyzeRiskLocal(data: RiskAnalysisRequest): Observable<RiskAnalysisResponse> {
    return new Observable(observer => {
      // Simular delay de processamento
      setTimeout(() => {
        // Obter o número de registros dos dados de entrada
        const recordCount = data.input_data[0]?.values?.length || 0;

        // Gerar resultados diferentes para cada registro
        const values = [];
        for (let i = 0; i < recordCount; i++) {
          values.push([
            this.generateRandomPrediction(),
            this.generateRandomProbabilities()
          ]);
        }

        const result: RiskAnalysisResponse = {
          engine: 'local-simulation',
          ok: true,
          result: {
            predictions: [{
              fields: ['prediction', 'probability'],
              values: values
            }]
          }
        };

        observer.next(result);
        observer.complete();
      }, 2000); // 2 segundos de delay
    });
  }

  private generateRandomPrediction(): string {
    const predictions = ['No Risk', 'Low Risk', 'Medium Risk', 'High Risk'];
    return predictions[Math.floor(Math.random() * predictions.length)];
  }

  private generateRandomProbabilities(): number[] {
    // Gerar 2 probabilidades que somam 1.0
    const p1 = Math.random();
    const p2 = 1 - p1;
    return [p1, p2];
  }
}
