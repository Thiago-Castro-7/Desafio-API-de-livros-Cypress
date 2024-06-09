// Configurações e URLs base
const Urlbase = 'https://simple-books-api.glitch.me';
const UrlCliente = `${Urlbase}/api-clients/`;

// Função para gerar um número aleatório
function gerarNumeroAleatorio() {
  return Math.floor(Math.random() * 10000); // Gera um número entre 0 e 9999
}

// Função para gerar NomeCliente e EmailCliente aleatórios
function gerarClienteAleatorio() {
  const numeroAleatorio = gerarNumeroAleatorio();
  const NomeCliente = `Thiago Castro`;
  const EmailCliente = `thiagocastro${numeroAleatorio}@example.com`;
  return { NomeCliente, EmailCliente };
}

// Exportar variáveis e funções
module.exports = {
  Urlbase,
  UrlCliente,
  gerarNumeroAleatorio,
  gerarClienteAleatorio
};
