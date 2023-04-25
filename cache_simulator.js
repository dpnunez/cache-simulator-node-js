// Formato de entrada:
// 		cache_simulator <nsets> <bsize> <assoc> <substituição> <flag_saida> arquivo_de_entrada
//		Formato padrao de saida: <Total de acessos> <Taxa de hit> <Taxa de miss> <Taxa de miss compulsório> <Taxa de miss de capacidade> <Taxa de miss de conflito>
const fs = require('fs');

// Leitura dos parametros
const nsets = process.argv[2];
const bsize = process.argv[3];
const assoc = process.argv[4];
const substituição = process.argv[5];
const flag_saida = process.argv[6];
const arquivo_de_entrada = process.argv[7];

// Calculos de quantidade de bits
const n_bits_offset = Math.log2(bsize);
const n_bits_index = Math.log2(nsets);
const n_bits_tag = 32 - n_bits_offset - n_bits_index;
const tamanho_da_cache = nsets * bsize * assoc;

// Contadores de misses e hits
let miss_compulsorio = 0;
let miss_capacidade = 0;
let miss_conflito = 0;
let hits = 0;
let acessos = 0;

// Cria cache vazia
let cache = Array.from({ length: nsets }, (_, index) => {
	return Array.from({ length: assoc }, (_, index) => {
		return {
			"validade": false,
			"tag": null,
		};
	});
});

// Processa a leitura do arquivo binario de entrada
const fileBuffer = fs.readFileSync(arquivo_de_entrada);

for(let i = 0; i < fileBuffer.length; i += 4) {
  const line = fileBuffer.readInt32BE(i); 															// Leitura de 4 bytes (32 bits) por vez
	const conjunto_destino = getConjuntoDestino(line, n_bits_offset, n_bits_index);
	const tag_destino = parseInt(line) >> (n_bits_offset + n_bits_index); // desloca os bits do index e do offset para a direita

	const hit = cache[conjunto_destino].find((linha) => {
		return linha.tag === tag_destino && !!linha.validade;
	})

	if(hit) {
		hits++;
	} else {
		const index_via_vazia = cache[conjunto_destino].findIndex((linha) => {	// Procura por uma via vazia
			return !linha.validade;
		});
		const conjunto_sobrecarregado = index_via_vazia === -1									// Se não encontrou uma via vazia, o conjunto está sobrecarregado

		if(!conjunto_sobrecarregado) {
			cache[conjunto_destino][index_via_vazia].validade = true;
			cache[conjunto_destino][index_via_vazia].tag = tag_destino;
		} else {
			const via_a_ser_substituida = gerarIndexDeViaAleatorio(assoc)
			cache[conjunto_destino][via_a_ser_substituida].validade = true;
			cache[conjunto_destino][via_a_ser_substituida].tag = tag_destino;
		}

		// Classifica o misses
		if(verificaCacheSobrecarregada()) {
			miss_capacidade++;
		} else if(conjunto_sobrecarregado) {
			miss_conflito++;
		} else {
			miss_compulsorio++;
		}
	}

	acessos++;
}

// Calcula as taxas de miss e hit
const misses = miss_compulsorio + miss_capacidade + miss_conflito;
const miss_rate = misses / acessos;
const hit_rate = hits / acessos;

mostrarResultados(flag_saida);


// Helpers
function getConjuntoDestino(endereco, numBitsOffset, numBitsMascara) {
	let binario = endereco.toString(2).padStart(32, '0');	// Converte o número para binário e preenche com 0s à esquerda até completar 32 bits

  // Rotaciona o número numBitsOffset vezes à direita
  let rotacao = binario.slice(-numBitsOffset);					// Descarta os numBitsOffset bits iniciais
  binario = rotacao + binario.slice(0, -numBitsOffset);
  
  // Faz uma máscara para pegar somente os numBitsMascara iniciais desse número
  let mascara = parseInt('1'.repeat(numBitsMascara), 2); // Mascara para remover os bits da TAG
  let resultado = parseInt(binario, 2) & mascara;				// Comparando com o operador AND, a máscara vai "zerar" todos os bits que não são do conjunto destino
  
  return resultado;
}

function gerarIndexDeViaAleatorio(assoc) {
	return Math.floor(Math.random() * assoc);
}

function mostrarResultados(flag_saida) {
	switch(Number(flag_saida)) {
		case 1:
			const taxa_de_miss_compulsorio = (miss_compulsorio / misses).toFixed(2);
			const taxa_de_miss_de_capacidade = (miss_capacidade / misses).toFixed(2);
			const taxa_de_miss_de_conflito = (miss_conflito / misses).toFixed(2)
			console.log(`${acessos} ${hit_rate.toFixed(4)} ${miss_rate.toFixed(4)} ${taxa_de_miss_compulsorio} ${taxa_de_miss_de_capacidade} ${taxa_de_miss_de_conflito}`)
			break;
		case 0:
		default:
			console.log("bits para offset: " + n_bits_offset);
			console.log("bits para index: " + n_bits_index);
			console.log("bits para tag: " + n_bits_tag);

			console.log('hits', hits)
			console.log('misses', misses)

			console.log('miss_rate: ', miss_rate);
			console.log('hit_rate', hit_rate)
			console.log('acessos', acessos)
			console.log(`tamanho da cache: ${tamanho_da_cache} bytes`)
			console.log('cache: ', cache)
			break;
	}
}

function verificaCacheSobrecarregada() {
	return cache.every((conjunto) => {
		return conjunto.every((linha) => {
			return linha.validade;
		});
	});
}