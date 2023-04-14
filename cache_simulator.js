// Formato de entrada:
// 		cache_simulator <nsets> <bsize> <assoc> <substituição> <flag_saida> arquivo_de_entrada
const fs = require('fs');

// Leitura dos parametros
const nsets = process.argv[2];
const bsize = process.argv[3];
const assoc = process.argv[4];
const substituição = process.argv[5];
const flag_saida = process.argv[6];
const arquivo_de_entrada = process.argv[7];


const n_bits_offset = Math.log2(bsize);
const n_bits_index = Math.log2(nsets);
const n_bits_tag = 32 - n_bits_offset - n_bits_index;

const tamanho_da_cache = nsets * bsize * assoc;

let misses = 0;
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


console.log("bits para offset: " + n_bits_offset);
console.log("bits para index: " + n_bits_index);
console.log("bits para tag: " + n_bits_tag);

const fileBuffer = fs.readFileSync(arquivo_de_entrada);

for(let i = 0; i < fileBuffer.length; i += 4) {
  const line = fileBuffer.readInt32BE(i); 															// Leitura de 4 bytes (32 bits) por vez
  // Processa leitura
	const conjunto_destino = getConjuntoDestino(line, n_bits_offset, n_bits_index);
	const tag_destino = parseInt(line) >> (n_bits_offset + n_bits_index); // desloca os bits do index e do offset para a direita
	const linha_em_binario = parseInt(line).toString(2).padStart(32, '0');// para visualizar o endereco em binario

	const hit = cache[conjunto_destino].find((linha) => {
		return linha.tag === tag_destino && !!linha.validade;
	})

	if(hit) {
		hits++;
	} else {
		const index_via_vazia = cache[conjunto_destino].findIndex((linha) => {
			return !linha.validade;
		});

		if(index_via_vazia !== -1) {
			cache[conjunto_destino][index_via_vazia].validade = true;
			cache[conjunto_destino][index_via_vazia].tag = tag_destino;
		} else { // Miss de capacidade / Miss de conflito   === TRATAMENTO SÓ PARA MAPEAMENTO DIRETO
			const via_a_ser_substituida = gerarIndexDeViaAleatorio(assoc)
			// console.log("O conjunto: ", conjunto_destino, "está cheio, substituindo a via: ", via_a_ser_substituida)
			// console.log("antes da substituição: ")
			// console.log(cache[conjunto_destino])
			cache[conjunto_destino][via_a_ser_substituida].validade = true;
			cache[conjunto_destino][via_a_ser_substituida].tag = tag_destino;
			// console.log("depois da substituição: ")
			// console.log(cache[conjunto_destino])
		}
		misses++;
	}

	acessos++;
}



const miss_rate = misses / acessos;
const hit_rate = hits / acessos;
console.log('hits', hits)
console.log('misses', misses)

console.log('miss_rate: ', miss_rate);
console.log('hit_rate', hit_rate)
console.log('acessos', acessos)


function getConjuntoDestino(endereco, numBitsOffset, numBitsMascara) {
	let binario = endereco.toString(2).padStart(32, '0');
  
  // Rotaciona o número numBitsOffset vezes à direita
  let rotacao = binario.slice(-numBitsOffset);
  binario = rotacao + binario.slice(0, -numBitsOffset);
  
  // Faz uma máscara para pegar somente os numBitsMascara iniciais desse número
  let mascara = parseInt('1'.repeat(numBitsMascara), 2);
  let resultado = parseInt(binario, 2) & mascara;
  
  return resultado;
}

function gerarIndexDeViaAleatorio(assoc) {
	return Math.floor(Math.random() * assoc);
}