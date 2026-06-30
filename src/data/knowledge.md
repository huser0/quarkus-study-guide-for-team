# Guia Quarkus — Do zero ao deploy

> Este guia serve para dois perfis: quem vem do Spring e quer aprender Quarkus, e quem está começando com frameworks Java sem experiência prévia. Os blocos marcados com 🟢 são essenciais para iniciantes; os marcados com 🔵 são comparativos para quem já conhece Spring.

---

### BLOCO 0 — Fundamentos Java para Web

---

## Módulo 0: Java para desenvolvimento web — conceitos base

> 🟢 **Para iniciantes:** leia este módulo antes de qualquer outro. Se você já trabalha com Spring, pode pular para o Bloco 1.

### O que é um framework web?

Quando você escreve uma aplicação web em Java puro, precisa lidar manualmente com:

- Abrir uma porta TCP e escutar requisições HTTP
- Fazer o parse dos bytes recebidos e montar um objeto de request
- Rotear a requisição para o código certo (qual método responde a `/produtos`?)
- Serializar o objeto de resposta para JSON
- Gerenciar conexões com banco de dados
- Controlar o ciclo de vida dos objetos da aplicação

Um **framework web** resolve tudo isso por você. Quarkus, Spring Boot e Micronaut são exemplos de frameworks que entregam toda essa infraestrutura pronta, deixando você focar na lógica de negócio.

### O que é Maven e para que serve o pom.xml?

**Maven** é a ferramenta de build mais usada no ecossistema Java. Ele é responsável por:

- Baixar as bibliotecas (dependências) que seu projeto precisa
- Compilar o código
- Rodar os testes
- Empacotar a aplicação em um `.jar` ou `.war`

O arquivo **`pom.xml`** (Project Object Model) é o coração do Maven — ele descreve o projeto e lista tudo que ele precisa.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project>

  <!-- Identidade do projeto -->
  <groupId>com.empresa</groupId>       <!-- equivale ao "pacote raiz" -->
  <artifactId>meu-servico</artifactId> <!-- nome do projeto/jar -->
  <version>1.0.0</version>

  <!-- Herda configurações base do Quarkus -->
  <parent>
    <groupId>io.quarkus.platform</groupId>
    <artifactId>quarkus-bom</artifactId>
    <version>3.8.0</version>
  </parent>

  <dependencies>

    <!-- Uma dependência = uma biblioteca externa -->
    <dependency>
      <groupId>io.quarkus</groupId>
      <artifactId>quarkus-rest</artifactId>
      <!-- sem <version> pois o BOM pai já gerencia isso -->
    </dependency>

    <!-- Dependência só usada nos testes -->
    <dependency>
      <groupId>io.quarkus</groupId>
      <artifactId>quarkus-junit5</artifactId>
      <scope>test</scope>
    </dependency>

  </dependencies>

  <build>
    <plugins>
      <!-- Plugin que ensina o Maven a entender o Quarkus -->
      <plugin>
        <groupId>io.quarkus.platform</groupId>
        <artifactId>quarkus-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>

</project>
```

**Comandos Maven essenciais:**

```bash
./mvnw compile          # compila o código
./mvnw test             # roda os testes
./mvnw package          # compila + testa + gera o jar
./mvnw package -DskipTests  # gera o jar sem rodar testes
./mvnw clean            # apaga a pasta target/ (build anterior)
./mvnw clean package    # limpa e reconstrói do zero
```

> 💡 O `./mvnw` (Maven Wrapper) é um script que já vem no projeto e baixa a versão correta do Maven automaticamente. Não precisa instalar o Maven separadamente se usar o wrapper.

### O que são Annotations (@)?

Annotations são marcações no código que passam instruções para o framework. O Java em si não faz nada com elas — é o framework que as lê e age de acordo.

```java
// @Path diz ao Quarkus: "esse é um endpoint REST no caminho /produtos"
@Path("/produtos")
public class ProdutoResource {

    // @GET diz: "esse método responde a requisições HTTP GET"
    @GET
    // @Produces diz: "a resposta vai ser JSON"
    @Produces(MediaType.APPLICATION_JSON)
    public List<Produto> listar() {
        return List.of(new Produto("Notebook", 3000.0));
    }
}
```

Sem as annotations, o Quarkus não saberia que essa classe é um endpoint REST, nem que o método `listar()` deve ser chamado quando alguém fizer um GET em `/produtos`.

### O que é HTTP e REST?

**HTTP** é o protocolo de comunicação da web. Uma requisição HTTP tem:

- **Verbo** (método): o que você quer fazer
- **Path** (caminho): em qual recurso
- **Headers**: metadados (tipo do conteúdo, autenticação etc.)
- **Body**: dados enviados (em POST/PUT)

| Verbo HTTP | Significado | Exemplo |
|---|---|---|
| `GET` | Buscar/ler dados | `GET /produtos` → lista produtos |
| `POST` | Criar novo recurso | `POST /produtos` → cria produto |
| `PUT` | Substituir recurso | `PUT /produtos/1` → atualiza produto 1 |
| `PATCH` | Atualizar parcialmente | `PATCH /produtos/1` → altera só o preço |
| `DELETE` | Remover recurso | `DELETE /produtos/1` → remove produto 1 |

**Códigos de status HTTP** que você vai usar o tempo todo:

| Código | Significado |
|---|---|
| `200 OK` | Sucesso |
| `201 Created` | Recurso criado com sucesso |
| `204 No Content` | Sucesso sem corpo de resposta (ex: DELETE) |
| `400 Bad Request` | Dados inválidos enviados pelo cliente |
| `401 Unauthorized` | Não autenticado |
| `403 Forbidden` | Autenticado, mas sem permissão |
| `404 Not Found` | Recurso não existe |
| `500 Internal Server Error` | Erro no servidor |

**REST** (Representational State Transfer) é um estilo arquitetural que usa HTTP de forma semântica: cada URL representa um recurso, e os verbos HTTP expressam a operação desejada.

```
GET    /produtos          → lista todos os produtos
GET    /produtos/42       → busca o produto de id 42
POST   /produtos          → cria um novo produto
PUT    /produtos/42       → substitui o produto 42
DELETE /produtos/42       → remove o produto 42
```

### O que é JPA e Hibernate?

**JPA** (Jakarta Persistence API) é uma especificação — um contrato que define como mapear objetos Java para tabelas de banco de dados relacionais.

**Hibernate** é a implementação mais popular dessa especificação. É ele que de fato gera e executa o SQL.

**Panache** (que veremos no Módulo 7) é uma camada que o Quarkus coloca em cima do Hibernate para simplificar o uso — como um "atalho" para as operações mais comuns.

```
Você escreve →  Panache  →  Hibernate  →  SQL  →  Banco de dados
   (Java)     (simplifica)  (implementa)  (gera)
