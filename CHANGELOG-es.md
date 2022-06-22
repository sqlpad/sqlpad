# Registro de cambios

## \[6.11.1] - 2022-06-07

*   Elimine la contraseña de conexión de la API de lista de conexiones. Esto coincide con el comportamiento para los detalles de conexión.
*   Actualizar dependencias

## \[6.11.0] - 2022-04-12

*   Agregar anulación de filas máximas para los controladores ODBC, Athena, MySQL, Postgres, Snowflake y SQL Server

## \[6.10.1] - 2022-03-13

*   Funcionalidad de plantilla de conexión segura.
    Esto restringe los valores de la plantilla de conexión a los campos en el objeto de usuario, evitando el uso de JavaScript arbitrario, ya que podría aprovecharse para el abuso. (Esta funcionalidad estaba, y sigue estando, solo disponible para `admin` cuentas.)

## \[6.10.0] - 2022-03-11

*   Agregar configuración de tiempo de espera de consulta postgres
*   Añadir configuración de rol predeterminada para Google Auth
*   Actualizar dependencias

## \[6.9.0] - 2022-02-05

*   Agregar opciones de configuración de seguridad de cookies
*   Limitar las conexiones enumeradas en función del acceso de los usuarios
*   Agregar administración de roles basada en SAML
*   Postgres: Agregar tablas externas al esquema
*   Athena: Arreglar la configuración de la región de athena
*   Athena: Agregar esquema de lectura de soporte desde pegamento
*   MySQL: Permitir base64 para SSL
*   Corregir migraciones para que sean seguras para MySQL 5.7
*   Actualizar dependencias

## \[6.8.1] - 2021-09-05

*   Evitar la divulgación del secreto de Google OAuth
*   Arreglar el soporte de consulta de drop/create table de Athena

## \[6.8.0] - 2021-08-31

*   Agregar soporte para cadenas de fecha 0000-00-00 en MySQL
*   Agregar descripciones de columnas de MySQL
*   Agregar compatibilidad con AWS Athena
*   Agregar compatibilidad con consultas cancelables a la conexión de AWS Athena
*   Agregar compatibilidad con Azure AD a la autenticación OIDC
*   Permitir que se asigne un rol a través del rol de usuario OIDC
*   Agregar compatibilidad con ODBC al contenedor docker (consulte `docker-examples/oracle-odbc-image` por ejemplo)
*   Representar hipervínculos de rebaja en columnas de resultados de consulta
*   Ordenar esquema y tabla por nombre
*   Búsqueda de esquemas polacos y comportamientos expandidos predeterminados
*   Agregar compresión a la carga útil de la ruta del esquema
*   Corregir el historial de búsqueda
*   Arreglar redireccionamientos ilegales de OIDC
*   Arreglar `/api/batches` Respuesta prohibida al usar la clave de API

## \[6.7.1] - 2021-06-15

*   Agregar soporte HTTPS de Trino
*   Corregir la autenticación de ClickHouse
*   Corregir formulario de edición de conexión
*   Actualizar dependencias

## \[6.7.0] - 2021-06-15

*Versión incompleta. Utilice 6.7.1 en su lugar.*

## \[6.6.0] - 2021-04-09

*   Agregar autenticación Presto y compatibilidad con HTTPS
*   Corregir consultas de ClickHouse que comienzan con comentarios
*   Actualizar las dependencias de nodos y paquetes de Dockerfile

## \[6.5.0] - 2021-03-18

*   Agregar cajón lateral del historial de ejecución de consultas
*   Agregar soporte para ClickHouse `LIMIT <offset_number>,<limit_number>` sintaxis

## \[6.4.3] - 2021-03-14

*   Botón de descarga de gráficos fijos
*   Corrección de la compilación 6.4.2

## \[6.4.2] - 2021-03-12

**ROTO** - Configuración de desarrollo de la interfaz de usuario incluida en la compilación de producción, rompiendo la interfaz de usuario.

## \[6.4.1] - 2021-03-13

*   Corregir estilo modal/dialog

## \[6.4.0] - 2021-03-11

*   Añadir soporte de Trino
*   Mejore la autenticación OIDC, admitiendo el descubrimiento de URL de punto final cuando solo se proporciona `SQLPAD_OIDC_ISSUER` Extremo.
*   Mostrar el nombre de la conexión si el usuario es el rol de editor y solo existe una única conexión.
*   Agregue el menú contextual a la celda de resultados de la consulta que permite copiar y ampliar la visualización del valor de la celda.
*   Arreglar el soporte de ClickHouse para las versiones de ClickHouse anteriores a la 20.7
*   Corregir valores de objeto y fecha en la exportación CSV y XLSX

## \[6.3.0] - 2021-03-08

*   Postgres: Agregar compatibilidad con certificados autofirmados
*   Actualizar la búsqueda de consultas para que no distinga entre mayúsculas y minúsculas
*   Evitar la navegación accidental hacia atrás al desplazarse por los resultados de la consulta
*   Corregir la visualización de resultados de consultas en Safari
*   Actualizar dependencias

## \[6.2.1] - 2021-02-09

*   Reducir lo desconocido `SQLPAD_*` Error de la variable de entorno al advertir

## \[6.2.0] - 2021-02-07

*   Agregar el estado de la consulta al historial de consultas
*   Ignorar `SQLPAD_SERVICE_` env vars durante la comprobación desconocida de env var
*   BigQuery: use wrapIntegers para evitar el truncamiento int64
*   Corregir la carga del esquema para una única conexión predeterminada
*   Actualizar dependencias

## \[6.1.2] - 2020-12-03

*   Corrija la autenticación LDAP para perfiles sin atributo de correo. Usuarios de SQLPad `email` ahora es anulable.
*   Corregir la copia de elementos de esquema en el portapapeles para entornos que no son HTTPS
*   Corregir la autenticación del controlador ClicHouse para la última versión de ClickHouse
*   Uso `cancelled` estado de las instrucciones después de un error de instrucción en el lote de varias instrucciones. (Estos anteriormente estaban atrapados en `queued` estado.)
*   Devuelva 404 para los resultados de la instrucción sin terminar. La API de resultados de la instrucción solo está diseñada para usarse una vez que se obtiene una instrucción `finished`.

## \[6.1.1] - 2020-11-29

*   Corregir el relleno de valores de cuadrícula de resultados de consulta

## \[6.1.0] - 2020-11-28

Varias mejoras para admitir la visualización de contenido multilínea en los resultados de las consultas.

*   Las celdas de valor de texto representan saltos de línea. La altura de la fila se aumenta para acomodar el valor de columna con la mayoría de las líneas.
*   JSON y otros valores de objeto son JSON bonitos impresos para la representación multilínea.
*   Si se devuelve una sola columna, el ancho de columna inicial utilizará el ancho completo del área de resultados.
*   Cambia la familia de fuentes de cuadrícula a monoespacio
*   Agrega sombra para indicar el desbordamiento de texto

