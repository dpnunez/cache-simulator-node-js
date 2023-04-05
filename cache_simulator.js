// Formato de entrada:
// 		cache_simulator <nsets> <bsize> <assoc> <substituição> <flag_saida> arquivo_de_entrada


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

// Cria cache vazia
let cache = Array.from({ length: nsets }, (_, index) => {
	return Array.from({ length: assoc }, (_, index) => {
		return {
			"validade": 0,
			"tag": null,
		};
	});
});