```

Sem JPA/Panache, você precisaria escrever SQL manualmente e converter os resultados para objetos Java. Com Panache, você escreve:

```java
Produto.findById(42L);  // Panache gera: SELECT * FROM produto WHERE id = 42
```

### O que é injeção de dependência?

Imagine que seu `ProdutoResource` precisa usar o `ProdutoService`, que por sua vez precisa do `ProdutoRepository`. Sem injeção de dependência, você criaria cada objeto manualmente:

```java
// Sem injeção de dependência — ruim
public class ProdutoResource {
    private ProdutoService service = new ProdutoService(
        new ProdutoRepository(new EntityManager(...))
    );
}
```

Isso é problemático porque: o `ProdutoResource` precisa saber como construir todas as dependências, é difícil trocar implementações (para testes, por exemplo), e o código fica acoplado.

Com **injeção de dependência**, você declara o que precisa e o framework cria e injeta:

```java
// Com CDI (Quarkus) — o framework cuida da criação
@Path("/produtos")
public class ProdutoResource {

    @Inject  // "Quarkus, injeta aqui um ProdutoService"
    ProdutoService service;

    // service já está pronto para usar, sem new
}
```

O framework gerencia o ciclo de vida dos objetos, resolve dependências automaticamente e facilita testes (você pode injetar um mock no lugar do objeto real).

---

### BLOCO 1 — Ambiente

---

## Módulo 1: SDKMAN — Gerenciando o ambiente Java

### O que é o SDKMAN?

O **SDKMAN!** é um gerenciador de versões para ferramentas do ecossistema JVM. Pense nele como o `nvm` do Node.js, mas para Java, Maven, Gradle e a própria Quarkus CLI.

Com ele você instala e alterna entre versões do JDK, GraalVM e outras ferramentas com um único comando, sem mexer em variáveis de ambiente manualmente.

> 💡 Em vez de instalar o JDK manualmente e configurar `JAVA_HOME`, o SDKMAN cuida de tudo. É especialmente útil quando você trabalha em projetos com versões diferentes de Java.

### Instalando o SDKMAN

```bash
# Linux / macOS / WSL
curl -s "https://get.sdkman.io" | bash

# Recarregar o shell após a instalação
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Verificar instalação
sdk version
```

> ⚠️ **Windows nativo:** o SDKMAN não roda no CMD/PowerShell puro. Use **WSL2** ou **Git Bash**. Alternativa para Windows nativo: [Scoop](https://scoop.sh).

### Instalando o JDK

```bash
# Listar todos os JDKs disponíveis
sdk list java

# Instalar JDK 21 LTS (recomendado para Quarkus)
sdk install java 21.0.3-tem

# Instalar GraalVM 21 (necessário para native image)
sdk install java 21.0.3-graal

# Ver qual JDK está ativo
sdk current java

# Alternar entre versões
sdk use java 21.0.3-tem      # só na sessão atual
sdk default java 21.0.3-tem  # define como padrão permanente
```

### Distribuições de JDK disponíveis

| Identificador | Distribuição | Quando usar |
|---|---|---|
| `-tem` | Eclipse Temurin | Recomendado para uso geral |
| `-graal` | GraalVM Community | Native image com Quarkus |
| `-ms` | Microsoft OpenJDK | Projetos Azure |
| `-amzn` | Amazon Corretto | Projetos AWS |
| `-zulu` | Azul Zulu | Ambientes enterprise |

### Instalando Maven, Gradle e Quarkus CLI

```bash
# Maven
sdk install maven

# Gradle (alternativa ao Maven)
sdk install gradle

# Quarkus CLI (recomendado)
sdk install quarkus

# Verificar
mvn --version
quarkus --version
```

### Comandos do dia a dia

```bash
sdk list                    # listar todas as ferramentas
sdk list java               # listar versões de Java disponíveis
sdk install <ferramenta>    # instalar versão mais recente
sdk use java 17.0.11-tem    # usar versão só na sessão atual
sdk default java 21.0.3-tem # definir padrão permanente
sdk current                 # ver o que está ativo
sdk update                  # atualizar lista de versões
sdk upgrade                 # atualizar ferramentas instaladas
sdk uninstall java 17.0.11-tem  # remover versão
```

### Fixando versões por projeto com .sdkmanrc

Crie um arquivo `.sdkmanrc` na raiz do projeto para garantir que todos do time usem as mesmas versões:

```bash
# .sdkmanrc
java=21.0.3-tem
maven=3.9.6
quarkus=3.8.0
```

```bash
# Ativar as versões do .sdkmanrc ao entrar na pasta
sdk env

# Para ativar automaticamente, adicione no ~/.bashrc ou ~/.zshrc:
# sdkman_auto_env=true
```

> 💡 Commite o `.sdkmanrc` no repositório. Assim todos os devs do time usam exatamente as mesmas versões.

---

## Módulo 2: Quarkus CLI — Guia completo

### Por que usar a CLI?

A Quarkus CLI é a forma mais produtiva de trabalhar com Quarkus. Ela substitui longos comandos Maven por comandos curtos e memoráveis.

```bash
# Sem CLI (Maven puro)
./mvnw quarkus:add-extension -Dextensions="hibernate-orm-panache,jdbc-postgresql"

# Com CLI
quarkus ext add hibernate-orm-panache jdbc-postgresql
```

### Instalação

```bash
# Opção 1: SDKMAN (recomendado)
sdk install quarkus

# Opção 2: Homebrew (macOS/Linux)
brew install quarkusio/tap/quarkus

# Verificar
quarkus --version
```

### Criando projetos

```bash
# Projeto básico
quarkus create app com.empresa:meu-servico

# Com extensões já incluídas
quarkus create app com.empresa:meu-servico \
  --extension='rest,hibernate-orm-panache,jdbc-postgresql,smallrye-openapi'

# Especificando versão do Java
quarkus create app com.empresa:meu-servico --java=21

# Com Gradle em vez de Maven
quarkus create app com.empresa:meu-servico --gradle

# Com Kotlin
quarkus create app com.empresa:meu-servico --kotlin

# Ver todas as opções
quarkus create app --help
```

### Dev Mode — O coração da produtividade

O Dev Mode monitora seus arquivos e aplica mudanças **sem reiniciar a JVM**.

```bash
# Iniciar o Dev Mode
quarkus dev

# Com debug habilitado
quarkus dev --debug

# Com perfil específico
quarkus dev -Dquarkus.profile=staging
```

| Recurso | Detalhe |
|---|---|
| Live reload | Código recarregado ao salvar, sem reiniciar |
| Continuous Testing | Testes rodam automaticamente ao detectar mudanças |
| Dev UI | Interface web em `http://localhost:8080/q/dev` |
| Dev Services | Banco/Kafka/Redis sobem automaticamente via Docker |

