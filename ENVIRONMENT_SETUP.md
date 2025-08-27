# Configuração do Ambiente

## Visão Geral
Este projeto usa arquivos de ambiente para configurar URLs de API e chaves de autenticação IBM de forma segura.

## Estrutura de Arquivos
```
src/environments/
├── environment.ts          # Configurações de desenvolvimento
├── environment.prod.ts     # Configurações de produção
└── environment.example.ts  # Arquivo de exemplo
```

## Configuração de Desenvolvimento

### 1. Copie o arquivo de exemplo
```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

### 2. Configure suas variáveis
Edite `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://127.0.0.1:8000/api', // Sua URL de desenvolvimento
  ibmApiKey: 'sua-chave-ibm-aqui', // Sua chave de API IBM
  ibmTokenUrl: 'https://iam.cloud.ibm.com/identity/token' // URL de autenticação IBM
};
```

## Configuração de Produção

### 1. Configure o arquivo de produção
Edite `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://sua-api-producao.com/api', // URL de produção
  ibmApiKey: 'sua-chave-ibm-producao-aqui', // Chave de API IBM de produção
  ibmTokenUrl: 'https://iam.cloud.ibm.com/identity/token' // URL de autenticação IBM
};
```

## Variáveis de Ambiente

### apiBaseUrl
- **Desenvolvimento**: `http://127.0.0.1:8000/api`
- **Produção**: `https://sua-api-producao.com/api`

### ibmApiKey
- **Desenvolvimento**: Sua chave de API IBM de desenvolvimento
- **Produção**: Sua chave de API IBM de produção

### ibmTokenUrl
- **Padrão**: `https://iam.cloud.ibm.com/identity/token` (não alterar)

## Autenticação IBM

### Como Funciona
1. **Chave IBM**: A `ibmApiKey` é usada para obter um `access_token` da IBM
2. **Token OAuth**: O sistema automaticamente obtém e renova tokens OAuth
3. **Requisições**: Todas as requisições usam o `access_token` atual
4. **Renovação**: Tokens são renovados automaticamente antes da expiração

### Obter Chave IBM
1. Acesse o [IBM Cloud Console](https://cloud.ibm.com/)
2. Vá para **IAM > API Keys**
3. Crie uma nova chave de API
4. Copie a chave para o arquivo de ambiente

### Exemplo cURL
```bash
curl --location 'https://iam.cloud.ibm.com/identity/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=urn:ibm:params:oauth:grant-type:apikey' \
--data-urlencode 'apikey=SUA_CHAVE_IBM_AQUI'
```

## Segurança

⚠️ **IMPORTANTE**: Nunca commite arquivos com chaves IBM reais!

- ✅ `environment.example.ts` - Pode ser versionado
- ❌ `environment.ts` - NÃO versionar (contém chaves reais)
- ❌ `environment.prod.ts` - NÃO versionar (contém chaves reais)

## Build e Deploy

### Desenvolvimento
```bash
ng serve
```

### Produção
```bash
ng build --configuration=production
```

## Solução de Problemas

### Erro: "Cannot find module '../../environments/environment'"
- Verifique se o arquivo `environment.ts` existe
- Confirme o caminho do import no service

### Erro: "environment is undefined"
- Verifique se o arquivo de ambiente está sendo exportado corretamente
- Confirme se o import está correto

### Erro de Autenticação IBM
- Verifique se a `ibmApiKey` está correta
- Confirme se a chave tem permissões adequadas
- Verifique se a `ibmTokenUrl` está correta

## Exemplo de Uso no Service

```typescript
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WatsonxService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly ibmApiKey = environment.ibmApiKey;
  private readonly ibmTokenUrl = environment.ibmTokenUrl;
  
  // O sistema automaticamente gerencia tokens OAuth
  analyzeRisk(data: RiskAnalysisRequest): Observable<RiskAnalysisResponse> {
    return this.getValidToken().pipe(
      switchMap(token => {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        return this.http.post<RiskAnalysisResponse>(url, data, { headers });
      })
    );
  }
}
```

## Funcionalidades do Service

### Gerenciamento Automático de Tokens
- ✅ Obtenção automática de tokens OAuth
- ✅ Renovação automática antes da expiração
- ✅ Cache de tokens válidos
- ✅ Tratamento de erros de autenticação

### Métodos Úteis
- `isTokenValid()`: Verifica se o token está válido
- `getTokenInfo()`: Obtém informações sobre o token atual
- `clearToken()`: Limpa o token (útil para logout)
