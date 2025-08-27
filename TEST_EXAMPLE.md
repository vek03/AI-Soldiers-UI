# Exemplo de Funcionalidade Atualizada

## Limitação de 10 Itens do CSV

O serviço agora limita automaticamente os dados CSV a no máximo 10 registros antes de enviar para a API, conforme solicitado.

## Remoção Automática da Coluna "Risk"

O sistema automaticamente remove a coluna "Risk" (se existir) antes de processar os dados, pois esta coluna não deve ser enviada para a API de análise.

## Estrutura da Resposta

Cada registro do CSV (limitado a 10) receberá um resultado diferente, seguindo a estrutura:

```json
{
    "predictions": [
        {
            "fields": [
                "prediction",
                "probability"
            ],
            "values": [
                [
                    "No Risk",
                    [0.6758321523666382, 0.3241678774356842]
                ],
                [
                    "No Risk", 
                    [0.8493950366973877, 0.1506049484014511]
                ],
                [
                    "Risk",
                    [0.4720305800437927, 0.5279694199562073]
                ]
            ]
        }
    ]
}
```

## Como Funciona

1. **Upload do CSV**: O usuário faz upload de um arquivo CSV
2. **Limpeza de Dados**: A coluna "Risk" é automaticamente removida (se existir)
3. **Limitação**: O sistema automaticamente limita os dados a 10 registros
4. **Análise**: Cada registro recebe uma predição única e probabilidades diferentes
5. **Exibição**: Os resultados são mostrados individualmente para cada registro

## Exemplo de Uso

- Se o CSV tiver 15 linhas, apenas as primeiras 10 serão analisadas
- Se o CSV tiver 5 linhas, todas as 5 serão analisadas
- Se o CSV tiver uma coluna "Risk", ela será removida automaticamente
- Cada linha receberá um resultado diferente (predição + probabilidades)

## Benefícios

- ✅ Limita o uso da API a no máximo 10 registros
- ✅ Remove automaticamente a coluna "Risk" se existir
- ✅ Cada registro recebe um resultado único
- ✅ Interface atualizada para mostrar múltiplos resultados
- ✅ Mensagens informativas sobre a limitação e limpeza
- ✅ Compatível com API real e simulação local