**Atalhos de teclado dentro do Dev Mode:**

```
r → rodar todos os testes agora
f → rodar apenas os testes que falharam
p → pausar/retomar os testes
s → forçar restart da aplicação
q → sair do Dev Mode
```

### Dev UI

Ao rodar `quarkus dev`, acesse `http://localhost:8080/q/dev`:

- **Configuration** — todas as propriedades ativas e seus valores
- **Endpoints REST** — lista de todos os `@Path` registrados
- **Hibernate ORM** — entidades, queries, DDL gerado
- **SmallRye OpenAPI** — Swagger UI integrado
- **Continuous Testing** — painel de testes em tempo real
- **Dev Services** — status dos containers Docker automáticos

### Gerenciando extensões

```bash
# Listar extensões instaladas no projeto
quarkus ext list

# Buscar extensões disponíveis
quarkus ext list --installable
quarkus ext list --installable | grep kafka

# Adicionar extensões
quarkus ext add rest
quarkus ext add hibernate-orm-panache jdbc-postgresql

# Remover extensão
quarkus ext remove hibernate-orm-panache
```

### Build

```bash
# Build padrão (JVM)
quarkus build

# Build nativo (requer GraalVM)
quarkus build --native

# Build nativo via Docker (sem instalar GraalVM localmente)
quarkus build --native -Dquarkus.native.container-build=true

# Sem rodar testes
quarkus build -DskipTests
```

### Dev Services — Infraestrutura automática

Um dos recursos mais poderosos: ao adicionar certas extensões, o Quarkus **sobe automaticamente containers Docker** com as dependências necessárias, sem nenhuma configuração.

```bash
# Basta adicionar a extensão e rodar quarkus dev:
# jdbc-postgresql + hibernate-orm → container PostgreSQL sobe automaticamente
# messaging-kafka → container Kafka/Redpanda sobe automaticamente
# redis-client → container Redis sobe automaticamente
# oidc → container Keycloak sobe automaticamente
```

```properties
# Para desabilitar (quando quiser usar banco externo)
quarkus.datasource.devservices.enabled=false

# Fixar a porta do container Dev Services
quarkus.datasource.devservices.port=5432
```

> 🔵 **Para quem vem do Spring:** no Spring você precisaria subir um `docker-compose.yml` manualmente. No Quarkus, ao rodar `quarkus dev`, toda a infraestrutura sobe junto e é destruída ao sair.

### Comparativo CLI vs Maven direto

| Tarefa | Maven puro | Quarkus CLI |
|---|---|---|
| Criar projeto | `mvn io.quarkus.platform:quarkus-maven-plugin:create` | `quarkus create app` |
| Dev Mode | `./mvnw quarkus:dev` | `quarkus dev` |
| Adicionar extensão | `./mvnw quarkus:add-extension -Dextensions="..."` | `quarkus ext add ...` |
| Build | `./mvnw package` | `quarkus build` |
| Build nativo | `./mvnw package -Pnative` | `quarkus build --native` |
| Listar extensões | `./mvnw quarkus:list-extensions` | `quarkus ext list` |
| Rodar testes | `./mvnw test` | `quarkus test` |

---

## Módulo 3: Configurando o primeiro projeto

### O que é Quarkus?

Quarkus é um framework Java nativo para Kubernetes, projetado para funcionar com GraalVM e HotSpot. Seu foco é tornar o Java uma plataforma de primeira classe em ambientes serverless e cloud-native, com **tempo de inicialização ultrarrápido** e **consumo de memória mínimo**.

A filosofia central é **"move work to build time"**: tudo que o Spring faz em runtime (varredura de classpath, criação de proxies, leitura de annotations), o Quarkus faz em tempo de compilação. O resultado é uma aplicação que inicializa em milissegundos.

> 🔵 **Para quem vem do Spring:** pense no Quarkus como um Spring Boot reescrito do zero com cloud-native em mente.

### Por que aprender Quarkus?

- **Startup em milissegundos** (vs segundos no Spring Boot)
- **Consumo de memória reduzido** (~50MB vs ~300MB no Spring)
- **Native image com GraalVM** — compila para binário nativo sem JVM
- **Developer Experience superior** — live reload quase instantâneo
- **Dev Services** — infraestrutura sobe automática no desenvolvimento
- **Ecossistema MicroProfile** + extensões Quarkus

### Criando o primeiro projeto

```bash
# Via Quarkus CLI (recomendado)
quarkus create app com.exemplo:meu-projeto \
  --extension='rest,hibernate-orm-panache,jdbc-postgresql'

# Via Maven (sem CLI instalada)
mvn io.quarkus.platform:quarkus-maven-plugin:3.8.0:create \
  -DprojectGroupId=com.exemplo \
  -DprojectArtifactId=meu-projeto \
  -Dextensions="rest,hibernate-orm-panache"

# Via navegador (equivalente ao start.spring.io)
# https://code.quarkus.io
```

### Estrutura do projeto

```
meu-projeto/
├── src/
│   ├── main/
│   │   ├── java/com/exemplo/
│   │   │   └── GreetingResource.java   ← seu primeiro endpoint
│   │   └── resources/
│   │       ├── application.properties  ← configurações
│   │       └── META-INF/resources/     ← arquivos estáticos (HTML, CSS)
│   └── test/
│       └── java/com/exemplo/
│           └── GreetingResourceTest.java
├── .sdkmanrc                           ← versões fixadas (commitar)
├── .gitignore
└── pom.xml
```

### Rodando a aplicação

```bash
cd meu-projeto

# Dev Mode (recomendado para desenvolvimento)
quarkus dev
# → App em http://localhost:8080
# → Dev UI em http://localhost:8080/q/dev

# Build e executar (produção)
quarkus build
java -jar target/quarkus-app/quarkus-run.jar
```

### Spring vs Quarkus: Visão geral

> 🔵 Tabela de referência rápida para quem vem do Spring.

| Conceito | Spring Boot | Quarkus |
|---|---|---|
| Injeção de Dependência | `@Autowired`, `@Component` | CDI (`@Inject`, `@ApplicationScoped`) |
| REST | Spring MVC / WebFlux | RESTEasy Reactive / Quarkus REST |
| Persistência | Spring Data JPA | Panache (JPA simplificado) |
| Configuração | `application.properties` / YAML | `application.properties` |
| Profiles | `application-dev.properties` | Prefixo `%dev.` no mesmo arquivo |
| Testes | `@SpringBootTest` | `@QuarkusTest` |
| Dev Tools | Spring DevTools | Dev Mode (`quarkus dev`) |
| Actuator | `/actuator/health` | `/q/health` |
| Gerador de projetos | start.spring.io | code.quarkus.io |

---

