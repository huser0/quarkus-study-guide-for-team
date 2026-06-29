# Guia Quarkus para Devs Spring

## Módulo 1: Introdução ao Quarkus

### O que é Quarkus?

Quarkus é um framework Java nativo para Kubernetes, projetado para funcionar com GraalVM e HotSpot. Seu foco é tornar o Java uma plataforma de primeira classe em ambientes serverless e cloud-native, com **tempo de inicialização ultrarrápido** e **consumo de memória mínimo**.

> 💡 **Se você vem do Spring:** pense no Quarkus como um Spring Boot que foi reescrito do zero com cloud-native em mente. A filosofia é "move work to build time" (fazer o trabalho em tempo de compilação, não em runtime).

### Por que migrar ou aprender Quarkus?

- **Startup em milissegundos** (vs segundos no Spring Boot)
- **Consumo de memória reduzido** (~50MB vs ~300MB no Spring)
- **Native image com GraalVM** — compila para binário nativo
- **Developer Experience (DevEx) superior** — live reload instantâneo
- **Ecossistema MicroProfile** + extensões Quarkus

### Spring vs Quarkus: Visão Geral

| Conceito | Spring Boot | Quarkus |
|---|---|---|
| Injeção de Dependência | `@Autowired`, `@Component` | CDI (`@Inject`, `@ApplicationScoped`) |
| REST | Spring MVC / WebFlux | RESTEasy / Quarkus REST |
| Persistência | Spring Data JPA | Panache (JPA simplificado) |
| Configuração | `application.properties` / YAML | `application.properties` |
| Testes | `@SpringBootTest` | `@QuarkusTest` |
| Build | Maven / Gradle | Maven / Gradle (com plugin Quarkus) |

---

## Módulo 2: Configurando o Ambiente

### Pré-requisitos

- **JDK 17+** (recomendado: 21 LTS)
- **Maven 3.9+** ou **Gradle 8+**
- **GraalVM** (opcional, para native image)
- **Docker** (opcional, para containers)
- **Quarkus CLI** (recomendado)

### Instalando a CLI do Quarkus

```bash
# Via SDKMAN (recomendado)
sdk install quarkus

# Via Homebrew (macOS/Linux)
brew install quarkusio/tap/quarkus

# Verificar instalação
quarkus --version
```

### Criando seu Primeiro Projeto

```bash
# Via CLI
quarkus create app com.exemplo:meu-projeto \
  --extension='rest,hibernate-orm-panache,jdbc-postgresql'

# Via Maven (equivalente ao Spring Initializr)
mvn io.quarkus.platform:quarkus-maven-plugin:3.8.0:create \
  -DprojectGroupId=com.exemplo \
  -DprojectArtifactId=meu-projeto \
  -Dextensions="rest,hibernate-orm-panache"
```

> 💡 **Equivalente Spring:** `quarkus create app` é o `spring init` do Quarkus. Você também pode usar o **code.quarkus.io** (equivalente ao start.spring.io).

### Estrutura do Projeto

```
meu-projeto/
├── src/
│   ├── main/
│   │   ├── java/com/exemplo/
│   │   │   └── GreetingResource.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── META-INF/resources/   ← arquivos estáticos
├── src/test/java/
└── pom.xml
```

### Rodando em Modo Dev

```bash
# Quarkus Dev Mode (equivalente ao Spring DevTools, mas muito mais rápido)
./mvnw quarkus:dev

# Com Quarkus CLI
quarkus dev
```

O **Dev Mode** oferece:
- Live reload ao salvar arquivos
- **Dev UI** em `http://localhost:8080/q/dev`
- Continuous Testing integrado

---

## Módulo 3: Injeção de Dependência (CDI)

### De @Autowired para @Inject

No Quarkus, a injeção de dependência é baseada em **CDI (Contexts and Dependency Injection)**, não no container Spring.

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

### Escopos CDI vs Escopos Spring

