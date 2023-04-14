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



const readStream = fs.createReadStream(arquivo_de_entrada, { encoding: 'utf8' });

console.log("bits para offset: " + n_bits_offset);
console.log("bits para index: " + n_bits_index);
console.log("bits para tag: " + n_bits_tag);

readStream.on('data', (chunk) => {
  const lines = chunk.split('\n');
  for (const line of lines) {
    // Processa leitura
		const conjunto_destino = getConjuntoDestino(line)
		const tag_destino = parseInt(line) >> (n_bits_offset + n_bits_index); // desloca os bits do index e do offset para a direita
		const linha_em_binario = parseInt(line).toString(2).padStart(32, '0'); // para visualizar o endereco em binario

		const hit = cache[conjunto_destino].find((linha) => {
			return linha.tag === tag_destino && !!linha.validade;
		})

		if(hit) {
			console.log('hit', line)
		} else {
			console.log('miss', line)
		}

		if(hit) {
			hits++;
		} else {
			const index_via_vazia = cache[conjunto_destino].findIndex((linha) => {
				return !linha.validade;
			});

			if(index_via_vazia !== -1) { // Miss compulsorio
				cache[conjunto_destino][index_via_vazia].validade = true;
				cache[conjunto_destino][index_via_vazia].tag = tag_destino;
			} else { // Miss de capacidade / Miss de conflito   === TRATAMENTO SÓ PARA MAPEAMENTO DIRETO
				cache[conjunto_destino][0].validade = true;
				cache[conjunto_destino][0].tag = tag_destino;
			}
			misses++;
		}

		acessos++;
	}
});

readStream.on('end', () => {
	const miss_rate = misses / acessos;
	const hit_rate = hits / acessos;
	console.log('hits', hits)
	console.log('misses', misses)
	
  console.log('miss_rate: ', miss_rate);
	console.log('hit_rate', hit_rate)
	console.log('acessos', acessos)
});

readStream.on('error', (err) => {
  console.error(err);
});


function getConjuntoDestino(endereco) {
	const endereco_em_binario = parseInt(endereco).toString(2).padStart(32, '0');
	const mascaraPararIndex = (parseInt('1'.repeat(n_bits_index), 2) << n_bits_offset).toString(2).padStart(32, '0');
	const index_em_decimal = parseInt(endereco_em_binario, 2) & parseInt(mascaraPararIndex, 2);
	
	return index_em_decimal;
}