### BLOCO 2 — Desenvolvimento

---

## Módulo 4: Injeção de Dependência (CDI)

### O que é CDI?

**CDI** (Contexts and Dependency Injection) é a especificação Jakarta EE para injeção de dependência. É o equivalente ao container Spring, mas padronizado.

O Quarkus usa uma implementação própria do CDI chamada **ArC**, que processa todas as injeções em **tempo de compilação** — sem reflexão em runtime. Isso contribui para o startup rápido, mas significa que alguns padrões dinâmicos do Spring não funcionam diretamente.

> 🟢 **Para iniciantes:** CDI é o sistema que cria e conecta os objetos da sua aplicação automaticamente. Você declara o que precisa com `@Inject` e o Quarkus cuida do resto.

### De @Autowired para @Inject

> 🔵 Comparativo para quem vem do Spring.

**Spring:**
```java
@Service
public class PedidoService {

    @Autowired
    private PedidoRepository repository;

    @Autowired
    private EmailService emailService;
}
```

**Quarkus (CDI):**
```java
@ApplicationScoped
public class PedidoService {

    @Inject
    PedidoRepository repository;

    @Inject
    EmailService emailService;
}
```

As diferenças principais:
- `@Service` / `@Component` → `@ApplicationScoped`
- `@Autowired` → `@Inject`
- Campos não precisam ser `private` (o CDI usa proxies, não reflexão direta)

### Escopos CDI

O escopo define **por quanto tempo** um bean existe e é reutilizado.

| Spring | CDI (Quarkus) | Descrição |
|---|---|---|
| `@Component` / `@Service` | `@ApplicationScoped` | Uma instância por aplicação (mais comum) |
| `@RequestScope` | `@RequestScoped` | Nova instância por requisição HTTP |
| `@SessionScope` | `@SessionScoped` | Uma instância por sessão do usuário |
| `@Prototype` | `@Dependent` | Nova instância a cada ponto de injeção |
| N/A | `@Singleton` | Singleton sem proxy CDI (mais leve) |

```java
// O escopo mais comum — uma instância para toda a aplicação
@ApplicationScoped
public class ProdutoService {
    // ...
}

// Nova instância para cada requisição HTTP
@RequestScoped
public class CarrinhoService {
    // ...
}
```

> 🟢 **Dica para iniciantes:** na dúvida, use `@ApplicationScoped`. É o equivalente ao comportamento padrão do Spring para `@Service` e `@Component`.

### Qualifiers — diferenciando implementações

Quando você tem mais de uma implementação de uma interface, use qualifiers para indicar qual injetar.

**Spring:**
```java
@Autowired
@Qualifier("pagamentoCartao")
private PagamentoService pagamentoService;
```

**Quarkus:**
```java
// 1. Definir o qualifier
@Qualifier
@Retention(RUNTIME)
@Target({METHOD, FIELD, PARAMETER, TYPE})
public @interface Cartao {}

// 2. Marcar a implementação
@Cartao
@ApplicationScoped
public class PagamentoCartaoService implements PagamentoService { ... }

@ApplicationScoped
public class PagamentoPixService implements PagamentoService { ... }

// 3. Injetar a versão desejada
@Inject
@Cartao
PagamentoService pagamentoCartao;

@Inject
PagamentoPixService pagamentoPix; // sem qualifier = injeta direto
```

### Producers — criando beans customizados

Quando você precisa criar um bean com lógica customizada de inicialização (equivalente ao `@Bean` do Spring):

**Spring:**
```java
@Configuration
public class AppConfig {
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
            .enable(SerializationFeature.INDENT_OUTPUT);
    }
}
```

**Quarkus:**
```java
public class AppProducers {

    @Produces
    @ApplicationScoped
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
            .enable(SerializationFeature.INDENT_OUTPUT);
    }
}
```

### Eventos CDI

CDI tem um sistema de eventos para comunicação desacoplada entre beans:

```java
// Disparar evento
@ApplicationScoped
public class PedidoService {

    @Inject
    Event<PedidoCriado> event;

    @Transactional
    public void criar(Pedido pedido) {
        pedido.persist();
        event.fire(new PedidoCriado(pedido.id));
    }
}

// Observar evento
@ApplicationScoped
public class NotificacaoService {

    void onPedidoCriado(@Observes PedidoCriado evento) {
        // envia e-mail, notificação etc.
    }
}
```

---

## Módulo 5: REST com Quarkus

### JAX-RS: a API de REST do Jakarta EE

O Quarkus usa **JAX-RS** (Jakarta RESTful Web Services) para construir endpoints REST. É uma especificação padrão — diferente da API proprietária do Spring MVC.

> 🟢 **Para iniciantes:** JAX-RS é um conjunto de annotations que você coloca no seu código para dizer "essa classe é um endpoint REST" e "esse método responde ao GET /produtos".

### De @RestController para @Path

> 🔵 Comparativo completo para quem vem do Spring MVC.

**Spring MVC:**
```java
@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    @GetMapping
    public List<Produto> listar() { ... }

    @GetMapping("/{id}")
    public Produto buscar(@PathVariable Long id) { ... }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Produto criar(@RequestBody @Valid Produto produto) { ... }

    @PutMapping("/{id}")
    public Produto atualizar(@PathVariable Long id,
                             @RequestBody Produto produto) { ... }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) { ... }
}
```

**Quarkus REST (RESTEasy Reactive):**
```java
@Path("/api/produtos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProdutoResource {

    @GET
    public List<Produto> listar() { ... }

    @GET
    @Path("/{id}")
    public Produto buscar(@PathParam("id") Long id) { ... }

    @POST
    public Response criar(@Valid Produto produto) {
        produto.persist();
        return Response.status(201).entity(produto).build();
    }

    @PUT
    @Path("/{id}")
    public Produto atualizar(@PathParam("id") Long id,
                              Produto produto) { ... }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id) {
        Produto.deleteById(id);
        return Response.noContent().build();
    }
}
```

### Mapeamento de annotations

| Spring MVC | Quarkus JAX-RS | Propósito |
|---|---|---|
| `@RestController` | `@Path` | Marca a classe como endpoint REST |
| `@GetMapping` | `@GET` | Responde a HTTP GET |
| `@PostMapping` | `@POST` | Responde a HTTP POST |
| `@PutMapping` | `@PUT` | Responde a HTTP PUT |
| `@DeleteMapping` | `@DELETE` | Responde a HTTP DELETE |
| `@PatchMapping` | `@PATCH` | Responde a HTTP PATCH |
| `@PathVariable` | `@PathParam` | Parâmetro da URL (`/{id}`) |
| `@RequestParam` | `@QueryParam` | Query string (`?nome=abc`) |
| `@RequestHeader` | `@HeaderParam` | Header HTTP |
| `@RequestBody` | *(implícito)* | Corpo da requisição |
| `ResponseEntity<T>` | `Response` | Resposta com status e headers |
| `@ResponseStatus` | `Response.status()` | Define o status HTTP |