| Spring | CDI (Quarkus) | Descrição |
|---|---|---|
| `@Component` / `@Service` | `@ApplicationScoped` | Uma instância por aplicação |
| `@RequestScope` | `@RequestScoped` | Uma instância por request HTTP |
| `@SessionScope` | `@SessionScoped` | Uma instância por sessão |
| `@Prototype` | `@Dependent` | Nova instância a cada injeção |
| N/A | `@Singleton` | Singleton sem proxy CDI |

### Qualifiers (equivalente a @Qualifier do Spring)

**Spring:**
```java
@Autowired
@Qualifier("pagamentoCartao")
private PagamentoService pagamentoService;
```

**Quarkus:**
```java
// Definindo o qualifier
@Qualifier
@Retention(RUNTIME)
@Target({METHOD, FIELD, PARAMETER, TYPE})
public @interface Cartao {}

// Implementação
@Cartao
@ApplicationScoped
public class PagamentoCartaoService implements PagamentoService { ... }

// Injeção
@Inject
@Cartao
PagamentoService pagamentoService;
```

### @ConfigProperty (equivalente a @Value)

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

// Optional
@ConfigProperty(name = "app.feature-flag")
Optional<Boolean> featureFlag;
```

---

## Módulo 4: REST com Quarkus

### De @RestController para @Path

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
    public Produto criar(@RequestBody Produto produto) { ... }

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
    public Response criar(Produto produto) {
        // ...
        return Response.status(201).entity(produto).build();
    }

    @PUT
    @Path("/{id}")
    public Produto atualizar(@PathParam("id") Long id, 
                              Produto produto) { ... }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id) {
        // ...
        return Response.noContent().build();
    }
}
```

### Tratamento de Erros

**Spring:**
```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(NotFoundException ex) {
        return new ErrorResponse(ex.getMessage());
    }
}
```

**Quarkus:**
```java
@Provider
public class NotFoundExceptionMapper 
    implements ExceptionMapper<NotFoundException> {

    @Override
    public Response toResponse(NotFoundException ex) {
        return Response.status(404)
            .entity(new ErrorResponse(ex.getMessage()))
            .build();
    }
}
```

### Query Params e Headers

```java
@GET
@Path("/buscar")
public List<Produto> buscar(
    @QueryParam("nome") String nome,           // @RequestParam no Spring
    @QueryParam("pagina") @DefaultValue("0") int pagina,
    @HeaderParam("X-Tenant-Id") String tenantId  // @RequestHeader no Spring
) {
    return produtoService.buscar(nome, pagina, tenantId);
}
```

---

## Módulo 5: Persistência com Panache

### O que é Panache?

Panache é a camada de persistência do Quarkus que simplifica o uso de JPA/Hibernate. Oferece dois padrões:

1. **Active Record** — entidade com métodos de repositório embutidos
2. **Repository** — padrão tradicional (mais próximo do Spring Data)

### Padrão Active Record

```java
@Entity
public class Produto extends PanacheEntity {
    // PanacheEntity já fornece o campo 'id' automaticamente

    public String nome;
    public BigDecimal preco;
    public String categoria;

    // Métodos estáticos de consulta ficam na própria entidade
    public static List<Produto> findByCategoria(String categoria) {
        return list("categoria", categoria);
    }

    public static Optional<Produto> findByNome(String nome) {
        return find("nome", nome).firstResultOptional();
    }
}

// Uso no Resource:
List<Produto> produtos = Produto.listAll();
Produto.findByCategoria("eletronicos");
Produto.findById(1L);
Produto.count();
```

### Padrão Repository (mais próximo do Spring Data)

**Spring Data:**
```java
public interface ProdutoRepository 
    extends JpaRepository<Produto, Long> {

    List<Produto> findByCategoria(String categoria);
    Optional<Produto> findByNome(String nome);
}
```

**Quarkus Panache Repository:**
```java
@ApplicationScoped
public class ProdutoRepository 
    implements PanacheRepository<Produto> {

    public List<Produto> findByCategoria(String categoria) {
        return list("categoria", categoria);
    }

    public Optional<Produto> findByNome(String nome) {
        return find("nome", nome).firstResultOptional();
    }
}
```