## \[6.0.2] - 2020-11-28

*   Agregar registro de seguimiento LDAP
*   Agregar comprobación de enlace LDAP al inicio si está habilitada

## \[6.0.1] - 2020-11-26

*   Corregir el texto de consulta que falta en el historial de consultas
*   Corregir el título de la página obsoleta al iniciar sesión

## \[6.0.0] - 2020-11-22

Esta versión elimina la funcionalidad obsoleta y cambia algunos comportamientos predeterminados, lo que requiere un aumento de la versión principal. Sin embargo, también hay algunas mejoras notables.

### Actualización a 6.0.0

La actualización a la versión 6 requiere que las instancias de SQLPad existentes se ejecuten en una versión 5.x.x. Si se detecta la versión 4 o anterior, se cancelará el inicio y la migración.

Para actualizar, instalar y ejecutar a través de su método preferido. La versión 6 no tiene migraciones de datos que no sean una migración ficticia para servir como marcador de versión. Si desea volver a 5.x.x, *deber* ser capaz de ejecutar 5.8.4 en una base de datos 6.0.0.

Sin embargo, se recomienda realizar copias de seguridad de bases de datos. Siga las buenas prácticas si su uso de SQLPad lo justifica.

### Barra lateral de configuración de visualización

La configuración de visualización se ha movido a una barra lateral a la derecha. El botón de gráfico existente alterna su visibilidad.

<img src="https://user-images.githubusercontent.com/303966/99915755-32f78e80-2ccb-11eb-9f74-b18846d6108d.png" width="1000" alt="visualization sidebar">

### Múltiples conjuntos de resultados

Se ha agregado compatibilidad con varios conjuntos de resultados a la interfaz de usuario. Al ejecutar varias instrucciones SQL a la vez, se mostrará una tabla de resumen con el estado de cada instrucción SQL. La ejecución de instrucciones individuales funciona como antes.

Tenga en cuenta que la visualización de consultas está bloqueada en la última instrucción SQL de un lote.

<img src="https://user-images.githubusercontent.com/303966/99915844-ca5ce180-2ccb-11eb-8277-08f8b33c6eea.png" alt="multiple results running">

<img src="https://user-images.githubusercontent.com/303966/99915855-e1033880-2ccb-11eb-8169-52590bec6957.png" alt="multiple results error">

<img src="https://user-images.githubusercontent.com/303966/99917088-aef5d480-2cd3-11eb-8d90-32bddf3f927e.png" alt="multiple results statement drill down">

### Diálogo de consulta y mejoras para compartir

El nombre de la consulta, las etiquetas y el uso compartido se han movido a un cuadro de diálogo, que aparece en el guardado inicial o en el nombre de la consulta en la barra de herramientas. Se ha mejorado el uso compartido de consultas, lo que permite que las consultas se compartan con usuarios individuales y limitar su capacidad para guardar los cambios en la consulta.

<img src="https://user-images.githubusercontent.com/303966/99915798-6cc89500-2ccb-11eb-9fec-d2b50c5c1fd2.png" width="400" alt="query dialog and sharing enhancements">

### Menú contextual del esquema

Se ha añadido un menú contextual a la barra lateral del esquema. Al hacer clic con el botón secundario en esquemas, tablas y columnas, se mostrará un menú con valores que se pueden copiar en el portapapeles.

<img src="https://user-images.githubusercontent.com/303966/99920524-cb047080-2ce9-11eb-8833-7e60bfe9f7c3.png" width="300" alt="schema context menu">

### Cuadro de diálogo Perfil de usuario

Los usuarios ahora pueden proporcionar un nombre y cambiar su correo electrónico, así como contraseña, si la autenticación local está habilitada.

<img src="https://user-images.githubusercontent.com/303966/99915807-7e11a180-2ccb-11eb-98ce-0db2a0e61ee7.png" width="400" alt="user profile dialog">

### Comprobación estricta de la configuración

Cualquier conjunto de variables de entorno a partir de `SQLPAD_` que no son conocidos por SQLPad generarán un error e impedirán que SQLPad se inicie. Esto debería ayudar a detectar problemas de configuración temprano.

### Cambios de última hora

*   Elimina los correos electrónicos de restablecimiento de contraseña de la interfaz de usuario. Las URL de restablecimiento de contraseña aún se pueden generar en la interfaz de usuario a través de una cuenta de administrador
*   Elimina el webhook de Slack. Usa webhooks genéricos para construir los tuyos propios.
*   Quita variables de configuración obsoletas
*   Elimina la compatibilidad con archivos de configuración .json y .ini
*   Elimina el registro de administrador abierto. `SQLPAD_ADMIN` debe usarse para la cuenta inicial o el registro automático debe habilitarse cuando se utiliza una estrategia de autenticación compatible.
*   Reduce el límite de filas de resultados de consultas predeterminados a 10.000 (anteriormente 50.000)
*   El proceso del servidor se cierra con un error de configuración o una clave de configuración desconocida

### Mantenimiento, correcciones y UX

*   Agrega un cuadro de diálogo query-not-found, solicitando al usuario que inicie una nueva consulta.
*   Simplifica la lista de consultas (si hay demasiado problema abierto)
*   Aumenta el tamaño de fuente del editor SQL a 14
*   Corrige la entrada de etiqueta dejando un valor no seleccionado en la entrada
*   Corrige clones/nuevas URL que no cambian como se esperaba
*   Corrige la reutilización de clientes de conexión en el cambio de consulta (consulte el problema n.º 806)
*   Actualiza las dependencias

## \[5.8.4] - 2020-11-04

*   Asegúrese de que el valor de configuración del puerto se maneja como número

## \[5.8.3] - 2020-11-04

*etiquetado accidentalmente sin cambios*

## \[5.8.2] - 2020-10-30

*   Corregir la sincronización de roles LDAP. Si se configuran filtros de rol LDAP, la sincronización de roles se puede alternar por usuario en los formularios de usuario. De forma predeterminada, los usuarios creados automáticamente tendrán roles sincronizados. Los usuarios agregados manualmente no lo harán.
*   Actualizar dependencias
*   Corregir la condición de carrera (UI) del latido del corazón del cliente de conexión

## \[5.8.1] - 2020-10-23