### Parâmetros de requisição

```java
@GET
@Path("/buscar")
public List<Produto> buscar(
    @QueryParam("nome") String nome,               // ?nome=notebook
    @QueryParam("pagina") @DefaultValue("0") int pagina,  // ?pagina=2
    @QueryParam("tamanho") @DefaultValue("10") int tamanho,
    @HeaderParam("X-Tenant-Id") String tenantId,   // header HTTP
    @CookieParam("session") String session         // cookie
) {
    return produtoService.buscar(nome, pagina, tamanho);
}
```

### Resposta customizada com Response

```java
@POST
public Response criar(@Valid Produto produto) {
    produto.persist();

    // Resposta com status 201 e o Location header
    URI location = URI.create("/api/produtos/" + produto.id);
    return Response
        .created(location)      // status 201 + Location header
        .entity(produto)        // corpo da resposta
        .build();
}

@GET
@Path("/{id}")
public Response buscar(@PathParam("id") Long id) {
    return Produto.findByIdOptional(id)
        .map(p -> Response.ok(p).build())
        .orElse(Response.status(404).build());
}
```

### Tratamento de erros

**Spring:**
```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProdutoNaoEncontradoException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ProdutoNaoEncontradoException ex) {
        return new ErrorResponse(ex.getMessage());
    }
}
```

**Quarkus:**
```java
@Provider  // registra automaticamente como handler global
public class ProdutoNaoEncontradoMapper
    implements ExceptionMapper<ProdutoNaoEncontradoException> {

    @Override
    public Response toResponse(ProdutoNaoEncontradoException ex) {
        return Response
            .status(404)
            .entity(new ErrorResponse(ex.getMessage()))
            .build();
    }
}
```

> 🟢 **Para iniciantes:** `@Provider` é como o Quarkus descobre e registra automaticamente seu handler de exceção. É equivalente ao `@ControllerAdvice` do Spring.

### Validação com Bean Validation

```java
// Entidade com validações
public class Produto {
    @NotBlank(message = "Nome é obrigatório")
    public String nome;

    @NotNull
    @DecimalMin(value = "0.01", message = "Preço deve ser positivo")
    public BigDecimal preco;

    @Size(max = 500)
    public String descricao;
}

// No resource, @Valid dispara a validação automaticamente
@POST
public Response criar(@Valid Produto produto) {
    // se chegar aqui, os dados já são válidos
    produto.persist();
    return Response.status(201).entity(produto).build();
}
```

Quando a validação falha, o Quarkus retorna automaticamente um `400 Bad Request` com os detalhes dos erros.

### OpenAPI e Swagger UI

Adicione a extensão `smallrye-openapi` para ter documentação automática:

```bash
quarkus ext add smallrye-openapi
```

```java
// Annotations opcionais para enriquecer a documentação
@Operation(summary = "Lista todos os produtos")
@APIResponse(responseCode = "200", description = "Lista de produtos")
@GET
public List<Produto> listar() { ... }
```

Acesse em desenvolvimento:
- `http://localhost:8080/q/openapi` — especificação OpenAPI (JSON/YAML)
- `http://localhost:8080/q/swagger-ui` — interface Swagger interativa

---

## Módulo 6: Configuração e Profiles

### MicroProfile Config

O Quarkus usa **MicroProfile Config** para gerenciar configurações — uma especificação padrão que funciona com `application.properties`, variáveis de ambiente e outras fontes.

### De @Value para @ConfigProperty

> 🔵 Comparativo para quem vem do Spring.

**Spring:**
```java
@Value("${app.nome}")
private String appNome;

@Value("${app.timeout:30}")
private int timeout;
```

**Quarkus:**
```java
@ConfigProperty(name = "app.nome")
String appNome;

@ConfigProperty(name = "app.timeout", defaultValue = "30")
int timeout;

// Valor opcional (não lança erro se a propriedade não existir)
@ConfigProperty(name = "app.feature-flag")
Optional<Boolean> featureFlag;
```

### De @ConfigurationProperties para @ConfigMapping

**Spring:**
```java
@ConfigurationProperties(prefix = "app")
public record AppConfig(String nome, int timeout, String apiKey) {}
```

**Quarkus:**
```java
@ConfigMapping(prefix = "app")
public interface AppConfig {
    String nome();
    int timeout();
    String apiKey();

    // Grupos aninhados
    Database database();

    interface Database {
        String url();
        int poolSize();
    }
}
```

### Profiles de configuração

**Spring** usa arquivos separados: `application-dev.properties`, `application-prod.properties`.

**Quarkus** usa prefixos no **mesmo arquivo**:

```properties
# application.properties

# Configurações comuns (todos os profiles)
quarkus.http.port=8080
quarkus.datasource.db-kind=postgresql

# Apenas em DEV (ativo ao rodar quarkus dev)
%dev.quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/dev_db
%dev.quarkus.hibernate-orm.database.generation=drop-and-create
%dev.quarkus.log.level=DEBUG

# Apenas em PROD
%prod.quarkus.datasource.jdbc.url=${DATABASE_URL}
%prod.quarkus.hibernate-orm.database.generation=validate
%prod.quarkus.log.level=WARN

# Apenas em TEST
%test.quarkus.datasource.db-kind=h2
%test.quarkus.datasource.jdbc.url=jdbc:h2:mem:testdb
%test.quarkus.hibernate-orm.database.generation=drop-and-create
```

Ativando profiles:
```bash
# Dev mode ativa automaticamente o profile 'dev'
quarkus dev

# Profile customizado
quarkus dev -Dquarkus.profile=staging

# Em produção
java -Dquarkus.profile=prod -jar quarkus-run.jar
```

### Configuração completa do application.properties

```properties
# ── Servidor ──────────────────────────────────────────────
quarkus.http.port=8080
quarkus.http.host=0.0.0.0

# ── Datasource ────────────────────────────────────────────
quarkus.datasource.db-kind=postgresql
quarkus.datasource.username=usuario
quarkus.datasource.password=senha
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/meubanco

# Pool de conexões
quarkus.datasource.jdbc.min-size=5
quarkus.datasource.jdbc.max-size=20

# ── Hibernate ─────────────────────────────────────────────
quarkus.hibernate-orm.database.generation=update  # validate em prod
quarkus.hibernate-orm.log.sql=true                # false em prod

# ── Logs ──────────────────────────────────────────────────
quarkus.log.level=INFO
quarkus.log.category."com.exemplo".level=DEBUG

# ── CORS ──────────────────────────────────────────────────
quarkus.http.cors=true
quarkus.http.cors.origins=http://localhost:3000,https://meusite.com
quarkus.http.cors.methods=GET,POST,PUT,DELETE

# ── OpenAPI ───────────────────────────────────────────────
quarkus.smallrye-openapi.info-title=Minha API
quarkus.smallrye-openapi.info-version=1.0.0
```

