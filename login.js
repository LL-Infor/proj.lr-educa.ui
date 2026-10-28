/* CONFIGURAÇÕES E ELEMENTOS HTML */

const API_URL = "http://localhost:8080";

const formLogin = document.getElementById("formLogin");
const campoPerfil = document.getElementById("perfil");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const toggleSenha = document.getElementById("toggleSenha");
const mensagem = document.getElementById("mensagem");
const btnEntrar = document.getElementById("btnEntrar");


/* MOSTRAR E OCULTAR SENHA */

if (toggleSenha && campoSenha) {
  toggleSenha.addEventListener("click", () => {
    const mostrar = campoSenha.type === "password";

    campoSenha.type = mostrar ? "text" : "password";
    toggleSenha.textContent = mostrar ? "Ocultar" : "Mostrar";

    toggleSenha.setAttribute(
      "aria-label",
      mostrar ? "Ocultar senha" : "Mostrar senha"
    );

    toggleSenha.setAttribute("aria-pressed", String(mostrar));
  });
}


/* EXIBIR MENSAGENS NA TELA */

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
}


/* OBTER TOKEN CSRF DA API */

async function obterTokenCSRF() {
  const resposta = await fetch(`${API_URL}/api/auth/csrf`, {
    method: "GET",
    credentials: "include"
  });

  if (!resposta.ok) {
    throw new Error(
      "Não foi possível obter o token de segurança."
    );
  }

  const dados = await resposta.json();

  if (!dados.token) {
    throw new Error("O token de segurança não foi recebido.");
  }

  return dados.token;
}


/* PERFIS DE ACESSO */

const perfisEquivalentes = {
  ADMIN: ["ADMIN"],
  DIRETOR: ["DIRETOR"],
  SUPERVISOR: ["SUPERVISOR"],
  PROFESSOR: ["PROFESSOR"],
  COORDENADOR: ["COORDENADOR"],
  SECRETARIO: ["SECRETARIO", "SECRETÁRIO"]
};


/* PROCESSAR LOGIN */

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  mensagem.textContent = "";
  mensagem.className = "mensagem";

  btnEntrar.disabled = true;
  btnEntrar.textContent = "Verificando...";

  try {

    // Obter token de segurança
    const token = await obterTokenCSRF();


    // Enviar e-mail e senha para a API
    const resposta = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": token
      },
      body: JSON.stringify({
        email: campoEmail.value.trim(),
        senha: campoSenha.value
      })
    });


    // Ler a resposta da API
    const dados = await resposta.json().catch(() => ({}));


    // Tratar erros de autenticação
    if (!resposta.ok) {

      if (resposta.status === 401) {
        throw new Error(
          "E-mail ou senha inválidos, ou conta desativada."
        );
      }

      if (resposta.status === 403) {
        throw new Error(
          "Acesso bloqueado. Atualize a página e tente novamente."
        );
      }

      throw new Error(
        dados.erro ||
        `Não foi possível entrar. Código: ${resposta.status}.`
      );
    }


    // Conferir o perfil retornado pela API
    const perfilSelecionado = campoPerfil.value;
    const perfilUsuario = String(dados.perfil || "")
      .trim()
      .toUpperCase();

    const perfilValido =
      perfisEquivalentes[perfilSelecionado]?.includes(perfilUsuario);

    if (!perfilValido) {
      mostrarMensagem(
        "O perfil selecionado não corresponde ao perfil cadastrado para este usuário.",
        "erro"
      );

      return;
    }


    // Informar sucesso e abrir o painel
    mostrarMensagem(
      "Login realizado! Abrindo o painel...",
      "sucesso"
    );

    // Redirecionar sem armazenar a senha no navegador
    window.location.href = "./dash.html";


  } catch (erro) {

    // Apresentar mensagens de erro
    console.error("Erro no login:", erro);

    mostrarMensagem(
      erro.message ||
      "Não foi possível conectar à API do LR-EDUCA.",
      "erro"
    );

  } finally {

    // Restaurar o botão de login
    btnEntrar.disabled = false;
    btnEntrar.textContent = "Entrar";

  }
});