*   Corregir el filtro de búsqueda de roles del editor LDAP
*   Permitir vacío/`denied` valor para `SQLPAD_LDAP_DEFAULT_ROLE` para denegar usuarios que no coinciden con los filtros de rol LDAP. Ver [Documentación ldap](http://getsqlpad.com/#/authentication?id=ldap-experimental) para más información.

## \[5.8.0] - 2020-10-22

*   Agregar registro automático LDAP y asignación dinámica de roles basada en la búsqueda LDAP
*   Corrección: Permitir autenticación LDAP sin autenticación local/userpass habilitada
*   Actualizar dependencias

## \[5.7.0] - 2020-10-19

*   Agregar soporte para Apache Pinot
*   Mejorar el autocompletado del editor SQL

## \[5.6.0] - 2020-09-04

*   Corregir la visualización del error Presto/ClickHouse
*   Mostrar números de línea en el editor SQL
*   Actualizar dependencias

## \[5.5.1] - 2020-08-07

*   Falta la corrección `top` adición de estrategia en 5.5.0

## \[5.5.0] - 2020-08-07

*   Agregar `top` estrategia de límite para conexiones ODBC
*   Corregir que el editor de SQL no borra en la nueva consulta
*   Actualizar dependencias

## \[5.4.0] - 2020-08-03

*   Agregue un almacén de resultados de consulta configurable (memoria, base de datos y redis ahora una opción). Ver `SQLPAD_QUERY_RESULT_STORE` debajo [configuración](https://getsqlpad.com/#/configuration) Docs.
*   Actualice las conexiones MySQL para usar el indicador INTERACTIVE para evitar el cierre temprano de la conexión.

## \[5.3.0] - 2020-07-31

*   Envalentonar los encabezados de columna de resultados
*   Agregue un almacén de sesiones configurable (memoria, base de datos y redis ahora una opción). Ver `SQLPAD_SESSION_STORE` debajo [configuración](https://getsqlpad.com/#/configuration) Docs.
*   Actualizar dependencias del servidor

## \[5.2.1] - 2020-07-27

*   Arreglar el soporte de transacciones de MySQL2
*   Corregir los resultados de consultas antiguas que potencialmente sobrescriben los resultados de nuevas consultas cuando se utilizan transacciones de varios estados de cuenta

## \[5.2.0] - 2020-07-20

Esta versión presenta nuevos webhooks genéricos para una variedad de eventos, al tiempo que deja de usar implementaciones de comunicación específicas (correo electrónico SMTP y Slack). Con webhooks, depende de usted implementar la comunicación con sus usuarios de SQLPad.

Los webhooks agregados admiten un mayor número de eventos que los que se manejaban anteriormente, como las consultas que se ejecutan y los resultados/errores recibidos de esas consultas.

*   Añadir webhooks [documentación](http://getsqlpad.com/#/webhooks)
*   Desusar el correo electrónico SMTP y el webhook de Slack, ambos para eliminarlos en v6.
*   Mensaje de error de captura de base de datos en el error de conexión del controlador ODBC
*   Mostrar la interfaz de usuario del token de servicio solo si está habilitada mediante configuración (#787)
*   CrateDB: proporcione campos separados de usuario, contraseña y SSL (#793)
*   Corregir la compatibilidad con cadenas multilínea en `sql-limiter`
*   Corregir restricción de expresión regular en `sql-limiter`

## \[5.1.0] - 2020-07-10

*   Agregar compatibilidad con la autenticación de OpenID Connect
*   Agregar compatibilidad con archivos de configuración .env
*   Corregir el administrador deshabilitado en la carga inicial de SQLPad cuando se usan consultas iniciales
*   Dejar de usar la compatibilidad con archivos de configuración INI y JSON
*   Variables de entorno renombradas para una mejor consistencia. El nombre antiguo está en desuso:
    *   `GOOGLE_CLIENT_ID` ➡ `SQLPAD_GOOGLE_CLIENT_ID`
    *   `GOOGLE_CLIENT_SECRET` ➡ `SQLPAD_GOOGLE_CLIENT_SECRET`
    *   `DISABLE_AUTH` ➡ `SQLPAD_AUTH_DISABLED`
    *   `SQLPAD_DISABLE_AUTH_DEFAULT_ROLE` ➡ `SQLPAD_AUTH_DISABLED_DEFAULT_ROLE`
    *   `DISABLE_USERPASS_AUTH` ➡ `SQLPAD_USERPASS_AUTH_DISABLED`
    *   `ENABLE_LDAP_AUTH` ➡ `SQLPAD_LDAP_AUTH_ENABLED`
    *   `LDAP_URL` ➡ `SQLPAD_LDAP_URL`
    *   `LDAP_BASE_DN` ➡ `SQLPAD_LDAP_BASE_DN`
    *   `LDAP_USERNAME` ➡ `SQLPAD_LDAP_USERNAME`
    *   `LDAP_PASSWORD` ➡ `SQLPAD_LDAP_PASSWORD`
    *   `CERT_PATH` ➡ `SQLPAD_HTTPS_CERT_PATH`
    *   `CERT_PASSPHRASE` ➡ `SQLPAD_HTTPS_CERT_PASSPHRASE`
    *   `KEY_PATH` ➡ `SQLPAD_HTTPS_KEY_PATH`
    *   `SERVICE_TOKEN_SECRET` ➡ `SQLPAD_SERVICE_TOKEN_SECRET`

## \[5.0.0] - 2020-07-03

La versión 5 contiene muchos cambios en la infraestructura y la API, así como migraciones que no son fáciles de revertir. Es muy recomendable realizar una copia de seguridad de su base de datos (`SQLPAD_DB_PATH` y/o su base de datos backend en uso).

Esta versión finaliza la migración de una base de datos JSON incrustada a un ORM y SQLite (utilizado de forma predeterminada). Para las nuevas instancias de SQLPad, se pueden utilizar las siguientes bases de datos back-end alternativas: SQL Server, MySQL, MariaDB o PostgreSQL a través de `SQLPAD_BACKEND_DB_URI`.

Proporcionar un valor para `SQLPAD_DB_PATH`/`dbPath` sigue siendo necesario, ya que el sistema de archivos se sigue utilizando para las sesiones y el almacenamiento de los resultados de las consultas. Este requisito se eliminará en una versión posterior de la versión 5.x.

Las migraciones se ejecutarán en el inicio de SQLPad. Para deshabilitar este comportamiento, establezca `SQLPAD_DB_AUTOMIGRATE` Para `false`. Las migraciones se pueden ejecutar manualmente a través de `node server.js --config path/to/file.ext --migrate`. Cuando se utiliza `--migrate` el proceso saldrá después de aplicar las migraciones.

¡Un agradecimiento especial a @eladeyal-intel, @bruth, @yorek, @dengc367, @murphyke y @Wizhi, por todas sus contribuciones en este lanzamiento!

### Mejoras

*   Descripciones de columnas añadidas para Google BigQuery

*   Se ha añadido el controlador mySQL 2

*   Agregar controlador Redshift

*   Agregar controlador ClickHouse

*   Agregar autenticación de ActiveDirectory

*   Opción de declaración de transacción múltiple disponible para los controladores MySQL/MySQL 2

*   Menú desplegable de conexión oculto si el usuario no es administrador y solo existe 1 conexión

*   La conexión se puede preseleccionar a través del parámetro de consulta de URL `connectionId` o `connectionName`

*   Agregar rol predeterminado al deshabilitar la autenticación (`SQLPAD_DISABLE_AUTH_DEFAULT_ROLE`). `editor` se utiliza de forma predeterminada.

*   Los usuarios pueden estar habilitados/deshabilitados para restringir el acceso (alternativa a la eliminación)

*   Las migraciones se pueden ejecutar por sí solas utilizando `--migration`

*   La automigración puede estar deshabilitada con `SQLPAD_DB_AUTOMIGRATE`

*   Filtrado y paginación del lado del servidor agregados para `queries` API

*   ODBC: estrategias de límite agregadas para configurar el método utilizado para aplicar límites de filas de consulta

*   Error de conexión de prueba mostrado

*   Nuevo `/batches` API para ejecutar SQL de varias instrucciones. Esto reemplaza `/query-result` API, y está escrito en un enfoque más RESTful, eliminando la necesidad de extender los tiempos de espera de SQLPad. Ver [Documentos de API](http://getsqlpad.com/#/api-batches) para más información.

*   Agrega `allowedDomains` Elemento de configuración y obsoleto `whitelistedDomains` que se eliminará en la v6.

### Ruptura

*   Solo los administradores pueden ver todo el historial de consultas

*   `denyMultipleStatements` opción de conexión eliminada. Ahora se intenta admitir varias instrucciones en el nivel de API REST de SQLPad a través de `batches` y `statements` API.

*   `/download-results/` La API se ha eliminado en favor de `/statement-results/`, que es similar pero basado en `statementId` En lugar de `cacheKey`. Ver [Documentos de API](http://getsqlpad.com/#/api-batches) para más información.

*   `debug` se ha eliminado la opción de configuración. Uso `appLogLevel` establecer en `debug` en lugar de.

*   `tableChartLinksRequireAuth` se ha eliminado la opción de configuración.

    Todos los enlaces de tabla/gráfico requieren autenticación en el futuro. Si es necesario el acceso no autenticado a estas direcciones URL, compruebe si se puede usar una solución de autenticación alternativa para proporcionar autenticación pasiva según sea necesario (como el proxy de autenticación, por ejemplo).

*   cambios en el modelo de datos:

    *   `createdDate` se ha cambiado el nombre de los campos a `createdAt` (`created_at` en la tabla)
    *   `modifiedDate` se ha cambiado el nombre de los campos a `updatedAt` (`updated_at` en la tabla)
    *   `user.signupDate` renombrado a `user.signupAt` (`signup_at` en la tabla)
    *   `query.modifiedBy` renombrado a `query.updatedBy` (`updated_by` en la tabla)
    *   `query.createdBy` y `query.updatedBy` ahora mantenga la identificación de usuario en lugar de la dirección de correo electrónico del usuario.
    *   `query.lastAccessDate` se elimina. No fue diferente de `updatedAt`
    *   Los campos específicos del controlador de conexión se han movido a `connection.data`. Los campos todavía están decorados en la base del objeto de conexión para mayor compatibilidad.
    *   `cache` La tabla ha cambiado para usar `id` En lugar de `cacheKey`.
    *   `cache.expiration` ha cambiado el nombre a `cache.expiryDate` para la coherencia con otros modelos
    *   `cache.queryName` ha cambiado el nombre a `cache.name` para un uso más genérico
    *   `cache.schema` se ha cambiado el nombre a `cache.data` y almacena JSON sin procesar para uso genérico

*   El filtro Regex para el historial de consultas ya no es compatible

*   Se asumirá que el archivo de configuración sin una extensión .json o .ini es JSON. Se requerirán extensiones específicas en una versión futura.

*   El archivo de configuración que no existe generará un error en el inicio en lugar de ignorarlo silenciosamente.

## \[4.4.0] - 2020-04-22

*   Agrega la capacidad de establecer la conexión predeterminada inicial a través de la configuración `defaultConnectionId`. (Solo para carga inicial. A continuación, las conexiones de usuario se almacenan en caché localmente)
*   Cambia el filtro de lista de consultas predeterminado a "todas las consultas" en lugar de "mis consultas".
*   La barra lateral del esquema predeterminada se abre y quita el almacenamiento en caché local de la selección de alternancia.
*   Corrige el autocompletado que falta cuando la barra lateral del esquema está oculta en la carga.
*   Actualiza las dependencias

## \[4.3.0] - 2020-04-16

*   Admite múltiples conjuntos de datos en la conexión de BigQuery
*   Corregir la división de sql para cadenas que contienen `;`

## \[4.2.0] - 2020-04-06

### Funciones

*   Añadir soporte de Google BigQuery [documentación](https://getsqlpad.com/#/connections?id=bigquery)

*   Agregar compatibilidad con SQLite [documentación](https://getsqlpad.com/#/connections?id=sqlite)

*   Agrega compatibilidad con consultas por lotes a ODBC (la última instrucción se muestra en la interfaz de usuario)

*   Autenticación: Agregar opción para deshabilitar la autenticación. [documentación](https://getsqlpad.com/#/authentication?id=no-authentication)

    Cuando la autenticación está deshabilitada, la aplicación ya no requiere autenticación.

*   Autenticación: agregue compatibilidad con autenticación de proxy. [documentación](https://getsqlpad.com/#/authentication?id=auth-proxy)

*   Agregar modelo de consulta privado/compartido.

    En el futuro, las consultas son *privado* por defecto. Cuando el uso compartido está habilitado, la consulta se comparte con todos los usuarios (y se les otorgan permisos de escritura). Acceso más fino que se agregará en el futuro (compartir con un usuario específico, leer vs escribir)

*   Agregar compatibilidad con datos de semilla de conexión y consulta [documentación](https://getsqlpad.com/#/seed-data)

*   Agregar tokens de servicio (tokens de API). La nueva opción de menú está disponible cuando se inicia sesión como administrador.

*   Agregar encabezado de aplicación para la administración a nivel de aplicación

*   Agrega compatibilidad con transacciones de instrucciones múltiples para Postgres, SQLite y ODBC. [documentación](https://getsqlpad.com/#/connections?id=multi-statement-transaction-support)

*   Agregue la obsolescencia de configuración para las siguientes claves: `debug`, `tableChartLinksRequireAuth`, `keyPath`, `certPath`, `certPassphrase`

*   Agregar compatibilidad con plantillas de conexión [documentación](https://getsqlpad.com/#/connection-templates)

*   Agrega registro de ejecución de consultas adicional para las consultas ejecutadas y los detalles que las rodean (registrado en `info` nivel)

### Fija

*   Corrección: pantalla de formulario de conexión larga para mostrar siempre los botones de guardar / probar

*   Usar marcas de tiempo ISO 8601 para mensajes de registro en lugar de la época unix

### Actualizaciones de mantenimiento / Miscelánea / Desarrollo

*   Dependencias actualizadas
*   Se introdujo SQLite como almacén de respaldo. Los datos nedb (base de datos incrustada actualmente en uso) eventualmente se migrarán a SQLite.
*   Se ha agregado un marco de migración. Las migraciones se ejecutan al iniciar el servidor.
*   Se ha añadido una compilación de etapas múltiples
*   Mucha refactorización para organizar mejor la autenticación, adición de nuevas características.

## \[4.1.1] - 2020-03-10

*   Corregir autenticación para direcciones de correo electrónico que contienen `+` y citado `@` Caracteres

## \[4.1.0] - 2020-02-25

### Funciones

*   Agregar controlador/soporte de Snowflake (#519)

*   Agregar la opción de intención readOnly de MS SQL Server (#520)

*   Agregar registro usando pino (#527, #547)

    SQLPad ahora registra mensajes json en stdout usando el [pino](http://getpino.io/#/) biblioteca. La cantidad de registro se puede controlar configurando `appLogLevel` y `webLogLevel` para registros de aplicaciones y web respectivamente. Pino no gestiona el transporte de troncos, pero tiene un ecosistema de herramientas disponibles que http://getpino.io/#/docs/transports.

*   Permitir datos de usuario dinámicos en la configuración de conexión (#544)

    Las conexiones pueden tener valores de usuario sustituidos dinámicamente en valores de configuración de conexión que contengan valores de texto. Este es un trabajo en progreso y se puede utilizar para aventureros. Consulte PR para obtener más detalles, de lo contrario, más información y la interfaz de usuario correspondiente vendrán con futuras versiones.

*   Agregar compilaciones de la versión de GitHub a través de la canalización de compilación (#550)

*   Agregar `dbInMemory` ajuste (#553)

    `dbInMemory` ejecutará la base de datos SQLPad incrustada en la memoria sin iniciar sesión en el disco. Habilitar esto no elimina la necesidad de `dbPath` en este momento, ya que el acceso al sistema de archivos sigue siendo necesario para las cachés de resultados y la compatibilidad con sesiones exprés. (`dbPath` para convertirse en opcional en futuras versiones)

### Fija

*   Fix TypeError: No sé cómo serializar un BigInt (#522)
*   Corregir pruebas para zonas horarias que no son UTC (#524)

### Mantenimiento

*   Actualizar dependencias del servidor (#525)
*   Mantenimiento y refactorización (#534, #535, #538, #539, #540, #541, #542, #543, #545, #551, #552, #553)

## \[4.0.0] - 2020-01-18

### Cambios de última hora

*   Se requiere el nodo 12 o posterior

### Funciones

*   Agregar la capacidad de restringir las conexiones a usuarios específicos (#502)
*   Combinar varios conjuntos de resultados de instrucciones para postgres en 1 conjunto de resultados (#510)
*   Agregar opciones de instrucciones previas a la consulta al controlador MySQL (#511)
*   Agregar historial de ejecución de consultas (#512)
*   Agregar opciones de instrucciones previas a la consulta al controlador MySQL (#515)
*   Actualizar la dependencia odbc a v2

## \[3.5.3] - 2019-12-30

*   Revertir el script de compilación para usar sh

## \[3.5.2] - 2019-12-30

*   Corregir contraseña de administrador de env var
*   Corregir el error de resultado de fila cero de mysql
*   Corregir la actualización de la página de envío de formularios de usuario y conexión en Firefox
*   Solucionar problemas de altura de la barra lateral del esquema en Safari/Chrome
*   Establecer el script de compilación para usar bash en lugar de sh
*   Deje que los errores de desciframiento de nombre de usuario / contraseña de conexión aumenten

## \[3.5.1] - 2019-12-13

*   Agregado soporte para autenticación a Cassandra
*   Agregado soporte SSL para MySQL/MariaDB
*   Se agregaron descargas de resultados de consultas JSON junto con XSLX y CSV

## \[3.5.0] - 2019-11-29

*   Agregar formato de descarga json para el resultado de la consulta
*   Corregir el uso de la configuración de SQLPAD_ADMIN_PASSWORD

## \[3.4.0] - 2019-11-10

*   Agregar `sqlserverMultiSubnetFailover` opción para SQL Server

## \[3.3.0] - 2019-11-08

*   Agregar `SQLPAD_TIMEOUT_SECONDS` config para establecer el tiempo de espera del servidor http. Útil para admitir consultas de larga duración.

## \[3.2.1] - 2019-10-17

*   Corregir el error "el puerto debe ser el tipo de número" de SQL Server

## \[3.2.0] - 2019-10-12

*   Agrega soporte para definir conexiones a través de la configuración.

## \[3.1.1] - 2019-10-10

Actualice todas las dependencias a la última (cliente y servidor). Incluye actualizaciones importantes de los siguientes módulos:

*   SAP Hana
*   Casandra
*   SQL Server
*   soporte por correo electrónico
*   Descargas de resultados de consultas XLSX y CSV
*   Autenticación SAML

Algunas integraciones no pueden ser probadas por la configuración de prueba existente. Abra un problema si se descubre alguna rotura.

## \[3.1.0] - 2019-09-30

*   Agregar configuración de nombre de cookie
*   Agregar configuración de contraseña de administrador

## \[3.0.2] - 2019-09-01

*   Quita la comprobación de actualización de la versión npm y el elemento de configuración relacionado `disableUpdateCheck`

## \[3.0.1] - 2019-09-01

SQLPad v3 es un rediseño / actualización de la interfaz de usuario junto con un gran cambio en la estructura de archivos y un cambio en la configuración. Ha estado en "beta" durante bastante tiempo, y si está ejecutando la última imagen de Docker o ejecutando una compilación reciente de master, ya lo ha estado usando.

### Funciones

*   Las URL de los resultados de las consultas se convertirán en vínculos
*   Compatibilidad con la autenticación SAML
*   Recordar el id de conexión seleccionado / alternancia de esquema
*   Tiempo de sesión configurable y secreto
*   Se ha agregado compatibilidad con archivos de configuración JSON e INI. El archivo debe configurarse usando `key` campos encontrados en [configItems.js](https://github.com/sqlpad/sqlpad/blob/master/server/lib/config/config-items.js). La ruta predeterminada del archivo de configuración es `$HOME/.sqlpadrc` y puede especificarse de otro modo utilizando `--config` a través de la línea de comandos o `SQLPAD_CONFIG` variable de entorno.

### Cambios de última hora

*   Los indicadores de la CLI se han cambiado para usar la clave de elemento de configuración (#460)
*   La ruta de base de datos predeterminada ya no se utiliza si la ruta de base de datos no se proporciona en la configuración. El valor predeterminado anterior era `$HOME/sqlpad/db`.
*   La ruta predeterminada del archivo de configuración ya no se usa. El valor predeterminado anterior era `$HOME/.sqlpadrc`.
*   Se ha quitado la interfaz de usuario de configuración. Véase https://github.com/sqlpad/sqlpad/issues/447.
*   los indicadores cli en .sqlpadrc JSON guardado ya no se usan para los valores de configuración. En su lugar, estas claves de configuración deben cambiarse por el `key` encontrado en `configItems.js`. Por ejemplo, en lugar de `dir` o `db`uso `dbPath`. En lugar de `cert-passphrase` uso `certPassphrase`etc.
*   `--save` y `--forget` Los indicadores de CLI ya no se admiten

### Fija

*   Corregir la vista previa que se queda después de la selección de la consulta
*   Corregir la entrada de etiquetas/búsquedas en la lista de consultas
*   Agregar indicador de carga para la barra lateral del esquema
*   Corregir el usuario que necesita iniciar sesión de nuevo después de registrarse
*   Menú de aplicaciones de corrección para usuarios que no son administradores
*   Corregir el editor congelado después del error de consulta

## \[3.0.0] - 2019-09-01

Esta compilación está rota. lo siento :(

## \[3.0.0-beta.1] - 25/06/2019

La versión beta para la versión 3 se puede instalar a través de la última imagen de Docker, o mediante la instalación a través de npm que hace referencia a la versión exacta o la etiqueta beta.

SQLPad v3 es compatible con los archivos de base de datos SQLPad v2, y es principalmente un rediseño / actualización de la interfaz de usuario y un cambio grande en la estructura de archivos. Pruébalo y si no estás listo para ello, vuelve a v2 y todo debería funcionar.

#### Actualización de la interfaz de usuario del editor primero

Los componentes de la interfaz de usuario que antes se basaban en los componentes de la interfaz de usuario de arranque ahora se reemplazan por componentes personalizados. El magenta se adopta como un color secundario.

Las páginas de administración y listado (consultas, conexiones, usuarios y configuración) se han movido a cajones laterales, lo que permite la administración y navegación de las cosas sin salir de la consulta actual. El editor de consultas es el foco principal de la aplicación.

Las barras de herramientas del editor de consultas se han consolidado en una sola barra para maximizar el uso del espacio en la página.

Los cambios no guardados en una consulta guardada anteriormente ahora se guardan, lo que solicita al usuario que restaure en la siguiente apertura. Esto no está habilitado para cambios no guardados en consultas "nuevas", ya que podría convertirse en una molestia, pero se puede agregar si hay interés.

El gráfico de resultados de la consulta se ha movido a un panel de tamaño variable más pequeño junto a la consulta SQL en lugar de colocarse en una ficha. Esto afecta al tamaño disponible para el gráfico, pero lo lleva a la vista predeterminada, lo que permite modificar la consulta sin cambiar las pestañas.

La barra lateral del esquema ahora puede estar oculta y ahora se puede buscar. También se ha reescrito para representar árboles grandes de manera eficiente.

La cuadrícula de resultados de la consulta ya no tiene barras de datos para los valores numéricos, ya que no tenía sentido para todos los valores numéricos. La lógica de visualización del valor de fecha se ha modificado para mostrar solo las marcas de tiempo si se detectan marcas de tiempo. Cuando se muestran marcas de tiempo, se muestra la marca de tiempo completa del objeto de fecha de JavaScript.

## \[2.8.1] - 2019-03-07

*   Corregir el oauth de Google para el cierre de la API de Google+

## \[2.8.0] - 2018-10-17

*   Agregar descripción de la columna postgres a la barra lateral del esquema
*   Registrar id de usuario y correo electrónico en modo de depuración
*   Reemplazar el almacén de sesiones basado en memoria por el basado en archivos

## \[2.7.1] - 2018-08-02

*   Corregir el editor de consultas que no responde a la entrada después del desplazamiento del resultado de la consulta

## \[2.7.0] - 2018-07-01

*   Agregue compatibilidad opcional con odbc. Ver [Página wiki de ODBC](https://github.com/sqlpad/sqlpad/wiki/ODBC) para más detais

## \[2.6.1] - 2018-06-17

*   Corregir la carga del editor de consultas cuando las conexiones se cargan lentamente

## \[2.6.0] - 2018-05-05

*   Añadir soporte de Cassandra
*   Ordenar el menú desplegable del controlador en el formulario de conexión

## \[2.5.8] - 2018-05-05

*   Extender la cuadrícula de datos a todo el ancho del contenedor

## \[2.5.7] - 2018-05-04

*   Implementar la cuadrícula de datos mediante react-virtualized (corrige columnas de tamaño variable)
*   Corregir el error de representación de gráficos cuando se hace referencia a las columnas que ya no devuelven la consulta
*   Permitir la búsqueda de usuarios sin distinción de mayúsculas y minúsculas por correo electrónico (soluciona problemas de registro/inicio de sesión que distinguen entre mayúsculas y minúsculas)

## \[2.5.6] - 2018-04-25

*   Revertir la corrección de gráficos de 2.5.5 que impide que los gráficos se representen

## \[2.5.5] - 2018-04-23

*   Quitar la protección frameguard (corrige incrustaciones de iframe)
*   Usar CDN para la fuente bootstrap (corrige los iconos que faltan al usar baseUrl)
*   Actualizar dependencias
*   Corregir 0 valores clasificados como cadena en los resultados de la consulta
*   Corregir el error del gráfico de la interfaz de usuario al hacer referencia a columnas que ya no devuelve la consulta
*   Corregir las consultas posteriores al bloqueo de SQLPad que exceden el límite máximo de filas
*   Mostrar solo el mensaje abierto de registro de administrador si el registro de administrador está realmente abierto
*   Corregir baseUrl de error indefinido
*   Mucha refactorización de controladores
    *   Implementaciones de controladores ahora consolidadas en /server/drivers
    *   Todos los controladores ahora probados
*   Nuevo proceso de compilación de Docker/Dockerfile de nivel raíz

## \[2.5.4] - 2018-04-01

*   Se ha corregido el enlace de restablecimiento de contraseña al usar la URL base

## \[2.5.3] - 2018-03-29

*   Corregir el esquema de SAP HANA que no se almacena en caché debido a los puntos en el nombre de la columna

## \[2.5.2] - 2018-03-27

*   Corregir error al actualizar la conexión
*   Corregir el uso de SQLPAD_BASE_URL / --base-url

## \[2.5.1] - 2018-02-05

*   Corregir la expiración temprana de la sesión / extender la expiración de la sesión cada respuesta

## \[2.5.0] - 2018-02-05

*   Agregado soporte para SAP HANA (ccmehil)
*   Muchas mejoras de seguridad
    *   Mayoría de las dependencias actualizadas
    *   Prácticas recomendadas de seguridad de expressjs implementadas
    *   Se ha añadido middleware para cascos
    *   Sesión rápida utilizada en lugar de sesión de cookies
    *   Secretos de cookies generados aleatoriamente
    *   Las sesiones ya caducan (1 hora)
    *   Cantidad limitada de información de configuración enviada al front-end
*   Estilo actualizado para las páginas de administración de usuario y conexión (recuperando tablas aburridas. actualizaciones al resto de la aplicación a seguir)
*   Actualizaciones de la barra lateral de esquemas
    *   Limita la barra lateral del esquema presto al esquema si se proporciona en la información de conexión
    *   Etiqueta eliminada (ver) en las vistas

## \[2.4.2] - 2017-12-27

*   Se ha corregido la consulta de información de esquema genérica para la intercalación que distingue entre mayúsculas y minúsculas

## \[2.4.1] - 2017-12-03

*   Se ha corregido la desaparición de la tabla de datos después de que vis cambiara el tamaño

## \[2.4.0] - 2017-12-03

*   Se agregaron paneles de tamaño variable al editor de consultas
*   Se ha agregado formateador SQL al editor de consultas (KochamCie)
*   Se ha agregado el botón de consulta de clonación al editor de consultas
*   Se ha agregado un mensaje al navegar fuera de las ediciones de consultas no guardadas
*   Gráficos de barras rediseñados en la cuadrícula de datos a un diseño más mínimo
*   Barra de navegación del editor de consultas rediseñada
    *   Saca la entrada del nombre de consulta fuera de modal
    *   Agrega el indicador de cambios no guardados al botón Guardar
    *   Agrega documentación de acceso directo/sugerencia a modal
    *   Utiliza enlaces de navegación en lugar de botones para reducir el ruido visual
*   Accesos directos del editor actualizados
    *   Ejecución de la consulta ahora `ctrl+return` o `command+return`
    *   Dar formato a la consulta con `shift+return`
*   TauCharts actualizado a la última versión
*   Implementado react-router y soluciona cargas de página innecesarias en la navegación
*   Libs de JavaScript del proveedor restante incluido
*   Se ha eliminado la dependencia de fuente externa impresionante de CDN
*   Se ha corregido el manejo de bigint para MySQL
*   Visualización de fecha fija en gráficos
*   Visualización de fecha fija para MySQL
*   El contenido fijo de la celda no se expande cuando se expande la celda
*   Se ha corregido la actualización involuntaria de la página en los clics de enlace de la barra lateral del editor
*   Se han corregido errores de diseño de flexbox
*   Mucha refactorización de front-end miscelánea

## \[2.3.2] - 2017-10-21

*   Corregir el uso de la configuración --base-url
*   Estilo de diseño refactorizado para usar flexbox css

## \[2.3.1] - 2017-10-07

*   Forzar la ausencia de caché en las solicitudes de búsqueda (soluciona algunos problemas extraños de IE)
*   Corregir el punto de entrada de Docker

## \[2.3.0] - 2017-09-04

*   Nuevas características
    *   Agregado soporte de activación de socket systemd (epeli)
    *   Se ha añadido una opción para deshabilitar la comprobación de actualizaciones
    *   Columnas de cuadrícula de datos de tamaño variable (ligeramente defectuosas)
*   Fija
    *   Corrige la barra lateral del esquema MySQL que muestra bases de datos adicionales
    *   Corrige la pérdida de precisión de los números en la cuadrícula de la interfaz de usuario (incluso si eran texto)
    *   Corrige el controlador Presto
    *   Corrige las advertencias de obsolescencia de React
    *   Corrige la visualización incorrecta de la fecha en la interfaz de usuario
        *   Todas las fechas estaban siendo localizadas. ahora se muestra sin localización
*   Notas de compatibilidad
    *   Nodo v6.x ahora requerido como mínimo

## \[2.2.0] - 2017-05-29

*   Se agregó soporte de proxy SOCKS para postgres (brysgo)

## \[2.2.0-beta2] - 2017-03-19

*   Versión corregida mostrada en about modal

## \[2.2.0-beta1] - 2017-03-18

*   Se ha corregido la rareza de la etiqueta de consulta de la rareza de la v1 anterior
*   0 iniciales conservados en los resultados de la consulta y tratados como cadenas en lugar de números
*   compatibilidad con certificados SSL postgres (johicks y nikicat)
*   Compatibilidad con esquemas fijos de caja v1 (mikethebeer)
*   Autocompletar ingenuo
*   pantalla de administración de conexión refactorizada
*   sistema de compilación modificado para bifurcar create-react-app

## \[2.1.3] - 2017-01-28

*   Garantizar un orden estricto de inicio de la base de datos (vweevers)
*   Mejore el rendimiento del editor de consultas/reduzca el retraso del editor SQL

## \[2.1.2] - 2016-12-09

*   Corregir vista de solo gráfico que no muestra gráficos
*   Corregir la búsqueda del editor de consultas
*   Actualizar dependencias

## \[2.1.1] - 2016-11-29

*   Corrección: desactivación de enlaces en detalles de consulta modal (vweevers)
*   Corrección: El indicador de carga de la pestaña Vis se comporta igual que la pestaña de consulta, ocultando el error al volver a ejecutar (vweevers)
*   Corrección: Gráficos renderizados perezosamente. La cuadrícula de resultados de la consulta se carga más rápido, los resultados de consultas grandes no bloquearán el navegador hasta que intente trazar. (vweevers)
*   Corrección: Ocultar el formulario de autenticación local si DISABLE_USERPASS_AUTH=true

## \[2.1.0] - 2016-11-20

*   Ejecute https a través de sqlpad directamente (consulte la configuración adicional) (jameswinegar)
*   Admite caracteres no ingleses al descargar archivos (askluyao)
*   Representar correctamente las marcas de tiempo booleanas/nulas

## \[2.0.0] - 2016-10-12

*   (Consulte las notas de la versión beta 1 - 3)

## \[2.0.0-beta3] - 2016-10-11

*   Funcionalidad de restablecimiento de contraseña/forogot password agregada
    *   Los administradores pueden generar enlaces de restablecimiento manualmente
    *   Si smtp está configurado, el vínculo Olvidé mi contraseña está habilitado
*   CORREO ELECTRÓNICO
*   Configuración:
    *   Lista de comprobación agregada para OAuth y correo electrónico
    *   El elemento está deshabilitado en la interfaz de usuario si el valor lo proporciona el entorno o la cli
    *   Los valores confidenciales sólo se enmascaran si las variables de entorno

## \[2.0.0-beta2] - 2016-09-19

*   Pasar a la arquitectura de aplicación de una sola página
*   Nueva animación de carga de consultas
*   Opciones de título y exportación agregadas a las vistas de solo gráfico/tabla
*   Agregar compatibilidad con Presto DB
*   Autenticación básica disponible para la API que no es de administración
*   Más mejoras de rendimiento
*   Varias correcciones de errores
*   Más limpieza de código

## \[2.0.0-beta1] - 2016-09-01

*   Actualizaciones de diseño de la interfaz de usuario *en todas partes*
*   Listado de consultas:
    *   Obtener una vista previa del contenido de la consulta colocando el cursor sobre la lista de consultas
    *   se ha corregido la rareza ocasional de búsqueda/filtro
*   Editor de consultas:
    *   La barra lateral del esquema ya no separa las vistas y las tablas en la jerarquía
    *   Nueva cuadrícula de resultados
        *   Trazado de barras en línea representado para valores numéricos
        *   Problemas de visualización corregidos para determinados navegadores
    *   Nuevo widget de etiquetas para una entrada más limpia
    *   El nombre de la pestaña Explorador ahora refleja el nombre de la consulta
    *   Biblioteca taucharts actualizada con gráficos de barras apiladas
    *   Los gráficos de líneas y de dispersión pueden tener habilitados los filtros de gráficos
    *   'Mostrar configuración avanzada' en vis Editor ahora tiene algunas configuraciones avanzadas dependiendo del gráfico (y min/max, mostrar línea de tendencia, mostrar filtro)
    *   Cambiar entre fichas SQL/VIS no restablecerá los conmutadores de la serie de gráficos
    *   Los enlaces de solo tabla/gráfico se pueden establecer para que ya no requieran inicio de sesión (consulte la página de configuración)
*   Configuración:
    *   Entradas y etiquetas de configuración específicas: no más entradas de clave/valor de extremo abierto
    *   Configuración del entorno actual documentada con ventanas emergentes de asistencia
*   Notificación de actualización movida en la aplicación
*   Bajo el capó
    *   Se actualizaron todas las dependencias de código
    *   reelaboró parte del código básico para facilitar el desarrollo futuro
*   Problemas conocidos / aún no implementados:
    *   La entrada de etiquetas de consulta no permite la creación
    *   La actualización automática de consultas aún no se ha implementado

## \[1.17.0]

*   Las consultas postgres vacías (como ejecutar solo un comentario) ya no bloquean SQLPAD
*   Las vistas materializadas se incluyen en la barra lateral del esquema para postgres

## \[1.16.0]

*   SQLPad ahora se puede montar bajo una ruta de url base proporcionando el indicador de cli --base-url o SQLPAD_BASE_URL variable env
*   Taucharts actualizado a 0.9.1
*   Las leyendas ahora se incluyen al guardar imágenes de gráficos png

## \[1.15.0]

*   Muchas dependencias del lado del cliente y del lado del servidor actualizadas
*   Agregue la capacidad de enlazar a una dirección IP específica a través del indicador --ip o la variable de entorno SQLPAD_IP
*   Se han eliminado las entradas de ordenación de los gráficos de barras. (En su lugar, se puede influir en la ordenación de gráficos mediante ORDER BY en la consulta SQL).

## \[1.14.0]

*   Agregar la capacidad de desactivar la localización de fechas (agregue el elemento de configuración "localizar" establecido en "false")

## \[1.13.0]

*   Agregar el indicador --debug a la cli de SQLPad para habilitar el registro adicional
*   El puerto y la frase de contraseña se pueden establecer a través de variables de entorno SQLPAD_PORT y SQLPAD_PASSPHRASE

## \[1.12.0]

*   Agregar soporte para Crate.io

## \[1.11.0]

*   Consulta de actualización automática cada x segundos
*   Corregir el bloqueo cuando un usuario no registrado intenta iniciar sesión

## \[1.10.0]

*   Las conexiones MySQL ahora pueden ser antiguas / inseguras antes del sistema de autenticación 4.1
*   ahora están disponibles para mostrar sólo el gráfico o la cuadrícula de datos

## \[1.9.0]

*   Los gráficos ahora son manejados por la genial biblioteca tauCharts. Es un poco más rápido, tiene facetas, gramática de conceptos gráficos, maneja mejor los datos de series temporales, líneas de tendencia.
*   Al cambiar los tipos de gráficos, SQLPad recordará y volverá a aplicar las selecciones de campo cuando corresponda.
*   Archivos de base de datos SQLPad compactados cada 10 minutos, en lugar de una vez al día
*   El estilo de la página de registro es fijo.
*   Los botones Copiar al portapapeles del nombre del elemento de esquema ya están disponibles. Optar por crear un elemento de configuración `showSchemaCopyButton` Para `true`.
*   Los resultados de la consulta ahora se pueden descargar como archivo xlsx. (el enlace se ocultará si las descargas csv están deshabilitadas)

## \[1.8.2]

*   La contraseña de conexión ya no es visible en la pantalla de conexión.

## \[1.8.1]

*   Se evitan los encabezados de contenido duplicados cuando el nombre de archivo csv contiene comas.

## \[1.8.0]

*   Autenticación ahora administrada por Passport.js
*   La estrategia de autenticación de nombre de usuario/contraseña se puede deshabilitar estableciendo la variable de entorno DISABLE_USERPASS_AUTH
*   La estrategia de Google OAuth se puede habilitar configurando variables de entorno de GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y PUBLIC_URL
*   La consulta se puede publicar en el webhook de Slack cuando se guarda. Para habilitarlo, cree un elemento de configuración con la clave "slackWebhook" y establezca el valor en una URL de WebHook entrante de Slack.
*   Dominios de lista blanca para la administración de nombres de usuario mediante la configuración de la variable de entorno WHITELISTED_DOMAINS
*   Conexión de consulta ahora seleccionada de forma predeterminada si solo existe una

## \[1.7.0]

*   Las etiquetas ahora se parecen a las etiquetas
*   Typeahead añadido para facilitar la creación de etiquetas

## \[1.6.0]

*   Limpieza de código

## \[1.5.1]

*   Quitar el registro de consola utilizado para la depuración

## \[1.5.0]

*   Vertica ahora es compatible a través del controlador Vertica
*   Los CSV ya no se generan si están deshabilitados
*   optimizaciones realizadas para el procesamiento de información de esquema

## \[1.4.1]

*   Mejora del rendimiento de la información de árbol/esquema de base de datos

## \[1.4.0]

*   Los gráficos se pueden guardar como imágenes

## \[1.3.0]

*   Solución alternativa para controlar varias instrucciones mediante el controlador Postgres
*   Corrección para proporcionar MAX_SAFE_INTEGER si no está definida

## \[1.2.1]

*   los resultados de las consultas están limitados a 50.000 registros. Esto se puede cambiar agregando una clave de configuración "queryResultMaxRows" y proporcionando el número máximo de filas que desea devolver.
*   Correcciones de errores menores
*   Selección de texto habilitada en los resultados de la consulta
*   información de esquema ahora almacenada en caché
*   El puerto de conexión es opcional en la interfaz de usuario

## \[1.2.0]

*   Se ha agregado la propiedad port a las conexiones
*   Se ha añadido el sistema de configuración
*   Las descargas CSV se pueden desactivar a través de la configuración. Agregue un nuevo elemento con la clave "allowCsvDownload" con el valor "false" para deshabilitar.

## \[1.1.0]

*   Agregue soporte inicial de Vertica mediante el uso del controlador Postgres

## \[1.0.0]

*   Lanzamiento de SQLPad