### Queries com Panache

```java
// Queries simples
Produto.list("preco > ?1 and categoria = ?2", 100.0, "eletronicos");

// Queries nomeadas (equivalente ao @NamedQuery)
@Entity
@NamedQuery(name = "Produto.findAtivos",
            query = "FROM Produto WHERE ativo = true")
public class Produto extends PanacheEntity {
    ...
}
Produto.list("#Produto.findAtivos");

// Paginação
PanacheQuery<Produto> query = Produto.findAll();
List<Produto> pagina = query.page(Page.of(0, 10)).list();
```

### Transações

**Spring:**
```java
@Transactional
public void salvarProduto(Produto produto) {
    repository.save(produto);
}
```

**Quarkus:**
```java
@Transactional  // Mesmo que no Spring!
public void salvarProduto(Produto produto) {
    produto.persist();  // Active Record
    // ou: repository.persist(produto);  // Repository pattern
}
```

---

## Módulo 6: Configuração

### application.properties

```properties
# Servidor
quarkus.http.port=8080
quarkus.http.host=0.0.0.0

# Datasource (equivalente ao spring.datasource.*)
quarkus.datasource.db-kind=postgresql
quarkus.datasource.username=usuario
quarkus.datasource.password=senha
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/meubanco

# Hibernate
quarkus.hibernate-orm.database.generation=update
quarkus.hibernate-orm.log.sql=true

# Logs
quarkus.log.level=INFO
quarkus.log.category."com.exemplo".level=DEBUG

# CORS
quarkus.http.cors=true
quarkus.http.cors.origins=http://localhost:3000
```

### Perfis de Configuração

**Spring:** `application-dev.properties`, `application-prod.properties`

**Quarkus:** prefixo `%perfil.` no mesmo arquivo:

```properties
# Default (todos os perfis)
quarkus.datasource.db-kind=postgresql

# Apenas em DEV
%dev.quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/dev_db
%dev.quarkus.hibernate-orm.database.generation=drop-and-create
%dev.quarkus.log.level=DEBUG

# Apenas em PROD
%prod.quarkus.datasource.jdbc.url=${DATABASE_URL}
%prod.quarkus.hibernate-orm.database.generation=validate

# Apenas em TEST
%test.quarkus.datasource.jdbc.url=jdbc:h2:mem:testdb
```

Ativando perfis:
```bash
# Dev mode ativa automaticamente o perfil 'dev'
./mvnw quarkus:dev

# Especificando perfil
./mvnw quarkus:dev -Dquarkus.profile=staging

# Em produção
java -Dquarkus.profile=prod -jar quarkus-run.jar
```

---

## Módulo 7: Testes

### @QuarkusTest (equivalente ao @SpringBootTest)

**Spring:**
```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class ProdutoControllerTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void deveListarProdutos() {
        ResponseEntity<List<Produto>> response = 
            restTemplate.getForEntity("/api/produtos", ...);
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
        Produto produto = new Produto("Notebook", new BigDecimal("3000"));

        given()
            .contentType(ContentType.JSON)
            .body(produto)
            .when().post("/api/produtos")
            .then()
                .statusCode(201)
                .body("nome", equalTo("Notebook"));
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
@InjectMock
ProdutoService produtoService;

// Uso:
Mockito.when(produtoService.buscar(1L))
       .thenReturn(Optional.of(new Produto("Notebook")));
```

### Testando com Banco em Memória

```properties
# src/test/resources/application.properties
quarkus.datasource.db-kind=h2
quarkus.datasource.jdbc.url=jdbc:h2:mem:testdb
quarkus.hibernate-orm.database.generation=drop-and-create
```

---

## Módulo 8: Build e Deploy

### Build Padrão (JVM)

```bash
# Gera o jar em target/quarkus-app/
./mvnw package

# Executar
java -jar target/quarkus-app/quarkus-run.jar
```

