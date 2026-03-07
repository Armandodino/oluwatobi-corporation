# Z.AI GLM-5 Migration Guide

> **Documentation Index**: https://docs.z.ai/llms.txt

## Introduction

Ce guide explique comment migrer vos appels de GLM-4.7, GLM-4.6, GLM-4.5 ou autres modèles antérieurs vers Z.AI GLM-5, notre modèle de codage le plus puissant à ce jour.

---

## GLM-5 Features

| Fonctionnalité | Description |
|----------------|-------------|
| **Contexte étendu** | Maximum 200K contexte, 128K sortie |
| **Streaming tool calls** | `tool_stream=true` - récupération en temps réel des paramètres |
| **Deep thinking** | `thinking={ type: "enabled" }` - réflexion approfondie |
| **Performance code** | Capacités de raisonnement avancées supérieures |

---

## Migration Checklist

- [ ] Mettre à jour l'identifiant du modèle vers `glm-5`
- [ ] Paramètres d'échantillonnage: `temperature` défaut `1.0`, `top_p` défaut `0.95`
- [ ] Deep thinking: Activer `thinking={ type: "enabled" }` si nécessaire
- [ ] Streaming response: Activer `stream=true` et gérer `delta.reasoning_content` et `delta.content`
- [ ] Streaming tool calls: Activer `stream=true` et `tool_stream=true`
- [ ] Maximum output/context: Définir `max_tokens` approprié
- [ ] Optimisation des prompts: Instructions plus claires avec deep thinking
- [ ] Tests de régression: Vérifier aléatoire, latence, complétude des paramètres

---

## Guide de Migration

### 1. Mettre à jour l'identifiant du modèle

```python
resp = client.chat.completions.create(
    model="glm-5",
    messages=[{"role": "user", "content": "Décrivez brièvement les avantages de GLM-5"}]
)
```

### 2. Mettre à jour les paramètres d'échantillonnage

- `temperature`: Contrôle le caractère aléatoire; valeurs élevées = plus divergent
- `top_p`: Contrôle l'échantillonnage nucléaire
- **Recommandation**: Ne pas ajuster les deux simultanément

```python
# Option A: Utiliser temperature (recommandé)
resp = client.chat.completions.create(
    model="glm-5",
    messages=[{"role": "user", "content": "Écrivez une introduction de marque créative"}],
    temperature=1.0
)

# Option B: Utiliser top_p
resp = client.chat.completions.create(
    model="glm-5",
    messages=[{"role": "user", "content": "Générez une documentation technique stable"}],
    top_p=0.8
)
```

### 3. Deep Thinking (Optionnel)

Recommandé pour les tâches de raisonnement complexe et de codage:

```python
resp = client.chat.completions.create(
    model="glm-5",
    messages=[{"role": "user", "content": "Concevez une architecture microservices trois tiers"}],
    thinking={"type": "enabled"}
)
```

### 4. Streaming Output et Tool Calls

GLM-5 supporte le streaming en temps réel pendant les appels d'outils:

```python
response = client.chat.completions.create(
    model="glm-5",
    messages=[{"role": "user", "content": "Quel temps fait-il à Paris"}],
    tools=[
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Obtenir les conditions météo actuelles pour un lieu donné",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string", "description": "Ville, ex: Paris, Lyon"},
                        "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
                    },
                    "required": ["location"]
                }
            }
        }
    ],
    stream=True,
    tool_stream=True,
)

# Variables de collecte streaming
reasoning_content = ""
content = ""
final_tool_calls = {}
reasoning_started = False
content_started = False

# Traiter la réponse streaming
for chunk in response:
    if not chunk.choices:
        continue

    delta = chunk.choices[0].delta

    # Output du processus de raisonnement streaming
    if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
        if not reasoning_started and delta.reasoning_content.strip():
            print("\n🧠 Processus de réflexion:")
            reasoning_started = True
        reasoning_content += delta.reasoning_content
        print(delta.reasoning_content, end="", flush=True)

    # Output du contenu de réponse streaming
    if hasattr(delta, 'content') and delta.content:
        if not content_started and delta.content.strip():
            print("\n\n💬 Contenu de la réponse:")
            content_started = True
        content += delta.content
        print(delta.content, end="", flush=True)

    # Informations d'appel d'outil streaming (concaténation des paramètres)
    if delta.tool_calls:
        for tool_call in delta.tool_calls:
            idx = tool_call.index
            if idx not in final_tool_calls:
                final_tool_calls[idx] = tool_call
                final_tool_calls[idx].function.arguments = tool_call.function.arguments
            else:
                final_tool_calls[idx].function.arguments += tool_call.function.arguments

# Output final des appels d'outil
if final_tool_calls:
    print("\n📋 Appels de fonction déclenchés:")
    for idx, tool_call in final_tool_calls.items():
        print(f"  {idx}: Fonction: {tool_call.function.name}, Paramètres: {tool_call.function.arguments}")
```

---

## 5. Tests et Régression

Vérifier dans l'environnement de développement:

| Point de vérification | Description |
|----------------------|-------------|
| **Qualité des réponses** | Pas d'aléatoire excessif ou de conservatisme |
| **Tool streaming** | Construction et output fonctionnent normalement |
| **Latence et coût** | Scénarios long context et deep thinking |

---

## Ressources

| Ressource | Lien |
|-----------|------|
| **Paramètres de concept** | https://docs.z.ai/guides/overview/concept-param |
| **Tool Streaming Output** | https://docs.z.ai/guides/tools/stream-tool |
| **API Reference** | https://docs.z.ai/api-reference/introduction |
| **Support technique** | https://z.ai/consultation |

---

## Configuration pour Google Antigravity

### Endpoint API
```
https://open.bigmodel.cn/api/paas/v4/chat/completions
```

### Exemple de configuration MCP

```json
{
  "mcpServers": {
    "z-ai": {
      "command": "npx",
      "args": ["-y", "@z-ai/mcp-server"],
      "env": {
        "Z_AI_API_KEY": "votre_cle_api",
        "Z_AI_MODEL": "glm-5"
      }
    }
  }
}
```

### Obtenir une clé API

1. Visitez https://open.bigmodel.cn/
2. Créez un compte ou connectez-vous
3. Allez dans "API Keys"
4. Générez une nouvelle clé API
5. Utilisez cette clé dans votre configuration

---

## Résumé des paramètres GLM-5

| Paramètre | Valeur par défaut | Maximum |
|-----------|------------------|---------|
| `model` | glm-5 | - |
| `temperature` | 1.0 | 2.0 |
| `top_p` | 0.95 | 1.0 |
| `max_tokens` | - | 128K |
| `context` | - | 200K |
| `stream` | false | true |
| `tool_stream` | false | true |
| `thinking.type` | disabled | enabled |

---

> **Note**: Cette documentation est préparée pour l'intégration dans Google Antigravity. Pour plus d'informations, consultez https://docs.z.ai/
