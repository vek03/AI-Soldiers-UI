import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatsonxService, RiskAnalysisRequest, RiskAnalysisResponse } from './shared/services/watsonx.service';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { FooterComponent } from './components/footer/footer.component';

interface ValidationMessage {
  type: 'error' | 'success';
  text: string;
}

interface CsvRow {
  [key: string]: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [CommonModule, NavbarComponent, FooterComponent],
  standalone: true
})
export class AppComponent {
  selectedFile: File | null = null;
  csvData: string[][] = [];
  csvHeaders: string[] = [];
  csvObjects: CsvRow[] = [];
  validationMessage: ValidationMessage | null = null;
  isAnalyzing = false;
  canAnalyze = false;
  analysisResult: RiskAnalysisResponse | null = null;

  constructor(
    private watsonxService: WatsonxService
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (!file) {
      this.clearFile();
      return;
    }

    // Validação do tipo de arquivo
    if (!this.isValidCsvFile(file)) {
      this.showValidationMessage('error', 'Por favor, selecione apenas arquivos CSV.');
      this.clearFile();
      return;
    }

    // Validação do tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.showValidationMessage('error', 'O arquivo é muito grande. Tamanho máximo: 10MB');
      this.clearFile();
      return;
    }

    this.selectedFile = file;
    this.processCsvFile(file);
  }

  private isValidCsvFile(file: File): boolean {
    return file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
  }

  private async processCsvFile(file: File): Promise<void> {
    try {
      const text = await this.readFileAsText(file);
      const parsedData = this.parseCsv(text);

      if (parsedData.length === 0) {
        this.showValidationMessage('error', 'O arquivo CSV está vazio ou não possui dados válidos.');
        this.clearFile();
        return;
      }

      this.csvData = parsedData;
      this.csvHeaders = parsedData[0];
      this.csvObjects = this.convertToObjects(parsedData);

            const totalRows = this.csvData.length - 1;
      const limitedRows = Math.min(totalRows, 10);

      // Verificar se a coluna "Risk" foi removida
      const hasRiskColumn = this.csvHeaders.includes('Risk');
      const riskMessage = hasRiskColumn ? ' Coluna "Risk" removida automaticamente.' : '';

      const message = totalRows > 10
        ? `Arquivo carregado com sucesso! ${limitedRows} de ${totalRows} linhas serão analisadas (limitado a 10 para a API).${riskMessage}`
        : `Arquivo carregado com sucesso! ${totalRows} linhas de dados encontradas.${riskMessage}`;
      this.showValidationMessage('success', message);
      this.canAnalyze = true;

    } catch (error) {
      console.error('Erro ao processar arquivo CSV:', error);
      this.showValidationMessage('error', 'Erro ao processar o arquivo CSV. Verifique se o formato está correto.');
      this.clearFile();
    }
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  private parseCsv(csvText: string): string[][] {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');

    return lines.map(line => {
      // Split por vírgula, mas considera aspas
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result;
    });
  }

  private convertToObjects(csvData: string[][]): CsvRow[] {
    if (csvData.length < 2) return [];

    const headers = csvData[0];
    const objects: CsvRow[] = [];

    for (let i = 1; i < csvData.length; i++) {
      const row = csvData[i];
      const obj: CsvRow = {};

      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });

      objects.push(obj);
    }

    return objects;
  }

  private showValidationMessage(type: 'error' | 'success', text: string): void {
    this.validationMessage = { type, text };

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        if (this.validationMessage?.type === 'success') {
          this.validationMessage = null;
        }
      }, 5000);
    }
  }

  private clearFile(): void {
    this.selectedFile = null;
    this.csvData = [];
    this.csvHeaders = [];
    this.csvObjects = [];
    this.canAnalyze = false;
    this.validationMessage = null;
    this.analysisResult = null;
  }

  async analyzeDocument(): Promise<void> {
    if (!this.selectedFile || !this.canAnalyze || this.isAnalyzing) {
      return;
    }

    this.isAnalyzing = true;
    this.analysisResult = null;

    try {
      // Converter dados CSV para o formato da API
      const riskAnalysisData = this.watsonxService.convertCsvToRiskAnalysis(
        this.csvObjects,
        this.csvHeaders
      );

      console.log('Dados preparados para análise de risco:', riskAnalysisData);

      // Usar método local de simulação
      this.watsonxService.analyzeRiskLocal(riskAnalysisData).subscribe(
        (result: RiskAnalysisResponse) => {
          this.analysisResult = result;
          const recordCount = this.getAnalysisResults().length;
          this.showValidationMessage('success', `Análise de risco concluída com sucesso! ${recordCount} registros analisados.`);
          console.log('Resultado da análise:', result);
        },
        (error: any) => {
          console.error('Erro na análise:', error);
          this.showValidationMessage('error', 'Erro durante a análise. Verifique o console para detalhes.');
        }
      );

    } catch (error) {
      console.error('Erro na análise:', error);
      this.showValidationMessage('error', 'Erro durante a análise. Verifique o console para detalhes.');
    } finally {
      this.isAnalyzing = false;
    }
  }

  // Método para drag and drop (opcional)
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fakeEvent = { target: { files: [file] } };
      this.onFileSelected(fakeEvent);
    }
  }

  // Método para usar a API real (quando disponível)
  async analyzeWithRealAPI(): Promise<void> {
    if (!this.selectedFile || !this.canAnalyze || this.isAnalyzing) {
      return;
    }

    this.isAnalyzing = true;
    this.analysisResult = null;

    try {
      const riskAnalysisData = this.watsonxService.convertCsvToRiskAnalysis(
        this.csvObjects,
        this.csvHeaders
      );

      console.log('Enviando dados para API real:', riskAnalysisData);

      this.watsonxService.analyzeRisk(riskAnalysisData).subscribe(
        (result: RiskAnalysisResponse) => {
          this.analysisResult = result;
          const recordCount = this.getAnalysisResults().length;
          this.showValidationMessage('success', `Análise de risco concluída com sucesso! ${recordCount} registros analisados.`);
          console.log('Resultado da API real:', result);
        },
        (error: any) => {
          console.error('Erro na API real:', error);
          this.showValidationMessage('error', 'Erro na API. Verifique o console para detalhes.');
        }
      );

    } catch (error) {
      console.error('Erro na análise:', error);
      this.showValidationMessage('error', 'Erro durante a análise. Verifique o console para detalhes.');
    } finally {
      this.isAnalyzing = false;
    }
  }

  // Método para obter os resultados da análise de forma segura
  getAnalysisResults(): any[] {
    if (!this.analysisResult ||
        !this.analysisResult.predictions ||
        !this.analysisResult.predictions[0] ||
        !this.analysisResult.predictions[0].values) {
      return [];
    }
    return this.analysisResult.predictions[0].values;
  }

  // Método para obter a classe CSS da predição
  getPredictionClass(prediction: string): string {
    switch (prediction) {
      case 'No Risk':
        return 'no-risk';
      case 'Low Risk':
        return 'low-risk';
      case 'Medium Risk':
        return 'medium-risk';
      case 'High Risk':
        return 'high-risk';
      default:
        return 'unknown-risk';
    }
  }

  // Método para obter o valor da predição de forma segura
  getPredictionValue(recordIndex: number = 0): string {
    const results = this.getAnalysisResults();
    if (recordIndex >= results.length || !results[recordIndex] || !results[recordIndex][0]) {
      return 'Unknown';
    }

    const value = results[recordIndex][0];
    return typeof value === 'string' ? value : 'Unknown';
  }

  // Método para obter o texto da probabilidade de forma segura
  getProbabilityText(recordIndex: number = 0, probIndex: number = 0): string {
    const results = this.getAnalysisResults();
    if (recordIndex >= results.length ||
        !results[recordIndex] ||
        !results[recordIndex][1] ||
        !Array.isArray(results[recordIndex][1]) ||
        probIndex >= results[recordIndex][1].length) {
      return '0.0%';
    }

    const probabilities = results[recordIndex][1];
    const prob = probabilities[probIndex];
    if (typeof prob === 'number') {
      return (prob * 100).toFixed(1) + '%';
    }

    return '0.0%';
  }

  // Método para obter a porcentagem da probabilidade de forma segura
  getProbabilityPercentage(recordIndex: number = 0, probIndex: number = 0): number {
    const results = this.getAnalysisResults();
    if (recordIndex >= results.length ||
        !results[recordIndex] ||
        !results[recordIndex][1] ||
        !Array.isArray(results[recordIndex][1]) ||
        probIndex >= results[recordIndex][1].length) {
      return 0;
    }

    const probabilities = results[recordIndex][1];
    const prob = probabilities[probIndex];
    if (typeof prob === 'number') {
      return prob * 100;
    }

    return 0;
  }
}