### Native Image (GraalVM)

```bash
# Requer GraalVM instalado
./mvnw package -Pnative

# Ou via Docker (sem precisar instalar GraalVM localmente)
./mvnw package -Pnative -Dquarkus.native.container-build=true

# Executar o binário nativo
./target/meu-projeto-1.0.0-runner
```

### Docker

```bash
# Quarkus gera Dockerfiles automaticamente em src/main/docker/

# Build JVM
docker build -f src/main/docker/Dockerfile.jvm -t meu-projeto:jvm .

# Build Native
docker build -f src/main/docker/Dockerfile.native -t meu-projeto:native .

# Build com container (sem GraalVM local)
docker build -f src/main/docker/Dockerfile.native-micro -t meu-projeto:native .
```

### Variáveis de Ambiente

```bash
# Quarkus converte properties para env vars automaticamente
# quarkus.datasource.jdbc.url → QUARKUS_DATASOURCE_JDBC_URL

export QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://prod-db:5432/mydb
export QUARKUS_DATASOURCE_USERNAME=produser
java -jar quarkus-run.jar
```

---

## Módulo 9: Extensões Essenciais

### Principais Extensões e Equivalentes Spring

| Funcionalidade | Spring | Quarkus Extension |
|---|---|---|
| REST | spring-web | `quarkus-rest` |
| JPA | spring-data-jpa | `quarkus-hibernate-orm-panache` |
| PostgreSQL | postgresql driver | `quarkus-jdbc-postgresql` |
| Redis | spring-data-redis | `quarkus-redis-client` |
| Kafka | spring-kafka | `quarkus-messaging-kafka` |
| Segurança JWT | spring-security | `quarkus-smallrye-jwt` |
| OpenAPI | springdoc-openapi | `quarkus-smallrye-openapi` |
| Health Check | spring-actuator | `quarkus-smallrye-health` |
| Métricas | micrometer | `quarkus-micrometer` |
| Scheduler | @Scheduled | `quarkus-scheduler` |
| Cache | spring-cache | `quarkus-cache` |
| Validação | spring-validation | `quarkus-hibernate-validator` |

### Adicionando Extensões

```bash
# Via CLI
quarkus ext add hibernate-orm-panache jdbc-postgresql

# Via Maven
./mvnw quarkus:add-extension -Dextensions="hibernate-orm-panache,jdbc-postgresql"

# Listando extensões disponíveis
quarkus ext list
```

### Health Checks (equivalente ao Actuator)

```java
// Adicionar: quarkus-smallrye-health

@Liveness
@ApplicationScoped
public class DatabaseHealthCheck implements HealthCheck {

    @Override
    public HealthCheckResponse call() {
        // lógica de verificação
        return HealthCheckResponse.up("database");
    }
}

// Endpoints automáticos:
// GET /q/health       → todos os checks
// GET /q/health/live  → liveness
// GET /q/health/ready → readiness
```

---

## Módulo 10: Recursos para Continuar

### Documentação Oficial

- **Quarkus Guides:** https://quarkus.io/guides/
- **Code.quarkus.io:** https://code.quarkus.io (gerador de projetos)
- **Quarkus Cheat Sheet:** https://quarkus.io/resources/

### Próximos Passos Recomendados

1. ✅ Criar um CRUD completo com Panache
2. ✅ Configurar autenticação JWT com SmallRye
3. ✅ Integrar com Kafka usando Reactive Messaging
4. ✅ Gerar um native image e comparar o startup
5. ✅ Deploy no Kubernetes com Quarkus Kubernetes Extension

### Comparação de Performance

| Métrica | Spring Boot (JVM) | Quarkus (JVM) | Quarkus (Native) |
|---|---|---|---|
| Tempo de startup | ~3-5s | ~0.5-1s | ~0.01-0.05s |
| Memória RSS | ~300MB | ~150MB | ~30-50MB |
| Tamanho do artefato | ~20MB jar | ~15MB jar | ~80MB binário |
