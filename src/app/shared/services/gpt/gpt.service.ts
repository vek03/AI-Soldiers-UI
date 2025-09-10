import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RiskAnalysisRequest } from '../watsonx/watsonx.service';

export interface CsvRow {
  [key: string]: string;
}

export interface RiskAnalysisResponseGPT {
  engine: string;
  ok: boolean;
  model: string;
  predictions: Array<{
    fields: string[];
    values: Array<Array<string | number>>;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class GptService {

  private readonly baseUrl = environment.gptApiBaseUrl;
  private readonly apiKey = environment.gptApiKey;

  constructor(private http: HttpClient) { }

  analyzeRisk(data: RiskAnalysisRequest): Observable<RiskAnalysisResponseGPT> {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    const url = `${this.baseUrl}/model-risk`;

    return this.http.post<RiskAnalysisResponseGPT>(url, data, { headers });
  }

  convertCsvToRiskAnalysis(csvData: CsvRow[], headers: string[]): RiskAnalysisRequest {
    const limitedData = csvData.slice(0, 10);
    const filteredHeaders = headers.filter(header => header !== 'Risk');

    const values = limitedData.map(row => {
      return filteredHeaders.map(header => {
        const value = row[header];

        if (header === 'LoanDuration' || header === 'LoanAmount' ||
            header === 'InstallmentPercent' || header === 'CurrentResidenceDuration' ||
            header === 'Age' || header === 'ExistingCreditsCount' ||
            header === 'Dependents') {
          return parseInt(value) || 0;
        }

        return value;
      });
    });

    return {
      input_data: [{
        fields: filteredHeaders,
        values: values
      }]
    };
  }

  analyzeRiskLocal(data: RiskAnalysisRequest): Observable<RiskAnalysisResponseGPT> {
    return new Observable(observer => {
      setTimeout(() => {
        const recordCount = data.input_data[0]?.values?.length || 0;

        const values = [] as Array<[string, number]>;
        for (let i = 0; i < recordCount; i++) {
          values.push([
            this.generateRandomPrediction(),
            this.generateRandomProbabilities()
          ]);
        }

        const result: RiskAnalysisResponseGPT = {
          engine: 'local-simulation',
          ok: true,
          model: 'gpt-simulated-model',
          predictions: [{
            fields: ['prediction', 'probability'],
            values: values as any
          }]
        };

        observer.next(result);
        observer.complete();
      }, 2000);
    });
  }

  private generateRandomPrediction(): string {
    const predictions = ['No Risk', 'Low Risk', 'Medium Risk', 'High Risk'];
    return predictions[Math.floor(Math.random() * predictions.length)];
  }

  private generateRandomProbabilities(): number {
    const p1 = Math.random();
    return p1;
  }
}