### Variáveis de ambiente

O Quarkus converte automaticamente nomes de propriedades para variáveis de ambiente:

```
quarkus.datasource.jdbc.url  →  QUARKUS_DATASOURCE_JDBC_URL
app.api-key                  →  APP_API_KEY
```

```bash
export QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://prod-db:5432/mydb
export QUARKUS_DATASOURCE_USERNAME=produser
java -jar quarkus-run.jar
```

---

## Módulo 7: Persistência com Panache

### O que é Panache?

**Panache** é a camada de persistência do Quarkus que simplifica o uso de JPA/Hibernate. Ele elimina o boilerplate de repositórios genéricos e oferece uma API fluente para queries.

> 🟢 **Para iniciantes:** Panache permite que você salve e busque dados no banco de dados sem escrever SQL manualmente. Você trabalha com objetos Java e o Panache cuida da tradução para SQL.

Panache oferece dois padrões:

1. **Active Record** — a própria entidade tem os métodos de persistência
2. **Repository** — classe separada de repositório (mais próximo do Spring Data)

### Configurando a entidade

Antes de usar Panache, você precisa mapear sua classe Java para uma tabela do banco:

```java
@Entity  // diz ao JPA que essa classe é uma tabela
@Table(name = "produtos")  // opcional: nome da tabela (padrão = nome da classe)
public class Produto extends PanacheEntity {
    // PanacheEntity já fornece o campo 'id' (Long, auto-incremento)

    // Cada campo public vira uma coluna na tabela
    public String nome;

    @Column(name = "preco_unitario")  // nome customizado da coluna
    public BigDecimal preco;

    public String categoria;

    @Column(nullable = false)
    public boolean ativo = true;

    @ManyToOne  // relacionamento: muitos produtos para um fornecedor
    public Fornecedor fornecedor;
}
```

### Padrão Active Record

```java
@Entity
public class Produto extends PanacheEntity {

    public String nome;
    public BigDecimal preco;
    public String categoria;

    // Métodos de consulta customizados ficam na própria entidade
    public static List<Produto> findByCategoria(String categoria) {
        return list("categoria", categoria);
    }

    public static List<Produto> findAtivos() {
        return list("ativo", true);
    }

    public static Optional<Produto> findByNome(String nome) {
        return find("nome", nome).firstResultOptional();
    }
}
```

```java
// Uso no Resource — sem injetar nenhum repository
@GET
public List<Produto> listar() {
    return Produto.listAll();
}

@GET
@Path("/categoria/{cat}")
public List<Produto> porCategoria(@PathParam("cat") String cat) {
    return Produto.findByCategoria(cat);
}

@POST
@Transactional
public Response criar(Produto produto) {
    produto.persist();  // salva no banco
    return Response.status(201).entity(produto).build();
}

@DELETE
@Path("/{id}")
@Transactional
public Response deletar(@PathParam("id") Long id) {
    Produto.deleteById(id);
    return Response.noContent().build();
}
```

### Padrão Repository (mais próximo do Spring Data)

> 🔵 Se você prefere o estilo Spring Data, use PanacheRepository.

**Spring Data:**
```java
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    List<Produto> findByCategoria(String categoria);
    Optional<Produto> findByNome(String nome);
}
```

**Quarkus Panache Repository:**
```java
@ApplicationScoped
public class ProdutoRepository implements PanacheRepository<Produto> {

    public List<Produto> findByCategoria(String categoria) {
        return list("categoria", categoria);
    }

    public Optional<Produto> findByNome(String nome) {
        return find("nome", nome).firstResultOptional();
    }

    public List<Produto> findBaratos(BigDecimal limite) {
        return list("preco <= ?1 and ativo = true", limite);
    }
}
```

```java
// Resource com Repository pattern
@Path("/api/produtos")
public class ProdutoResource {

    @Inject
    ProdutoRepository repository;

    @GET
    public List<Produto> listar() {
        return repository.listAll();
    }

    @POST
    @Transactional
    public Response criar(Produto produto) {
        repository.persist(produto);
        return Response.status(201).entity(produto).build();
    }
}
```

### Queries com Panache

```java
// Query simples por campo
Produto.list("categoria", "eletronicos");

// Query com múltiplas condições (HQL, não SQL)
Produto.list("preco > ?1 and categoria = ?2 and ativo = true",
             100.0, "eletronicos");

// Query com named parameters (mais legível)
Produto.list("preco > :min and categoria = :cat",
             Parameters.with("min", 100.0).and("cat", "eletronicos"));

// Contagem
long total = Produto.count("ativo", true);

// Existe?
boolean existe = Produto.count("nome", "Notebook") > 0;

// Primeiro resultado
Optional<Produto> primeiro = Produto.find("ativo", true).firstResultOptional();

// Stream (processa sem carregar tudo na memória)
Produto.streamAll().forEach(p -> processar(p));
```

### Paginação

```java
@GET
public List<Produto> listar(
    @QueryParam("pagina") @DefaultValue("0") int pagina,
    @QueryParam("tamanho") @DefaultValue("10") int tamanho
) {
    return Produto.findAll()
        .page(Page.of(pagina, tamanho))
        .list();
}
```

### Transações

```java
// @Transactional funciona igual ao Spring!
@POST
@Transactional
public Produto criar(Produto produto) {
    produto.persist();
    emailService.notificar(produto);  // se isso falhar, o persist é revertido
    return produto;
}

// Transação programática
@Inject
TransactionManager tm;

public void salvarComControle(Produto produto) {
    tm.begin();
    try {
        produto.persist();
        tm.commit();
    } catch (Exception e) {
        tm.rollback();
        throw e;
    }
}
```

### Migrações com Flyway

```bash
quarkus ext add flyway
```

```properties
# application.properties
quarkus.flyway.migrate-at-start=true
quarkus.flyway.locations=db/migration
```

```sql
-- src/main/resources/db/migration/V1__criar_tabela_produto.sql
CREATE TABLE produto (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100),
    ativo BOOLEAN DEFAULT true
);

-- src/main/resources/db/migration/V2__adicionar_descricao.sql
ALTER TABLE produto ADD COLUMN descricao TEXT;
```

---

### BLOCO 3 — Qualidade e entrega

---

## Módulo 8: Testes

### Estrutura de testes no Quarkus

O Quarkus usa **JUnit 5** + **RestAssured** (para testes de API) por padrão. A annotation `@QuarkusTest` sobe uma instância real da aplicação para os testes.

