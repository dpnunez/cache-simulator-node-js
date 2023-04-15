# Simulador de Cache em NODEJS

Este é um algoritmo em NODEJS que simula o funcionamento de uma cache. O objetivo deste simulador é permitir que você experimente diferentes configurações de cache e entenda como isso pode afetar o desempenho.

## Como usar

Para executar o simulador, execute o seguinte comando no terminal:

```
node cache-simulator.js <nsets> <bsize> <assoc> <substituição> <flag_saida> <arquivo_de_entrada>
```

Os parâmetros necessários são os seguintes:

- `nsets`: o número de conjuntos na cache
- `bsize`: o tamanho do bloco em bytes
- `assoc`: o tipo de associatividade da cache (direta, associativa ou totalmente associativa)
- `substituição`: o algoritmo de substituição de cache a ser utilizado (atualmente apenas 'R' - random)
- `flag_saida`: o formato de saída desejado (0 para formato livre, 1 para formato padrão)
- `arquivo_de_entrada`: o arquivo binário contendo os endereços de 32 bits que serão utilizados pelo simulador.

Exemplo de uso:

```
node cache-simulator.js 4 16 2 R 1 endereco.bin
```

## Formato do arquivo de entrada

O arquivo de entrada deve ser um arquivo binário contendo os endereços de 32 bits que serão utilizados pelo simulador. Os endereços devem estar todos juntos no arquivo, sem separação entre eles.

## Saída

O simulador pode produzir dois tipos de saída, dependendo do valor do parâmetro `flag_saida`:

### Formato livre

Se `flag_saida` for igual a 0, o simulador produzirá uma saída detalhada da estrutura de dados da cache, incluindo as linhas de cache, seus estados e os blocos armazenados nelas.

### Formato padrão

Se `flag_saida` for igual a 1 (valor padrão), o simulador produzirá uma saída resumida das estatísticas de desempenho da cache, incluindo:

- Total de acessos
- Taxa de hit
- Taxa de miss
- Taxa de miss compulsório (misses causados por uma leitura de um endereço que ainda não foi carregado na cache)
- Taxa de miss de capacidade (misses causados por uma cache cheia e a necessidade de substituir um bloco existente)
- Taxa de miss de conflito (misses causados por duas ou mais linhas de cache tentando armazenar o mesmo conjunto de dados)

## Suporte

Se você tiver alguma dúvida ou encontrar algum problema, por favor, abra uma issue neste repositório.