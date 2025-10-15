# Ordenar Arrays de PHP

Una extensión simple y eficiente para Visual Studio Code que te permite ordenar arrays de PHP de forma alfabética con un solo comando.

---

## Características

* **Ordenamiento alfabético:** Ordena las claves de arrays asociativos de forma ascendente.
* **Manejo de arrays anidados:** Funciona correctamente con estructuras de arrays dentro de otros arrays.
* **Soporte para valores "crudos":** Mantiene intactas las variables, constantes, y llamadas a funciones (`$this->orders`, `true`, `null`).
* **Preserva la indentación:** El formato y la indentación del array original se mantienen.
* **Sencillo de usar:** Ordena tu array con un solo comando.

---

## Uso

1.  **Selecciona el array:** Resalta el array de PHP que deseas ordenar en tu editor. El array debe comenzar y terminar con `[...]`.
2.  **Abre la Paleta de Comandos:** Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en macOS).
3.  **Ejecuta el comando:** Escribe `Sort PHP Array` y selecciona el comando que aparece.

El array seleccionado se ordenará automáticamente en su lugar.

---

## Ejemplo

### Antes

```php
[
    'record_status' => $record_status,
	'data_view' => [
		'data' => $this->subtb_1->paymentsWithConsolidation($this->user_session->user_id, $record_status),
        'archived' => $this->tb->countArchived(['user_id' => $this->user_session->user_id]),
        'consolidations' => $this->tb->consolidationsWithOrders($this->user_session->user_id, $record_status),
		'actived' => $this->tb->countActived(['user_id' => $this->user_session->user_id])
    ]
]
```

### Después

```php
[
    'data_view' => [
        'actived' => $this->tb->countActived(['user_id' => $this->user_session->user_id]),
        'archived' => $this->tb->countArchived(['user_id' => $this->user_session->user_id]),
        'consolidations' => $this->tb->consolidationsWithOrders($this->user_session->user_id, $record_status),
        'data' => $this->subtb_1->paymentsWithConsolidation($this->user_session->user_id, $record_status)
    ],
    'record_status' => $record_status
]
```
---

## Instalación

* Abre Visual Studio Code.
* Ve a la vista de Extensiones `Ctrl+Shift+X`.
* Busca `Sort PHP Array`.
* Haz clic en **Instalar**.

---

## Contribuciones

Si encuentras un error o tienes una sugerencia, no dudes en abrir un "issue" o enviar un "pull request" en el repositorio de GitHub.

---

### Autor: **Lord Dark Dmonium**