> 🟢 **Para iniciantes:** `@QuarkusTest` é como um teste de integração — ele sobe sua aplicação completa (incluindo banco de dados via Dev Services) e você testa os endpoints como um cliente externo faria.

### De @SpringBootTest para @QuarkusTest

**Spring:**
```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class ProdutoControllerTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void deveListarProdutos() {
        ResponseEntity<List> response =
            restTemplate.getForEntity("/api/produtos", List.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
```

**Quarkus:**
```java
@QuarkusTest
class ProdutoResourceTest {

    @Test
    void deveListarProdutos() {
        given()
            .when().get("/api/produtos")
            .then()
                .statusCode(200)
                .body("$.size()", greaterThan(0));
    }

    @Test
    void deveCriarProduto() {
        var produto = Map.of(
            "nome", "Notebook",
            "preco", 3000.00
        );

        given()
            .contentType(ContentType.JSON)
            .body(produto)
        .when()
            .post("/api/produtos")
        .then()
            .statusCode(201)
            .body("nome", equalTo("Notebook"))
            .body("id", notNullValue());
    }

    @Test
    void deveRetornar404QuandoProdutoNaoExiste() {
        given()
            .when().get("/api/produtos/99999")
            .then()
                .statusCode(404);
    }
}
```

### Mocking com @InjectMock

**Spring:**
```java
@MockBean
private ProdutoService produtoService;
```

**Quarkus:**
```java
@QuarkusTest
class ProdutoResourceTest {

    @InjectMock
    ProdutoService produtoService;

    @Test
    void deveRetornarProdutoDoServico() {
        var produto = new Produto();
        produto.nome = "Notebook";

        Mockito.when(produtoService.buscar(1L))
               .thenReturn(Optional.of(produto));

        given()
            .when().get("/api/produtos/1")
            .then()
                .statusCode(200)
                .body("nome", equalTo("Notebook"));
    }
}
```

### Banco de dados nos testes

O Quarkus usa **Dev Services** para subir um banco em memória ou container automaticamente nos testes:

```properties
# src/test/resources/application.properties

# Opção 1: H2 em memória (mais rápido)
%test.quarkus.datasource.db-kind=h2
%test.quarkus.datasource.jdbc.url=jdbc:h2:mem:testdb
%test.quarkus.hibernate-orm.database.generation=drop-and-create

# Opção 2: PostgreSQL real via Testcontainers (mais fiel à produção)
# Sem nenhuma configuração — o Quarkus sobe um container automático
# quando detects quarkus-jdbc-postgresql no classpath
```

### Teste de integração nativo

```java
// Testa o binário nativo compilado
@QuarkusIntegrationTest
class ProdutoResourceIT extends ProdutoResourceTest {
    // herda todos os testes — roda contra o binário nativo
}
```

### Dados de teste com @TestTransaction

```java
@QuarkusTest
class ProdutoRepositoryTest {

    @Inject
    ProdutoRepository repository;

    @Test
    @TestTransaction  // reverte o banco após cada teste
    void deveSalvarEBuscarProduto() {
        var produto = new Produto();
        produto.nome = "Notebook";
        produto.preco = new BigDecimal("3000");
        repository.persist(produto);

        var encontrado = repository.findByNome("Notebook");
        assertThat(encontrado).isPresent();
        assertThat(encontrado.get().preco).isEqualByComparingTo("3000");
    }
}
```

---

## Módulo 9: Extensões essenciais

### O que são extensões?

Extensões são os "starters" do Quarkus (equivalentes aos `spring-boot-starter-*`). Cada extensão integra uma biblioteca ao ecossistema Quarkus, garantindo compatibilidade com native image, Dev Services e configuração automática.

```bash
# Adicionar extensão
quarkus ext add nome-da-extensao

# Listar disponíveis
quarkus ext list --installable
```

### Principais extensões e equivalentes Spring

| Funcionalidade | Spring Starter | Quarkus Extension |
|---|---|---|
| REST | `spring-web` | `quarkus-rest` |
| JPA + Panache | `spring-data-jpa` | `quarkus-hibernate-orm-panache` |
| PostgreSQL | `postgresql` | `quarkus-jdbc-postgresql` |
| Redis | `spring-data-redis` | `quarkus-redis-client` |
| Kafka | `spring-kafka` | `quarkus-messaging-kafka` |
| Segurança JWT | `spring-security` | `quarkus-smallrye-jwt` |
| OIDC / OAuth2 | `spring-security-oauth2` | `quarkus-oidc` |
| OpenAPI | `springdoc-openapi` | `quarkus-smallrye-openapi` |
| Health Check | `spring-boot-actuator` | `quarkus-smallrye-health` |
| Métricas | `micrometer` | `quarkus-micrometer` |
| Scheduler | `@Scheduled` | `quarkus-scheduler` |
| Cache | `spring-cache` | `quarkus-cache` |
| Validação | `spring-validation` | `quarkus-hibernate-validator` |
| Email | `spring-mail` | `quarkus-mailer` |
| Reactive HTTP Client | `spring-webflux` | `quarkus-rest-client-reactive` |

### Health Checks (equivalente ao Actuator)

```bash
quarkus ext add smallrye-health
```

```java
@Liveness    // verifica se a app está rodando
@ApplicationScoped
public class AppHealthCheck implements HealthCheck {

    @Override
    public HealthCheckResponse call() {
        return HealthCheckResponse.up("application");
    }
}

@Readiness   // verifica se a app está pronta para receber tráfego
@ApplicationScoped
public class DatabaseHealthCheck implements HealthCheck {

    @Inject
    DataSource dataSource;

    @Override
    public HealthCheckResponse call() {
        try (var conn = dataSource.getConnection()) {
            return HealthCheckResponse.up("database");
        } catch (Exception e) {
            return HealthCheckResponse
                .named("database")
                .down()
                .withData("error", e.getMessage())
                .build();
        }
    }
}
```

Endpoints disponíveis automaticamente:
```
GET /q/health        → todos os checks
GET /q/health/live   → liveness (está vivo?)
GET /q/health/ready  → readiness (está pronto?)
```

### Cache

```bash
quarkus ext add cache
```

```java
@ApplicationScoped
public class ProdutoService {

    @CacheResult(cacheName = "produtos")  // equivalente ao @Cacheable do Spring
    public Produto buscar(Long id) {
        return Produto.findById(id);
    }

    @CacheInvalidate(cacheName = "produtos")  // equivalente ao @CacheEvict
    public void invalidar(Long id) {}

    @CacheInvalidateAll(cacheName = "produtos")
    public void limparTudo() {}
}
```

### Scheduler (tarefas agendadas)

```bash
quarkus ext add scheduler
```

