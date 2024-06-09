// Importar funções e variáveis do arquivo utils.js
const { Urlbase, UrlCliente, gerarClienteAleatorio } = require('./utils.js');

// Variáveis globais
let authToken = Cypress.env('authToken');
let orderId;

// fazer com que NomeCliente e EmailCliente aleatórios
const { NomeCliente, EmailCliente } = gerarClienteAleatorio();
  
  // Cenário de acesso à API
  describe("Acesso a API", () => {
    it("CT01 - Acessar a API", () => {
      cy.request("GET", Urlbase).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  // Cenários relacionados à listagem de livros
  describe('Gerenciamento de livros', () => {
      it('CT01 - Filtrar livro por ID válido', () => {
        const bookId = 1; // aqui pode colocar os livros 1-6 pois são os que estão disponiveis
        cy.request('GET', `${Urlbase}/books/${bookId}`).then((response) => {
          expect(response.status).to.eq(200);
          const book = response.body;
          cy.log(`Livro ID: ${book.id}`, `Nome: ${book.name}`, `Tipo: ${book.type}`, `Disponível: ${book.available}`);
          expect(book).to.include({
            id: bookId,
            name: book.name,
            type: book.type,
            available: book.available
          });
        });
      });

      it('CT02 - Tentar filtrar livro por ID inválido', () => {
        const invalidBookId = 999;
        cy.request({
          method: 'GET',
          url: `${Urlbase}/books/${invalidBookId}`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(404);
          cy.log('Erro: Livro não encontrado.');
        });
      });

      it('CT03 - Listar todos os livros', () => {
        cy.request('GET', `${Urlbase}/books`).then((response) => {
          expect(response.status).to.eq(200);
          response.body.forEach(book => {
            expect(book).to.have.keys(['id', 'name', 'type', 'available']);
          });
        });
      });

      it('CT04 - Listar todos os livros de tipo fiction', () => {
        cy.request('GET', `${Urlbase}/books`).then((response) => {
          expect(response.status).to.eq(200);
          const fictionBooks = response.body.filter(book => book.type === 'fiction');
          cy.log(`Quantidade de livros com tipo fiction: ${fictionBooks.length}`);
          expect(fictionBooks.length).to.be.greaterThan(0);
          fictionBooks.forEach(book => {
            expect(book).to.include({ type: 'fiction' });
          });
        });
      });

      it('CT05 - Listar todos os livros de tipo non-fiction', () => {
        cy.request('GET', `${Urlbase}/books`).then((response) => {
          expect(response.status).to.eq(200);
          const nonFictionBooks = response.body.filter(book => book.type === 'non-fiction');
          cy.log(`Quantidade de livros com tipo non-fiction: ${nonFictionBooks.length}`);
          expect(nonFictionBooks.length).to.be.greaterThan(0);
          nonFictionBooks.forEach(book => {
            expect(book).to.include({ type: 'non-fiction' });
          });
        });
      });

      it('CT06 - Filtrar livros com tipo inválido (romance)', () => {
        cy.request('GET', `${Urlbase}/books`).then((response) => {
          expect(response.status).to.eq(200);
          const invalidBooks = response.body.filter(book => book.type === 'romance');
          cy.log(`Quantidade de livros com tipo inválido (romance): ${invalidBooks.length}`);
          expect(invalidBooks.length).to.eq(0);
        });
      });
    });

  //Cenarios Relacionados a pedidos de livros
  describe('Gerenciamento de pedidos', () => {
      it("CT01 - Obter token de autenticação", () => {
        cy.request('POST', UrlCliente, {
          clientName: NomeCliente,
          clientEmail: EmailCliente
        }).then((response) => {
          expect(response.status).to.eq(201);
          authToken = response.body.accessToken;
          cy.log('Token de autenticação obtido:', authToken);
          Cypress.env('authToken', authToken);
          cy.wrap(authToken).should('exist');
        });
      });
    
      it("CT02 - Tentar fazer um pedido com token inválido", () => {
        cy.request({
          method: 'POST',
          url: `${Urlbase}/orders`,
          headers: {
            Authorization: 'Bearer tokenInvalido'
          },
          body: {
            bookId: 1,
            customerName: NomeCliente
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(401);
          cy.log('Acesso negado ao tentar fazer um pedido com token inválido.');
        });
      });
    
      it("CT03 - Fazer um pedido", () => {
        cy.wrap(Cypress.env('authToken')).then((token) => {
          cy.request({
            method: 'POST',
            url: `${Urlbase}/orders`,
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: {
              bookId: 1,
              customerName: NomeCliente
            }
          }).then((response) => {
            expect(response.status).to.eq(201);
            orderId = response.body.orderId;
            cy.log('Pedido criado com sucesso. ID do pedido:', orderId);
            Cypress.env('orderId', orderId);
          });
        });
      });

    it("CT04 - Listar todos os pedidos", () => {
      cy.wrap(Cypress.env('authToken')).then((token) => {
        cy.request({
          method: 'GET',
          url: `${Urlbase}/orders`,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          cy.log('Pedidos existentes:', response.body);
        });
      });
    });

    it("CT05 - Filtrar pedidos por ID", () => {
      cy.wrap(Cypress.env('authToken')).then((token) => {
        const idPedido = Cypress.env('orderId');
        cy.request({
          method: 'GET',
          url: `${Urlbase}/orders/${idPedido}`,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          cy.log('Pedido encontrado:', response.body);
        });
      });
    });

    it("CT06 - Corrigir um pedido", () => {
      cy.wrap(Cypress.env('authToken')).then((token) => {
        const idPedido = Cypress.env('orderId');
        cy.request({
          method: 'PATCH',
          url: `${Urlbase}/orders/${idPedido}`,
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: {
            customerName: 'John'
          }
        }).then((response) => {
          expect(response.status).to.eq(204);
          cy.log('Pedido corrigido com sucesso.');
        });
      });
    });

    it("CT07 - Filtrar pedidos por ID inválido", () => {
      cy.wrap(Cypress.env('authToken')).then((token) => {
        const idPedidoInvalido = 'invalidOrderId';
        cy.request({
          method: 'GET',
          url: `${Urlbase}/orders/${idPedidoInvalido}`,
          headers: {
            Authorization: `Bearer ${token}`
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(404);
          cy.log('Pedido não encontrado para ID inválido:', idPedidoInvalido);
        });
      });
    });

    it("CT08 - Corrigir um pedido com ID inválido", () => {
      cy.wrap(Cypress.env('authToken')).then((token) => {
        const idPedidoInvalido = 'invalidOrderId';
        cy.request({
          method: 'PATCH',
          url: `${Urlbase}/orders/${idPedidoInvalido}`,
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: {
            customerName: 'John'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(404);
          cy.log('Tentativa de corrigir pedido com ID inválido:', idPedidoInvalido);
        });
      });
    });

    it("CT09 - Excluir um pedido", () => {
      cy.wrap(Cypress.env('authToken')).then((token) => {
        const idPedido = Cypress.env('orderId');
        cy.request({
          method: 'DELETE',
          url: `${Urlbase}/orders/${idPedido}`,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }).then((response) => {
          expect(response.status).to.eq(204);
          cy.log('Pedido excluído com sucesso:', idPedido);
        });
      });
    });

    it("CT10 - Excluir um pedido com ID inválido", () => {
      cy.wrap(Cypress.env('authToken')).then((token) => {
        const idPedidoInvalido = 'invalidOrderId';
        cy.request({
          method: 'DELETE',
          url: `${Urlbase}/orders/${idPedidoInvalido}`,
          headers: {
            Authorization: `Bearer ${token}`
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(404);
          cy.log('Tentativa de excluir pedido com ID inválido:', idPedidoInvalido);
        });
      });
    });
  });
