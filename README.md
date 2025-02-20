# Projeto Hash Database (Índice Hash Estático)

## Visão Geral
Este projeto implementa um sistema de banco de dados com índice hash estático em Angular, demonstrando conceitos fundamentais de estruturas de dados e organização de arquivos.

## Estrutura do Projeto

### 1. Componentes Principais

#### 1.1 DataService (`data.service.ts`)
- **Função**: Núcleo do sistema, gerenciando dados e operações de hash
- **Responsabilidades**:
  - Carregamento de dados do arquivo
  - Implementação do índice hash
  - Gerenciamento de buckets
  - Execução de buscas (hash e sequencial)
  - Cálculo de estatísticas

#### 1.2 Modelos de Dados
##### 1.2.1 Bucket (`models/bucket.model.ts`)
- Implementa a estrutura do bucket
- Gerencia entradas principais e overflow
- Controla inserções com limite máximo de entradas

##### 1.2.2 Page (`models/page.model.ts`)
- Define a estrutura de páginas
- Armazena registros em grupos

### 2. Interface do Usuário

#### 2.1 Componentes de Visualização

##### DataLoader (`data-loader.component.ts`)
- Controla o carregamento inicial de dados
- Permite configurar tamanho das páginas
- Valida parâmetros de entrada

##### SearchComponent (`search.component.ts`)
- Interface de busca
- Executa buscas por índice hash e table scan
- Mede tempo de execução

##### ResultsComponent (`results.component.ts`)
- Exibe resultados das buscas
- Compara performance entre métodos
- Mostra estatísticas de acesso

##### StatisticsComponent (`statistics.component.ts`)
- Visualiza métricas do índice hash
- Gráficos de distribuição
- Análise de colisões e overflow

##### PagesDisplay (`pages-display.component.ts`)
- Visualização de páginas de dados
- Destaca palavras encontradas
- Navegação entre páginas

### 3. Funcionalidades Principais

#### 3.1 Índice Hash
```typescript
hash(key: string): number {
    let hashValue = 0;
    for (let i = 0; i < key.length; i++) {
        hashValue = (Math.imul(31, hashValue) + key.charCodeAt(i)) | 0;
    }
    return Math.abs(hashValue) % this.numBuckets;
}
```

#### 3.2 Busca por Índice
- Usa função hash para localizar bucket
- Verifica entradas principais e overflow
- Conta acessos a disco

#### 3.3 Table Scan
- Busca sequencial em todas as páginas
- Serve como benchmark de comparação
- Conta páginas acessadas

### 4. Detalhes de Implementação

#### 4.1 Estrutura de Armazenamento
- Páginas de tamanho configurável
- Buckets com limite de entradas
- Área de overflow por bucket

#### 4.2 Métricas e Estatísticas
- Taxa de colisões
- Taxa de overflow
- Distribuição de registros
- Tempo de busca
- Comparação de métodos

### 5. Como Executar

1. **Pré-requisitos**
```bash
# Instalar dependências
npm install
```

2. **Desenvolvimento**
```bash
# Iniciar servidor de desenvolvimento
ng serve
```

3. **Construção**
```bash
# Gerar build de produção
ng build
```

### 6. Testes e Validação

#### 6.1 Testes Unitários
```bash
ng test
```

#### 6.2 Casos de Teste Recomendados
- Busca por palavras existentes
- Busca por palavras inexistentes
- Avaliação de colisões
- Medição de performance

### 7. Limitações e Considerações

1. **Índice Hash**
   - Hash estático (não expansível)
   - Colisões resolvidas por overflow
   - Distribuição dependente da função hash

2. **Performance**
   - Melhor caso: O(1) para busca por índice
   - Pior caso: O(n) para table scan
   - Overhead de memória para índice

3. **Escalabilidade**
   - Limitada pelo número fixo de buckets
   - Degradação com muitos overflows
   - Memória proporcional ao volume de dados