```java
@ApplicationScoped
public class TarefasAgendadas {

    // Cron expression (mesmo formato do Spring @Scheduled)
    @Scheduled(cron = "0 0 2 * * ?")  // todo dia às 2h
    void limpezaNoturna() {
        // ...
    }

    // Intervalo fixo
    @Scheduled(every = "1h")           // a cada 1 hora
    void sincronizar() {
        // ...
    }

    // Com delay inicial
    @Scheduled(every = "30m", delay = 5, delayUnit = TimeUnit.MINUTES)
    void verificar() {
        // ...
    }
}
```

### REST Client (chamadas HTTP externas)

```bash
quarkus ext add rest-client-reactive
```

```java
// Define a interface do cliente
@RegisterRestClient(configKey = "produtos-api")
@Path("/api")
public interface ProdutosExternoClient {

    @GET
    @Path("/produtos")
    List<Produto> listar();

    @GET
    @Path("/produtos/{id}")
    Produto buscar(@PathParam("id") Long id);
}
```

```properties
# application.properties
quarkus.rest-client.produtos-api.url=https://api.externa.com
quarkus.rest-client.produtos-api.scope=ApplicationScoped
```

```java
// Uso
@Inject
@RestClient
ProdutosExternoClient client;

public List<Produto> listarExternos() {
    return client.listar();
}
```

---

## Módulo 10: Build e Deploy

### Modos de execução

O Quarkus pode ser executado de três formas, com características bem diferentes:

| Modo | Startup | Memória | Quando usar |
|---|---|---|---|
| JVM padrão | ~0.5–1s | ~150MB | Desenvolvimento, ambientes sem GraalVM |
| Native image | ~0.01–0.05s | ~30–50MB | Produção cloud-native, serverless |
| Dev Mode | instantâneo | ~200MB | Desenvolvimento local |

### Build JVM (padrão)

```bash
# Gera o jar otimizado em target/quarkus-app/
quarkus build
# ou: ./mvnw package

# Executar
java -jar target/quarkus-app/quarkus-run.jar

# Com variáveis de ambiente
QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://prod:5432/db \
java -jar target/quarkus-app/quarkus-run.jar
```

> 🟢 **Para iniciantes:** a pasta `target/quarkus-app/` contém todos os arquivos necessários para rodar a aplicação. Não basta copiar só o `.jar` — a pasta inteira precisa ir junto.

### Build Native (GraalVM)

```bash
# Com GraalVM instalado localmente
quarkus build --native

# Via Docker — não precisa instalar GraalVM localmente (recomendado)
quarkus build --native -Dquarkus.native.container-build=true

# Executar o binário nativo (sem JVM!)
./target/meu-projeto-1.0.0-runner
```

> ⚠️ O build nativo é lento (5–15 minutos). Use no CI/CD, não localmente a todo momento.

### Docker

O Quarkus gera Dockerfiles automaticamente em `src/main/docker/`:

```bash
# Build da imagem JVM
docker build -f src/main/docker/Dockerfile.jvm \
  -t meu-projeto:jvm .

# Build da imagem nativa
docker build -f src/main/docker/Dockerfile.native \
  -t meu-projeto:native .

# Rodar o container
docker run -p 8080:8080 \
  -e QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://db:5432/mydb \
  meu-projeto:jvm
```

### Gerando imagem Docker automaticamente no build

```bash
quarkus ext add container-image-docker
```

```properties
# application.properties
quarkus.container-image.build=true
quarkus.container-image.group=meu-usuario
quarkus.container-image.name=meu-servico
quarkus.container-image.tag=1.0.0
```

```bash
quarkus build  # já gera a imagem Docker automaticamente
```

### Variáveis de ambiente em produção

```bash
# Quarkus converte propriedades para env vars:
# quarkus.datasource.jdbc.url → QUARKUS_DATASOURCE_JDBC_URL

export QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://prod-db:5432/mydb
export QUARKUS_DATASOURCE_USERNAME=produser
export QUARKUS_DATASOURCE_PASSWORD=senha_segura
java -jar quarkus-run.jar
```

### Comparativo de performance

| Métrica | Spring Boot (JVM) | Quarkus (JVM) | Quarkus (Native) |
|---|---|---|---|
| Tempo de startup | ~3–5s | ~0.5–1s | ~0.01–0.05s |
| Memória RSS | ~300MB | ~150MB | ~30–50MB |
| Tamanho do artefato | ~20MB jar | ~15MB jar | ~80MB binário |
| Throughput | Alto | Alto | Alto |
| Tempo de build | Rápido | Rápido | Lento (5–15min) |

---

### BLOCO 4 — Referência

---

## Módulo 11: Recursos e próximos passos

### Documentação oficial

- **Quarkus Guides:** https://quarkus.io/guides/ — um guia por extensão
- **code.quarkus.io:** https://code.quarkus.io — gerador de projetos
- **Quarkus Cheat Sheet:** https://quarkus.io/resources/
- **MicroProfile:** https://microprofile.io — especificações que o Quarkus implementa

### Próximos passos recomendados

1. ✅ Criar um CRUD completo com Panache (Active Record e Repository)
2. ✅ Configurar autenticação JWT com SmallRye JWT
3. ✅ Integrar com Kafka usando Reactive Messaging
4. ✅ Configurar CI/CD com build nativo
5. ✅ Deploy no Kubernetes com Quarkus Kubernetes Extension
6. ✅ Explorar programação reativa com Mutiny (`Uni<T>` e `Multi<T>`)

### Referência rápida: Spring → Quarkus

| Spring | Quarkus / CDI |
|---|---|
| `@Component` / `@Service` | `@ApplicationScoped` |
| `@Autowired` | `@Inject` |
| `@Value("${key}")` | `@ConfigProperty(name="key")` |
| `@ConfigurationProperties` | `@ConfigMapping` |
| `@RestController` + `@RequestMapping` | `@Path` |
| `@GetMapping` / `@PostMapping` | `@GET` / `@POST` |
| `@PathVariable` / `@RequestParam` | `@PathParam` / `@QueryParam` |
| `ResponseEntity<T>` | `Response` (Jakarta) |
| `JpaRepository<T, ID>` | `PanacheRepository<T>` |
| `@Transactional` | `@Transactional` (mesmo!) |
| `Mono<T>` / `Flux<T>` | `Uni<T>` / `Multi<T>` |
| `@SpringBootTest` | `@QuarkusTest` |
| `@MockBean` | `@InjectMock` |
| `@ControllerAdvice` | `@Provider` + `ExceptionMapper` |
| `/actuator/health` | `/q/health` |
| `/actuator/metrics` | `/q/metrics` |
| `spring.profiles.active=dev` | `quarkus.profile=dev` |
| `application-dev.properties` | `%dev.` no mesmo arquivo |
| start.spring.io | code.quarkus.io |
| Spring DevTools | `quarkus dev` |