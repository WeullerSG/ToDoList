# Deploy — ToDoList

## Endereços
- VM: `141.148.53.143` (Oracle Cloud, Ubuntu)
- API pública: `http://141.148.53.143:5000`
- Front (.env): `VITE_API_URL=http://141.148.53.143:5000`
- Projeto na VM: `/home/ubuntu/toDoList`
- Chave SSH: `C:\Users\Weuller\.ssh\oci-key2`

## Containers
| Nome | O que é | Porta |
|---|---|---|
| todo-api | API Flask | 5000:5000 |
| mariadb | Banco | rede appnet |

Rede Docker: `appnet` — a API acessa o banco por `DB_HOST=mariadb`.

## Atualizar o backend (o de sempre)

### 1. No PowerShell (PC)
    cd C:\Users\Weuller\Desktop\programacao\toDoList\toDoList
    scp -i C:\Users\Weuller\.ssh\oci-key2 app.py ubuntu@141.148.53.143:/home/ubuntu/toDoList/

### 2. No SSH (VM)
    ssh -i C:\Users\Weuller\.ssh\oci-key2 ubuntu@141.148.53.143
    docker restart todo-api
    docker logs todo-api --tail 20

Não precisa de `docker build` — o container tem volume montado
(`-v /home/ubuntu/toDoList:/app`), então ele lê o arquivo direto da VM.

## Quando PRECISA rebuildar
Só se mexer no `requirements.txt` ou no `Dockerfile`:

    cd /home/ubuntu/toDoList
    docker build -t todo-api .
    docker rm -f todo-api
    docker run -d --name todo-api -p 5000:5000 --network appnet \
      --env-file /home/ubuntu/toDoList/.env \
      -v /home/ubuntu/toDoList:/app \
      todo-api

Importante: rodar de dentro de `/home/ubuntu/toDoList`, senão não acha o Dockerfile.

## Rotas da API
| Método | URL |
|---|---|
| GET | `/api/list` |
| POST | `/api/list` |
| PUT | `/api/list/<id>` |
| DELETE | `/api/list/<id>` |

Campos do JSON: `name`, `descricao`, `criadoEm`, `status`
Colunas do banco: `nome`, `descricao`, `data_criacao`, `status`

## Diagnóstico rápido

    docker ps -a | grep todo-api                      # está de pé?
    docker logs todo-api --tail 30                    # o que quebrou
    docker exec todo-api python -c "from app import app; print(app.url_map)"   # rotas no ar
    curl -i http://localhost:5000/api/list            # testa de dentro da VM

## Erros já vistos e o que eram
| Erro | Causa |
|---|---|
| `ERR_UNSAFE_PORT` | Chrome bloqueia porta 6000 |
| `ERR_CONNECTION_TIMED_OUT` | porta fechada na Security List da OCI |
| `ERR_CONNECTION_REFUSED` | container caiu — ver `docker logs` |
| `405 Method Not Allowed` | URL não bate com a rota (id no path, não em `?id=`) |
| `Preflight ... not HTTP ok` | 404 no OPTIONS — rota não existe na imagem |
| `Can't connect to MySQL on localhost` | faltou `--env-file` |

## Pendências
- [ ] Fechar a porta 3306 (banco exposto na internet)
- [ ] Trocar a senha do MariaDB
- [ ] Subir o projeto pro GitHub com `.env` no `.gitignore`